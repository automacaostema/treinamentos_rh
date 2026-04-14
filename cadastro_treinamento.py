import streamlit as st
import pandas as pd
import os
import io
import time
from datetime import datetime, timedelta
from supabase import create_client, Client

# ReportLab para geração de PDF
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.platypus import Image as RLImage
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER

# ──────────────────────────────────────────────
# Configuração da página e Supabase
# ──────────────────────────────────────────────
st.set_page_config(page_title="RH - Controle de Treinamentos", layout="centered")

# ──────────────────────────────────────────────
# Lógica de Autenticação Simples
# ──────────────────────────────────────────────
def verificar_login():
    """Exibe tela de login e bloqueia o app se não autenticado."""
    if "autenticado" not in st.session_state:
        st.session_state.autenticado = False

    if not st.session_state.autenticado:
        st.markdown("<br><br>", unsafe_allow_html=True)
        col1, col2, col3 = st.columns([1, 2, 1])
        with col2:
            with st.container(border=True):
                st.title("🔐 Acesso RH")
                usuario = st.text_input("Usuário")
                senha = st.text_input("Senha", type="password")
                
                if st.button("Entrar", type="primary", use_container_width=True):
                    # Credenciais simples para uso interno
                    if usuario == "rh_stema" and senha == "rh123":
                        st.session_state.autenticado = True
                        st.rerun()
                    else:
                        st.error("Usuário ou senha incorretos.")
        st.stop()

verificar_login()

# CONEXÃO COM SUPABASE
# No painel da Vercel ou no arquivo .streamlit/secrets.toml, insira:
# SUPABASE_URL = "https://your-project.supabase.co"
# SUPABASE_KEY = "your-anon-key"
try:
    url: str = st.secrets["SUPABASE_URL"]
    key: str = st.secrets["SUPABASE_KEY"]
    supabase: Client = create_client(url, key)
except Exception as e:
    st.error("Erro na conexão com Supabase. Verifique suas credenciais no st.secrets.")
    st.stop()

LOGO_PATH = os.path.join(os.path.dirname(__file__), "logo.png")

# ──────────────────────────────────────────────
# Labels e Estilos PDF
# ──────────────────────────────────────────────
LABELS = {
    "tipo": "Tipo",
    "atividade": "Atividade",
    "duracao_horas": "Duração (horas)",
    "responsavel": "Responsável",
    "data_programada": "Data Programada",
    "data_realizada": "Data Realizada",
    "dias_eficacia": "Prazo p/ Avaliação (dias)",
    "vencimento_eficacia": "Vencimento da Avaliação",
    "criterios": "Critérios de Avaliação",
    "responsavel_aval": "Responsável pela Avaliação",
}
COR_PRIMARIA = colors.HexColor("#1A3D6B")
COR_CABECALHO = colors.HexColor("#E8EDF4")
COR_LINHA_PAR = colors.HexColor("#F7F9FC")
COR_BORDA = colors.HexColor("#C5CDD9")

# ──────────────────────────────────────────────
# Funções de Dados e Alertas
# ──────────────────────────────────────────────
def get_treinamentos():
    res = supabase.table("treinamentos").select("*").execute()
    return pd.DataFrame(res.data)

def get_programados():
    res = supabase.table("treinamentos_programados").select("*").execute()
    return pd.DataFrame(res.data)

def salvar_treinamento(dados: dict):
    return supabase.table("treinamentos").insert(dados).execute()

def salvar_programado(dados: dict):
    return supabase.table("treinamentos_programados").insert(dados).execute()

def excluir_programado(id_prog):
    return supabase.table("treinamentos_programados").delete().eq("id", id_prog).execute()

def excluir_treinamento(id_trein):
    return supabase.table("treinamentos").delete().eq("id", id_trein).execute()

def atualizar_status_eficacia(id_trein, concluido=True):
    return supabase.table("treinamentos").update({"eficacia_concluida": concluido}).eq("id", id_trein).execute()

def exibir_alertas_vencimento():
    """Exibe alertas no topo do app para avaliações próximas do vencimento ou atrasadas."""
    df = get_treinamentos()
    if df.empty or 'vencimento_eficacia' not in df.columns:
        return
    
    # Se a coluna eficacia_concluida não existir no DF (caso o Supabase demore a refletir), inicializa
    if 'eficacia_concluida' not in df.columns:
        df['eficacia_concluida'] = False
    
    hoje = datetime.now().date()
    alertas_placeholder = st.empty()
    
    with alertas_placeholder.container():
        for _, row in df.iterrows():
            # Só mostra alerta se FOR Treinamento, tiver vencimento e NÃO estiver concluída
            venc_str = row.get('vencimento_eficacia')
            if not venc_str or row.get('tipo') != 'Treinamento' or row.get('eficacia_concluida') == True:
                continue
            
            try:
                venc_date = datetime.strptime(venc_str, '%d/%m/%Y').date()
                delta = (venc_date - hoje).days
                
                if 0 <= delta <= 3:
                    st.warning(f"⚠️ **Atenção:** Faltam {delta} dias para vencer a avaliação do treinamento: **{row['atividade']}** (Vence em: {venc_str})")
                elif delta < 0:
                    atraso = abs(delta)
                    st.error(f"🚨 **Atraso:** A avaliação do treinamento **{row['atividade']}** está atrasada há {atraso} dias! (Vencimento era: {venc_str})")
            except Exception:
                continue

# ──────────────────────────────────────────────
# Função geradora de PDF (Lógica Mantida)
# ──────────────────────────────────────────────
def gerar_pdf(registro: pd.Series, num_doc: str) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, leftMargin=1.8*cm, rightMargin=1.8*cm, topMargin=1.5*cm, bottomMargin=2*cm)
    largura_util = A4[0] - 3.6 * cm
    story = []
    estilos = getSampleStyleSheet()
    
    # Estilos de parágrafo
    estilo_ndoc = ParagraphStyle("ndoc", parent=estilos["Normal"], fontSize=10, textColor=COR_PRIMARIA, alignment=TA_RIGHT)
    estilo_titulo = ParagraphStyle("titulo_doc", parent=estilos["Normal"], fontSize=15, leading=18, textColor=COR_PRIMARIA, alignment=TA_CENTER, fontName="Helvetica-Bold")
    estilo_label = ParagraphStyle("label", parent=estilos["Normal"], fontSize=8, textColor=colors.HexColor("#556070"), fontName="Helvetica-Bold", leading=10)
    estilo_valor = ParagraphStyle("valor", parent=estilos["Normal"], fontSize=10, textColor=colors.black, leading=14)
    estilo_criterios = ParagraphStyle("criterios", parent=estilos["Normal"], fontSize=9, textColor=colors.black, leading=14)

    # Logo
    if os.path.exists(LOGO_PATH):
        logo = RLImage(LOGO_PATH, width=4 * cm, height=1.6 * cm, kind="proportional")
    else:
        logo = Paragraph("<b>LOGO</b>", estilos["Normal"])

    # Logo e Título (Acima da linha azul)
    tabela_logo = Table([[logo, ""]], colWidths=[largura_util * 0.5, largura_util * 0.5])
    tabela_logo.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP")]))
    story.append(tabela_logo)
    
    story.append(Paragraph("FORMULÁRIO DE TREINAMENTO FR-RH-01 - REV00", estilo_titulo))
    story.append(Spacer(1, 0.2 * cm))
    
    # Linha Azul
    story.append(HRFlowable(width="100%", thickness=2, color=COR_PRIMARIA, spaceAfter=5))
    
    # Nº Doc (Abaixo da linha azul, à direita)
    ndoc_par = Paragraph(f"<font color='#556070'>Nº Doc:</font> <b>{'______' if not num_doc else num_doc}</b>", estilo_ndoc)
    story.append(ndoc_par)
    story.append(Spacer(1, 0.5 * cm))

    CAMPOS_GRADE = ["tipo", "atividade", "duracao_horas", "responsavel", "data_programada", "data_realizada"]
    dados_grade = []
    for i, campo in enumerate(CAMPOS_GRADE):
        lbl = Paragraph(LABELS.get(campo, campo).upper(), estilo_label)
        val_str = str(registro.get(campo, "—")) if pd.notna(registro.get(campo, "")) else "—"
        val = Paragraph(val_str, estilo_valor)
        dados_grade.append([lbl, val])

    tabela_grade = Table(dados_grade, colWidths=[largura_util * 0.35, largura_util * 0.65])
    estilo_tabela = [
        ("BOX", (0, 0), (-1, -1), 0.5, COR_BORDA),
        ("INNERGRID", (0, 0), (-1, -1), 0.3, COR_BORDA),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]
    for i in range(len(dados_grade)):
        bg = COR_LINHA_PAR if i % 2 == 0 else colors.white
        estilo_tabela.append(("BACKGROUND", (0, i), (-1, i), bg))
    
    tabela_grade.setStyle(TableStyle(estilo_tabela))
    story.append(tabela_grade)

    if str(registro.get("tipo", "")) == "Treinamento":
        story.append(Spacer(1, 0.5 * cm))
        story.append(Paragraph("AVALIAÇÃO DE EFICÁCIA", ParagraphStyle("sec", parent=estilos["Normal"], fontSize=11, fontName="Helvetica-Bold", textColor=COR_PRIMARIA)))
        dados_ef = [
            [Paragraph(LABELS["dias_eficacia"].upper(), estilo_label), Paragraph(LABELS["vencimento_eficacia"].upper(), estilo_label), Paragraph(LABELS["responsavel_aval"].upper(), estilo_label)],
            [Paragraph(str(registro.get("dias_eficacia", "—")), estilo_valor), Paragraph(str(registro.get("vencimento_eficacia", "—")), estilo_valor), Paragraph(str(registro.get("responsavel_aval", "—")), estilo_valor)]
        ]
        tabela_ef = Table(dados_ef, colWidths=[largura_util/3, largura_util/3, largura_util/3])
        tabela_ef.setStyle(TableStyle([
            ("BOX", (0, 0), (-1, -1), 0.5, COR_BORDA),
            ("INNERGRID", (0, 0), (-1, -1), 0.3, COR_BORDA),
            ("BACKGROUND", (0, 0), (-1, 0), COR_LINHA_PAR),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))
        story.append(tabela_ef)
        
        crit_val = str(registro.get("criterios", "")).strip()
        if crit_val and crit_val != "nan":
            story.append(Spacer(1, 0.3 * cm))
            tabela_crit = Table([[Paragraph("CRITÉRIOS DE AVALIAÇÃO", estilo_label)], [Paragraph(crit_val, estilo_criterios)]], colWidths=[largura_util])
            tabela_crit.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), COR_CABECALHO), ("BOX", (0, 0), (-1, -1), 0.5, COR_BORDA)]))
            story.append(tabela_crit)

        # Novo quadro: Descrição da Avaliação da eficácia (em branco para preenchimento manual)
        story.append(Spacer(1, 0.5 * cm))
        story.append(Paragraph("DESCRIÇÃO DA AVALIAÇÃO DA EFICÁCIA", ParagraphStyle("sec", parent=estilos["Normal"], fontSize=11, fontName="Helvetica-Bold", textColor=COR_PRIMARIA)))
        
        # Quadro em branco com altura fixa
        tabela_desc = Table([[""]], colWidths=[largura_util], rowHeights=[4 * cm])
        tabela_desc.setStyle(TableStyle([
            ("BOX", (0, 0), (-1, -1), 0.5, COR_BORDA),
            ("BACKGROUND", (0, 0), (-1, -1), colors.white),
        ]))
        story.append(tabela_desc)
        
        # Campo de assinatura
        story.append(Spacer(1, 0.3 * cm))
        estilo_assinatura = ParagraphStyle("assinatura", parent=estilos["Normal"], fontSize=10, textColor=colors.black, alignment=TA_LEFT)
        story.append(Paragraph("<b>Assinatura do responsável:</b> ____________________________________________________", estilo_assinatura))

    story.append(Spacer(1, 1 * cm))
    story.append(Paragraph(f"Documento gerado em {datetime.now().strftime('%d/%m/%Y às %H:%M')}", ParagraphStyle("rodape", alignment=TA_CENTER, fontSize=7, textColor=colors.grey)))
    doc.build(story)
    buffer.seek(0)
    return buffer.read()

# Exibe os alertas de vencimento no topo (fora das abas)
exibir_alertas_vencimento()

# ──────────────────────────────────────────────
# Abas principais
# ──────────────────────────────────────────────
aba_cadastro, aba_programados, aba_dashboard = st.tabs([
    "📝 Cadastro", 
    "📅 Programados", 
    "📊 Dashboard"
])

# ══════════════════════════════════════════════
# ABA 1 — Cadastro
# ══════════════════════════════════════════════
with aba_cadastro:
    st.title("Cadastro de Treinamento RH")
    tipo = st.selectbox("Tipo:", ["Treinamento", "Informativo"], index=None, placeholder="Selecione...")
    with st.form("form_treinamento", clear_on_submit=True):
        atividade = st.text_input("Atividade:")
        col_horas, col_resp = st.columns(2)
        duracao_horas = col_horas.number_input("Duração (horas):", min_value=0.1, step=0.5, format="%.1f")
        responsavel = col_resp.text_input("Responsável:")
        data_realizada = st.date_input("Data Realizada", datetime.now())
        
        dias, criterios, vencimento = 0, "", ""
        if tipo == "Treinamento":
            st.divider()
            dias = st.number_input("Prazo para avaliação (dias)", min_value=1, value=30)
            vencimento = (data_realizada + timedelta(days=dias)).strftime('%d/%m/%Y')
            responsavel_aval = st.text_input("Responsável pela Avaliação:")
            criterios = st.text_area("Critérios de avaliação")

        submitted = st.form_submit_button("Salvar no Banco de Dados")
        if submitted:
            # Validação de campos obrigatórios
            erros = []
            if not tipo: erros.append("Tipo")
            if not atividade: erros.append("Atividade")
            if not responsavel: erros.append("Responsável")
            
            if tipo == "Treinamento":
                if not responsavel_aval: erros.append("Responsável pela Avaliação")
                if not criterios: erros.append("Critérios de Avaliação")
            
            if erros:
                st.error(f"Por favor, preencha os campos obrigatórios: {', '.join(erros)}")
            else:
                with st.spinner('Salvando no Supabase...'):
                    novo_dado = {
                        "tipo": tipo, 
                        "atividade": atividade, 
                        "duracao_horas": duracao_horas, 
                        "responsavel": responsavel, 
                        "data_programada": "", 
                        "data_realizada": data_realizada.strftime('%d/%m/%Y'), 
                        "dias_eficacia": str(dias) if tipo == "Treinamento" else "", 
                        "vencimento_eficacia": vencimento if tipo == "Treinamento" else "", 
                        "criterios": criterios if tipo == "Treinamento" else "",
                        "responsavel_aval": responsavel_aval if tipo == "Treinamento" else ""
                    }
                    salvar_treinamento(novo_dado)
                    st.success("Gravado com sucesso no Supabase!")
                    time.sleep(1)
                    st.rerun()

    if st.checkbox("Visualizar Base"):
        df_viz = get_treinamentos()
        if not df_viz.empty:
            # Oculta colunas técnicas para o usuário
            cols_to_show = [c for c in df_viz.columns if c not in ['id', 'created_at', '_label', 'dt_real_format']]
            st.dataframe(df_viz[cols_to_show])
        else:
            st.info("Nenhum dado encontrado no banco.")

    st.divider()
    st.subheader("Gestão de Eficácia")
    df_base = get_treinamentos()
    
    # Se a coluna eficacia_concluida não existir no DF, inicializa para evitar erros na lógica abaixo
    if not df_base.empty and 'eficacia_concluida' not in df_base.columns:
        df_base['eficacia_concluida'] = False

    with st.expander("✅ Concluir Avaliação de Eficácia", expanded=True):
        if not df_base.empty:
            df_base["_label"] = df_base["atividade"].fillna("") + " (" + df_base["data_realizada"].fillna("") + ")"
            # Filtra apenas treinamentos que ainda não foram avaliados
            df_pendentes = df_base[(df_base['tipo'] == 'Treinamento') & (df_base['eficacia_concluida'] == False)]
            
            if not df_pendentes.empty:
                sel_ef = st.selectbox("Selecione o treinamento para concluir a avaliação:", 
                                     options=df_pendentes.index, 
                                     format_func=lambda i: df_pendentes.at[i, "_label"])
                
                if st.button("Marcar Avaliação como Concluída", type="primary"):
                    atualizar_status_eficacia(int(df_pendentes.loc[sel_ef, 'id']))
                    st.success("Avaliação marcada como concluída! O alerta sairá do topo.")
                    time.sleep(1)
                    st.rerun()
            else:
                st.info("Nenhuma avaliação de eficácia pendente no momento.")
        else:
            st.info("Nenhum treinamento cadastrado.")

    st.divider()
    st.subheader("Exportar PDF")
    if not df_base.empty:
        col_sel, col_ndoc = st.columns([3, 1])
        opcao_sel = col_sel.selectbox("Selecione para PDF:", options=df_base.index, format_func=lambda i: df_base.at[i, "_label"])
        num_doc = col_ndoc.text_input("Nº Doc")
        if st.download_button("Baixar PDF", data=gerar_pdf(df_base.loc[opcao_sel], num_doc), file_name="registro.pdf", mime="application/pdf"):
            st.success("PDF gerado!")

    with st.expander("🗑️ Excluir Registro Realizado", expanded=False):
        st.warning("Atenção: Esta ação é irreversível.")
        if not df_base.empty:
            sel_excluir = st.selectbox("Selecione o registro para excluir:", options=df_base.index, format_func=lambda i: df_base.at[i, "_label"], key="excluir_realizado")
            if st.button("Confirmar Exclusão Definitiva", type="primary"):
                excluir_treinamento(int(df_base.loc[sel_excluir, 'id']))
                st.success("Registro excluído com sucesso!")
                time.sleep(1)
                st.rerun()

# ══════════════════════════════════════════════
# ABA 2 — Programados
# ══════════════════════════════════════════════
with aba_programados:
    st.title("Treinamentos Programados")
    with st.form("form_prog", clear_on_submit=True):
        t_prog = st.selectbox("Tipo:", ["Treinamento", "Informativo"])
        a_prog = st.text_input("Atividade:")
        c1, c2 = st.columns(2)
        d_prog = c1.number_input("Duração:", min_value=0.1, step=0.5)
        dt_prog = c2.date_input("Data Programada")
        
        if st.form_submit_button("Salvar Programação") and a_prog:
            novo = {
                "tipo": t_prog, 
                "atividade": a_prog, 
                "duracao_horas": d_prog, 
                "responsavel": "", 
                "data_programada": dt_prog.strftime('%d/%m/%Y')
            }
            salvar_programado(novo)
            st.success("Programado no Supabase!")
            time.sleep(1)
            st.rerun()

    st.divider()
    st.subheader("Iniciar Programado")
    df_p = get_programados()
    if not df_p.empty:
        df_p["_label"] = df_p["atividade"].fillna("") + " (" + df_p["data_programada"].fillna("") + ")"
        
        col_sel_p, col_btn_del = st.columns([3, 1])
        sel_p = col_sel_p.selectbox("Escolha para concluir ou excluir:", options=df_p.index, format_func=lambda i: df_p.at[i, "_label"], index=None)
        
        if sel_p is not None:
            if col_btn_del.button("🗑️ Excluir", help="Excluir esta programação permanentemente"):
                excluir_programado(int(df_p.loc[sel_p, 'id']))
                st.warning("Programação excluída com sucesso!")
                time.sleep(1)
                st.rerun()

            reg_p = df_p.loc[sel_p]
            with st.form("concluir"):
                st.write(f"Concluindo: **{reg_p['atividade']}**")
                resp_p = st.text_input("Responsável:")
                dt_r_p = st.date_input("Data Realizada")
                
                # Campos de eficácia caso seja Treinamento
                dias_in, criterios_in, vencimento_in, resp_aval_in = 0, "", "", ""
                if reg_p['tipo'] == "Treinamento":
                    st.divider()
                    dias_in = st.number_input("Prazo para avaliação (dias)", min_value=1, value=30)
                    vencimento_in = (dt_r_p + timedelta(days=dias_in)).strftime('%d/%m/%Y')
                    resp_aval_in = st.text_input("Responsável pela Avaliação:")
                    criterios_in  = st.text_area("Critérios de avaliação")

                if st.form_submit_button("Concluir Treinamento"):
                    # Validação
                    erros_p = []
                    if not resp_p: erros_p.append("Responsável")
                    if reg_p['tipo'] == "Treinamento":
                        if not resp_aval_in: erros_p.append("Responsável pela Avaliação")
                        if not criterios_in: erros_p.append("Critérios de Avaliação")
                    
                    if erros_p:
                        st.error(f"Campos obrigatórios: {', '.join(erros_p)}")
                    else:
                        concluido = {
                            "tipo": reg_p['tipo'], 
                            "atividade": reg_p['atividade'], 
                            "duracao_horas": reg_p['duracao_horas'], 
                            "responsavel": resp_p, 
                            "data_programada": reg_p['data_programada'], 
                            "data_realizada": dt_r_p.strftime('%d/%m/%Y'),
                            "dias_eficacia": str(dias_in) if reg_p['tipo'] == "Treinamento" else "",
                            "vencimento_eficacia": vencimento_in if reg_p['tipo'] == "Treinamento" else "",
                            "criterios": criterios_in if reg_p['tipo'] == "Treinamento" else "",
                            "responsavel_aval": resp_aval_in if reg_p['tipo'] == "Treinamento" else ""
                        }
                    salvar_treinamento(concluido)
                    excluir_programado(int(reg_p['id']))
                    st.success("Concluido e migrado para base principal!")
                    time.sleep(1)
                    st.rerun()
    else:
        st.info("Nenhuma programação pendente.")

    st.divider()
    if st.checkbox("Visualizar Base Programada", key="vis_base_prog"):
        df_viz_p = get_programados()
        if not df_viz_p.empty:
            # Oculta colunas técnicas para o usuário
            cols_to_show_p = [c for c in df_viz_p.columns if c not in ['id', 'created_at', '_label']]
            st.dataframe(df_viz_p[cols_to_show_p])
        else:
            st.info("Nenhum dado encontrado no banco de programados.")

# ══════════════════════════════════════════════
# ABA 3 — DASHBOARD
# ══════════════════════════════════════════════
with aba_dashboard:
    st.title("📊 Dashboard de Indicadores")
    
    df_realizados = get_treinamentos()
    df_progs = get_programados()
    
    if not df_realizados.empty:
        df_realizados['dt_real_format'] = pd.to_datetime(df_realizados['data_realizada'], format='%d/%m/%Y', errors='coerce')
    
    # --- FILTRO DE DATA ---
    with st.expander("📅 Filtros de Período", expanded=True):
        c_data1, c_data2 = st.columns(2)
        data_inicio = c_data1.date_input("Início", value=datetime.now() - timedelta(days=30))
        data_fim = c_data2.date_input("Fim", value=datetime.now())

    # Filtragem dos dados
    if not df_realizados.empty:
        mask = (df_realizados['dt_real_format'].dt.date >= data_inicio) & (df_realizados['dt_real_format'].dt.date <= data_fim)
        df_filtrado = df_realizados.loc[mask]
    else:
        df_filtrado = pd.DataFrame()

    if df_filtrado.empty and df_progs.empty:
        st.info("Nenhum dado encontrado para o período selecionado.")
    else:
        # --- CÁLCULOS KPI ---
        # Verifica se a coluna de programação existe para evitar KeyError em bases vazias
        tem_coluna_prog = 'data_programada' in df_filtrado.columns if not df_filtrado.empty else False
        
        count_concluidos_programados = 0
        if tem_coluna_prog:
            count_concluidos_programados = len(df_filtrado[df_filtrado['data_programada'].notna() & (df_filtrado['data_programada'] != "")])

        total_planejado = len(df_progs) + count_concluidos_programados
        total_concluido = count_concluidos_programados
        taxa_execucao = (total_concluido / total_planejado * 100) if total_planejado > 0 else 0
        
        total_horas = df_filtrado['duracao_horas'].sum() if not df_filtrado.empty else 0
        total_horas_prog = df_progs['duracao_horas'].sum() if not df_progs.empty else 0
        
        vencidos = 0
        if not df_filtrado.empty and 'vencimento_eficacia' in df_filtrado.columns:
            if 'eficacia_concluida' not in df_filtrado.columns:
                df_filtrado['eficacia_concluida'] = False
            
            hoje_dt = datetime.now()
            venc_series = pd.to_datetime(df_filtrado['vencimento_eficacia'], format='%d/%m/%Y', errors='coerce')
            # Conta apenas os que venceram e NÃO foram concluídos
            vencidos = len(df_filtrado[(venc_series < hoje_dt) & (df_filtrado['tipo'] == 'Treinamento') & (df_filtrado['eficacia_concluida'] == False)])

        # --- EXIBIÇÃO EM CARDS ---
        st.write("") 
        c1, c2, c3, c4 = st.columns(4)
        with c1:
            st.container(border=True).metric("Taxa de Execução", f"{taxa_execucao:.1f}%")
        with c2:
            st.container(border=True).metric("Horas Realizadas", f"{total_horas:.1f}h")
        with c3:
            st.container(border=True).metric("Horas Programadas", f"{total_horas_prog:.1f}h")
        with c4:
            st.container(border=True).metric("Eficácias Vencidas", f"{vencidos}", delta_color="inverse")

        st.divider()
        
        if not df_filtrado.empty:
            col_g1, col_g2 = st.columns(2)
            with col_g1:
                st.subheader("Tipos no Período")
                st.bar_chart(df_filtrado['tipo'].value_counts())
            with col_g2:
                st.subheader("Horas por Atividade")
                top_h = df_filtrado.groupby('atividade')['duracao_horas'].sum().sort_values(ascending=False).head(5)
                st.bar_chart(top_h)

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
}
COR_PRIMARIA = colors.HexColor("#1A3D6B")
COR_CABECALHO = colors.HexColor("#E8EDF4")
COR_LINHA_PAR = colors.HexColor("#F7F9FC")
COR_BORDA = colors.HexColor("#C5CDD9")

# ──────────────────────────────────────────────
# Funções de Dados
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

    ndoc_par = Paragraph(f"<font color='#556070'>Nº Doc:</font> <b>{'______' if not num_doc else num_doc}</b>", estilo_ndoc)
    tabela_header = Table([[logo, ndoc_par]], colWidths=[largura_util * 0.55, largura_util * 0.45])
    tabela_header.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("ALIGN", (1, 0), (1, 0), "RIGHT")]))
    
    story.append(tabela_header)
    story.append(HRFlowable(width="100%", thickness=2, color=COR_PRIMARIA, spaceAfter=10))
    story.append(Paragraph("REGISTRO DE TREINAMENTO", estilo_titulo))
    story.append(Spacer(1, 0.4 * cm))

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
        dados_ef = [[Paragraph(LABELS["dias_eficacia"].upper(), estilo_label), Paragraph(LABELS["vencimento_eficacia"].upper(), estilo_label)],
                    [Paragraph(str(registro.get("dias_eficacia", "—")), estilo_valor), Paragraph(str(registro.get("vencimento_eficacia", "—")), estilo_valor)]]
        tabela_ef = Table(dados_ef, colWidths=[largura_util/2, largura_util/2])
        tabela_ef.setStyle(TableStyle([("BOX", (0, 0), (-1, -1), 0.5, COR_BORDA), ("INNERGRID", (0, 0), (-1, -1), 0.3, COR_BORDA), ("BACKGROUND", (0, 0), (-1, 0), COR_LINHA_PAR)]))
        story.append(tabela_ef)
        
        crit_val = str(registro.get("criterios", "")).strip()
        if crit_val and crit_val != "nan":
            story.append(Spacer(1, 0.3 * cm))
            tabela_crit = Table([[Paragraph("CRITÉRIOS DE AVALIAÇÃO", estilo_label)], [Paragraph(crit_val, estilo_criterios)]], colWidths=[largura_util])
            tabela_crit.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), COR_CABECALHO), ("BOX", (0, 0), (-1, -1), 0.5, COR_BORDA)]))
            story.append(tabela_crit)

    story.append(Spacer(1, 1 * cm))
    story.append(Paragraph(f"Documento gerado em {datetime.now().strftime('%d/%m/%Y às %H:%M')}", ParagraphStyle("rodape", alignment=TA_CENTER, fontSize=7, textColor=colors.grey)))
    doc.build(story)
    buffer.seek(0)
    return buffer.read()

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
            criterios = st.text_area("Critérios de avaliação")

        submitted = st.form_submit_button("Salvar no Banco de Dados")
        if submitted:
            if not tipo: st.error("Selecione o Tipo.")
            elif atividade and responsavel:
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
                        "criterios": criterios if tipo == "Treinamento" else ""
                    }
                    salvar_treinamento(novo_dado)
                    st.success("Gravado com sucesso no Supabase!")
                    time.sleep(1)
                    st.rerun()

    if st.checkbox("Visualizar Base"):
        df_viz = get_treinamentos()
        if not df_viz.empty:
            st.dataframe(df_viz)
        else:
            st.info("Nenhum dado encontrado no banco.")

    st.divider()
    st.subheader("Exportar PDF")
    df_base = get_treinamentos()
    if not df_base.empty:
        df_base["_label"] = df_base["atividade"].fillna("") + " (" + df_base["data_realizada"].fillna("") + ")"
        col_sel, col_ndoc = st.columns([3, 1])
        opcao_sel = col_sel.selectbox("Selecione:", options=df_base.index, format_func=lambda i: df_base.at[i, "_label"])
        num_doc = col_ndoc.text_input("Nº Doc")
        if st.download_button("Baixar PDF", data=gerar_pdf(df_base.loc[opcao_sel], num_doc), file_name="registro.pdf", mime="application/pdf"):
            st.success("PDF gerado!")

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
        sel_p = st.selectbox("Escolha para concluir:", options=df_p.index, format_func=lambda i: df_p.at[i, "_label"], index=None)
        if sel_p is not None:
            reg_p = df_p.loc[sel_p]
            with st.form("concluir"):
                st.write(f"Concluindo: **{reg_p['atividade']}**")
                resp_p = st.text_input("Responsável:")
                dt_r_p = st.date_input("Data Realizada")
                
                # Campos de eficácia caso seja Treinamento
                dias_in, criterios_in, vencimento_in = 0, "", ""
                if reg_p['tipo'] == "Treinamento":
                    st.divider()
                    dias_in = st.number_input("Prazo para avaliação (dias)", min_value=1, value=30)
                    vencimento_in = (dt_r_p + timedelta(days=dias_in)).strftime('%d/%m/%Y')
                    criterios_in  = st.text_area("Critérios de avaliação")

                if st.form_submit_button("Concluir Treinamento") and resp_p:
                    concluido = {
                        "tipo": reg_p['tipo'], 
                        "atividade": reg_p['atividade'], 
                        "duracao_horas": reg_p['duracao_horas'], 
                        "responsavel": resp_p, 
                        "data_programada": reg_p['data_programada'], 
                        "data_realizada": dt_r_p.strftime('%d/%m/%Y'),
                        "dias_eficacia": str(dias_in) if reg_p['tipo'] == "Treinamento" else "",
                        "vencimento_eficacia": vencimento_in if reg_p['tipo'] == "Treinamento" else "",
                        "criterios": criterios_in if reg_p['tipo'] == "Treinamento" else ""
                    }
                    salvar_treinamento(concluido)
                    excluir_programado(int(reg_p['id']))
                    st.success("Concluido e migrado para base principal!")
                    time.sleep(1)
                    st.rerun()
    else:
        st.info("Nenhuma programação pendente.")

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
        
        vencidos = 0
        if not df_filtrado.empty and 'vencimento_eficacia' in df_filtrado.columns:
            hoje = datetime.now()
            venc_series = pd.to_datetime(df_filtrado['vencimento_eficacia'], format='%d/%m/%Y', errors='coerce')
            vencidos = len(df_filtrado[(venc_series < hoje) & (df_filtrado['tipo'] == 'Treinamento')])

        # --- EXIBIÇÃO EM CARDS ---
        st.write("") 
        c1, c2, c3 = st.columns(3)
        with c1:
            st.container(border=True).metric("Taxa de Execução", f"{taxa_execucao:.1f}%")
        with c2:
            st.container(border=True).metric("Total Horas", f"{total_horas:.1f}h")
        with c3:
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

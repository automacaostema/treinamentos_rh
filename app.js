/* 
   LOGICA PRINCIPAL - RH TREINAMENTOS
   Refatorado para Cloud-Native (Supabase) com TDD Support
*/

const SUPABASE_URL = 'https://rozrtspxrgtfexaoemfq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvenJ0c3B4cmd0ZmV4YW9lbWZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MzQ3MDksImV4cCI6MjA5NDIxMDcwOX0.aw4HdzZZwPFUqd-RdmfcsnLl-V4cVcum0-khuiyz1nc';

let supabaseClient = null;
let dbService = null;

// LISTA DE FUNCIONÁRIOS
const LISTA_FUNCIONARIOS = [
    "ADRIANO PEDROSO DOS SANTOS", "ADRIANO RICARDO TORACELLI JUNIOR",
    "ALEXANDRE HENRIQUE JOAQUIM GUARIZZO", "ALISSON EMILIO VALE",
    "ANDRÉ FERNANDO SOLA", "ANTHONY GUSTAVO MOLAN",
    "DANILO ADRIAN DOS SANTOS", "DEIVIDE CAROL DE UNGARO",
    "ERLEI BISPO DA SILVA", "FABIANA TEODORO DA SILVA",
    "FERNANDO ANTONIO QUIRINO", "FRANCISCO SOARES CORREIA",
    "GUILHERME AUGUSTO FERNANDES DO PRADO", "JACKSON SILVA BATISTA",
    "JOÃO FELIPE CAPETERUCHI", "JOÃO TADEU SEGANTIN",
    "JORGE LOPES DE OLIVEIRA", "KAIO HENRIQUE DIAS",
    "LEANDRO HENRIQUE PAULUCCI", "LIONEL DE OLIVEIRA",
    "LUAN GIOVANE BORSOLLI", "LUCAS BORSOLLI",
    "LUIS CARLOS DA SILVA", "LUIZ APARECIDO DA SILVA",
    "MARCELO CAMPOS GUILHERME", "MARCELO DONIZETE DOMINGUES DE CARLI",
    "MARCELO RODRIGO DOS SANTOS", "MARCOS DANIEL THEODORO",
    "MARCOS FERREIRA BEZERRA", "MARINA MODOLO MANTELLI DE SANTANA",
    "MICHELLE MARTINS DA SILVA", "MICHELLE RENATA CALANCA",
    "MILTON HENRIQUE DIONISIO", "PAULO SECOTI DOS ANJOS",
    "PEDRO HENRIQUE FINI", "RICHARD DOUGLAS VIDAL",
    "ROGERIO ADRIANO DE SOUZA JUNIOR"
];

function initSupabase() {
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        
        dbService = {
            getTreinamentos: async () => {
                const { data, error } = await supabaseClient.schema('rh').from('treinamentos').select('*').order('id', { ascending: false });
                if (error) throw error;
                return data;
            },
            saveTreinamento: async (data) => {
                const { data: result, error } = await supabaseClient.schema('rh').from('treinamentos').insert([data]).select();
                if (error) throw error;
                return result[0];
            },
            updateTreinamento: async (id, data) => {
                const { data: result, error } = await supabaseClient.schema('rh').from('treinamentos').update(data).eq('id', id).select();
                if (error) throw error;
                return result[0];
            },
            deleteTreinamento: async (id) => {
                const { error } = await supabaseClient.schema('rh').from('treinamentos').delete().eq('id', id);
                if (error) throw error;
            },
            getProgramados: async () => {
                const { data, error } = await supabaseClient.schema('rh').from('treinamentos_programados').select('*').order('id', { ascending: false });
                if (error) throw error;
                return data;
            },
            saveProgramado: async (data) => {
                const { data: result, error } = await supabaseClient.schema('rh').from('treinamentos_programados').insert([data]).select();
                if (error) throw error;
                return result[0];
            },
            deleteProgramado: async (id) => {
                const { error } = await supabaseClient.schema('rh').from('treinamentos_programados').delete().eq('id', id);
                if (error) throw error;
            }
        };
    }
}

// Funções Globais (Expostas para o Window)
async function loadEficacia() {
    const tbody = document.getElementById('tbody-eficacia');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6">Carregando...</td></tr>';
    
    try {
        const all = await dbService.getTreinamentos();
        const data = all.filter(t => t.tipo === 'Treinamento' && !t.eficacia_concluida);

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">Nenhuma avaliação pendente.</td></tr>';
            return;
        }

        tbody.innerHTML = data.map(t => `
            <tr>
                <td>${t.atividade}</td>
                <td>${t.data_realizada}</td>
                <td>${t.vencimento_eficacia}</td>
                <td>${t.responsavel_aval}</td>
                <td style="font-weight: bold;">${t.num_doc || '—'}</td>
                <td>
                    <button class="btn-primary" onclick="darBaixaEficacia('${t.id}')">BAIXA</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="6">Erro ao carregar dados.</td></tr>';
    }
}

function darBaixaEficacia(id) {
    window.currentEficaciaId = id;
    const modal = document.getElementById('modal-eficacia');
    if (modal) {
        document.getElementById('data-aval-eficacia').valueAsDate = new Date();
        document.getElementById('texto-eficacia').value = '';
        modal.classList.remove('hidden');
    }
}

async function salvarEficacia() {
    const id = window.currentEficaciaId;
    const dataAval = document.getElementById('data-aval-eficacia').value;
    const res = document.getElementById('texto-eficacia').value;

    if (!id || !dataAval || !res) return alert('Preencha a data e o resultado.');

    try {
        const [year, month, day] = dataAval.split('-');
        const dataFormatada = `${day}/${month}/${year}`;

        await dbService.updateTreinamento(id, {
            eficacia_concluida: true,
            data_avaliacao: dataFormatada,
            resultado_eficacia: res
        });
        document.getElementById('modal-eficacia').classList.add('hidden');
        alert('Eficácia registrada!');
        loadEficacia();
    } catch (e) { alert(e.message); }
}

async function loadProgramados() {
    const tbody = document.getElementById('tbody-programados');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5">Carregando...</td></tr>';
    
    try {
        const data = await dbService.getProgramados();
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">Nenhuma programação pendente.</td></tr>';
            return;
        }

        tbody.innerHTML = data.map(t => `
            <tr>
                <td>${t.atividade}</td>
                <td>${t.data_programada}</td>
                <td>${t.duracao_horas}h</td>
                <td>${t.responsavel}</td>
                <td>
                    <button class="btn-primary" style="padding: 2px 10px; font-size: 0.7rem;" onclick="preencherConclusao('${t.id}', '${t.atividade}', '${t.data_programada}')">CONCLUIR</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="5">Erro ao carregar dados.</td></tr>';
    }
}

async function loadDashboard() {
    const dashDataInicio = document.getElementById('dash-data-inicio');
    const dashDataFim = document.getElementById('dash-data-fim');
    if (!dashDataInicio) return;

    const valInicio = dashDataInicio.value;
    const valFim = dashDataFim.value;

    try {
        const realizados = await dbService.getTreinamentos();
        const programados = await dbService.getProgramados();

        const kpis = FrontendLogic.calculateKPIs(realizados, programados, valInicio, valFim);
        const filtrados = kpis.filtrados;

        document.getElementById('kpi-taxa').innerText = `${kpis.taxaExec.toFixed(1)}%`;
        document.getElementById('kpi-horas-real').innerText = `${kpis.totalHorasReal.toFixed(1)}h`;
        document.getElementById('kpi-horas-prog').innerText = `${kpis.totalHorasProg.toFixed(1)}h`;
        document.getElementById('kpi-vencidos').innerText = kpis.vencidos;

        renderTiposChart(filtrados);
        renderTendenciaChart(filtrados);

        const tbodyDet = document.getElementById('tbody-dash-detalhes');
        document.getElementById('dash-count').innerText = `${filtrados.length} itens`;

        if (filtrados.length === 0) {
            tbodyDet.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">Nenhuma atividade encontrada no período.</td></tr>';
        } else {
            tbodyDet.innerHTML = filtrados.sort((a,b) => FrontendLogic.parseDate(b.data_realizada) - FrontendLogic.parseDate(a.data_realizada)).map(r => `
                <tr>
                    <td style="font-weight:bold;">${r.atividade}</td>
                    <td style="text-align:center;">${r.data_realizada}</td>
                    <td style="text-align:center;">${r.duracao_horas}h</td>
                    <td>${r.responsavel}</td>
                    <td style="text-align:center; font-weight:900; color: ${r.num_doc ? '#28a745' : '#666'};">${r.num_doc || '—'}</td>
                    <td style="text-align:center;">
                        <div style="display: flex; gap: 5px; justify-content: center;">
                            <button class="btn-table" onclick="abrirConferencia('${r.id}')" title="Conferir">🔍</button>
                            ${!r.num_doc ? `<button class="btn-table" onclick="atribuirNumero('${r.id}')" title="Nº Doc">#</button>` : ''}
                            ${r.num_doc ? `<button class="btn-table" onclick="baixarPDF('${r.id}')" title="PDF">📥</button>` : ''}
                            <button class="btn-table" onclick="deletarRegistro('${r.id}')" title="Excluir">🗑️</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error(error);
    }
}

function renderTiposChart(data) {
    const counts = data.reduce((acc, curr) => {
        acc[curr.tipo] = (acc[curr.tipo] || 0) + 1;
        return acc;
    }, {});
    const canvas = document.getElementById('chart-tipos');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (window.tiposChart) window.tiposChart.destroy();
    window.tiposChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(counts),
            datasets: [{
                data: Object.values(counts),
                backgroundColor: ['#1a3d6b', '#c5cdd9'],
                borderWidth: 1,
                borderColor: '#000'
            }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });
}

function renderTendenciaChart(data) {
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const tendencia = data.reduce((acc, curr) => {
        const dt = FrontendLogic.parseDate(curr.data_realizada);
        if (!dt) return acc;
        const key = `${meses[dt.getMonth()]}/${dt.getFullYear()}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});
    const sortedKeys = Object.keys(tendencia).sort((a, b) => {
        const [mesA, anoA] = a.split('/');
        const [mesB, anoB] = b.split('/');
        return new Date(anoA, meses.indexOf(mesA)) - new Date(anoB, meses.indexOf(mesB));
    });

    const canvas = document.getElementById('chart-tendencia');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (window.tendenciaChart) window.tendenciaChart.destroy();
    window.tendenciaChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedKeys,
            datasets: [{
                label: 'Treinamentos',
                data: sortedKeys.map(k => tendencia[k]),
                borderColor: '#1a3d6b',
                backgroundColor: 'rgba(26, 61, 107, 0.1)',
                fill: true, tension: 0.3
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });
}

function closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add('hidden');
}

// Exposição global das funções
if (typeof window !== 'undefined') {
    window.initSupabase = initSupabase;
    window.darBaixaEficacia = darBaixaEficacia;
    window.salvarEficacia = salvarEficacia;
    window.loadEficacia = loadEficacia;
    window.loadProgramados = loadProgramados;
    window.loadDashboard = loadDashboard;
    window.closeModal = closeModal;

    window.preencherConclusao = (id, atividade, dataProg) => {
        const btnCad = document.querySelector('.tab-btn[data-tab="cadastro"]');
        if (btnCad) btnCad.click();
        document.getElementById('cad-atividade').value = atividade;
        window.currentProgramadoId = id;
        window.currentProgramadoDate = dataProg;
    };

    window.abrirConferencia = async (id) => {
        try {
            const data = await dbService.getTreinamentos();
            const t = data.find(item => item.id == id);
            if (!t) return;
            document.getElementById('edit-id').value = t.id;
            document.getElementById('edit-atividade').value = t.atividade;
            document.getElementById('edit-instrutor').value = t.responsavel;
            document.getElementById('edit-local').value = t.local || 'STEMA';
            document.getElementById('edit-participantes').value = t.participantes.join(', ');
            document.getElementById('modal-conferencia').classList.remove('hidden');
        } catch (e) { alert('Erro ao carregar.'); }
    };

    window.salvarEdicaoRapida = async () => {
        const id = document.getElementById('edit-id').value;
        const updates = {
            atividade: document.getElementById('edit-atividade').value.toUpperCase(),
            responsavel: document.getElementById('edit-instrutor').value.toUpperCase(),
            local: document.getElementById('edit-local').value.toUpperCase()
        };
        try {
            await dbService.updateTreinamento(id, updates);
            alert('Salvo!');
            closeModal('modal-conferencia');
            loadDashboard();
        } catch (e) { alert(e.message); }
    };

    window.atribuirNumero = async (id) => {
        try {
            const all = await dbService.getTreinamentos();
            const nums = all.map(d => parseInt(d.num_doc)).filter(n => !isNaN(n));
            const nextNum = nums.length > 0 ? Math.max(...nums) + 1 : 1;
            const numStr = nextNum.toString().padStart(4, '0');
            await dbService.updateTreinamento(id, { num_doc: numStr });
            loadDashboard();
        } catch (e) { alert(e.message); }
    };

    window.baixarPDF = async (id) => {
        try {
            const data = await dbService.getTreinamentos();
            const t = data.find(item => item.id == id);
            const doc = await generateFRRH01(t, t.num_doc);
            doc.save(`REGISTRO_${t.tipo}_${t.num_doc}.pdf`);
        } catch (e) { alert(e.message); }
    };

    window.deletarRegistro = async (id) => {
        if (!confirm('Excluir permanentemente?')) return;
        try {
            await dbService.deleteTreinamento(id);
            loadDashboard();
        } catch (e) { alert(e.message); }
    };
}

// Inicialização de Eventos
document.addEventListener('DOMContentLoaded', () => {
    initSupabase();

    // Navegação de Abas
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');
            tabButtons.forEach(b => b.classList.toggle('active', b === btn));
            tabContents.forEach(c => c.classList.toggle('active', c.id === target));
            if (target === 'programados') loadProgramados();
            if (target === 'eficacia') loadEficacia();
            if (target === 'dashboard') loadDashboard();
        });
    });

    // Lógica de Cadastro
    const cadTipo = document.getElementById('cad-tipo');
    const cadExtra = document.getElementById('cad-extra-treinamento');
    const cadExtraInfo = document.getElementById('cad-extra-informativo');
    const partContainer = document.getElementById('participantes-container');
    const labelData = document.getElementById('label-data');

    if (cadTipo) {
        cadTipo.addEventListener('change', () => {
            const val = cadTipo.value;
            cadExtra.classList.toggle('hidden', val !== 'Treinamento');
            cadExtraInfo.classList.toggle('hidden', val !== 'Informativo');
            labelData.innerText = val === 'Programado' ? 'DATA PROGRAMADA' : 'DATA REALIZADA';
            partContainer.style.display = val === 'Programado' ? 'none' : 'block';
        });
    }

    // Render Participantes
    if (partContainer) {
        partContainer.innerHTML = '';
        partContainer.className = 'participantes-list';
        const allLabel = document.createElement('label');
        allLabel.className = 'participante-item header';
        allLabel.innerHTML = `<input type="checkbox" id="check-all-parts"><span>SELECIONAR TODOS</span>`;
        partContainer.appendChild(allLabel);

        LISTA_FUNCIONARIOS.forEach(func => {
            const label = document.createElement('label');
            label.className = 'participante-item';
            label.innerHTML = `<input type="checkbox" class="part-check" value="${func}"><span>${func}</span>`;
            partContainer.appendChild(label);
        });

        document.getElementById('check-all-parts').addEventListener('change', (e) => {
            document.querySelectorAll('.part-check').forEach(c => c.checked = e.target.checked);
        });
    }

    // Salvar Cadastro
    const btnSalvar = document.getElementById('btn-salvar-cadastro');
    if (btnSalvar) {
        btnSalvar.addEventListener('click', async () => {
            const tipo = cadTipo.value;
            const atividade = document.getElementById('cad-atividade').value.toUpperCase();
            const duracao = parseFloat(document.getElementById('cad-duracao').value);
            const responsavel = document.getElementById('cad-responsavel').value.toUpperCase();
            const dataInput = document.getElementById('cad-data-realizada').value;
            const selectedParts = Array.from(document.querySelectorAll('.part-check:checked')).map(c => c.value);

            if (!tipo || !atividade || !dataInput) return alert('Preencha os campos obrigatórios.');

            const [y, m, d] = dataInput.split('-');
            const dataFormatada = `${d}/${m}/${y}`;

            let extra = {};
            if (tipo === 'Treinamento') {
                const dias = parseInt(document.getElementById('cad-prazo-eficacia').value);
                const dt = new Date(y, m - 1, d);
                dt.setDate(dt.getDate() + dias);
                extra = {
                    dias_eficacia: dias.toString(),
                    vencimento_eficacia: dt.toLocaleDateString('pt-BR'),
                    criterios: document.getElementById('cad-criterios').value.toUpperCase(),
                    responsavel_aval: document.getElementById('cad-resp-aval').value.toUpperCase(),
                    eficacia_concluida: false,
                    descricao_atividade: document.getElementById('cad-descricao-treinamento').value.toUpperCase()
                };
            } else if (tipo === 'Informativo') {
                extra = { descricao_atividade: document.getElementById('cad-descricao-informativo').value.toUpperCase() };
            }

            btnSalvar.disabled = true;
            btnSalvar.innerText = 'SALVANDO...';

            try {
                const payload = (tipo === 'Programado') 
                    ? { tipo, atividade, duracao_horas: duracao, responsavel, data_programada: dataFormatada }
                    : { tipo, atividade, duracao_horas: duracao, responsavel, data_realizada: dataFormatada, participantes: selectedParts, ...extra };

                if (tipo === 'Programado') await dbService.saveProgramado(payload);
                else await dbService.saveTreinamento(payload);

                alert('Gravado com sucesso!');
                if (window.currentProgramadoId) {
                    await dbService.deleteProgramado(window.currentProgramadoId);
                    window.currentProgramadoId = null;
                }
                location.reload();
            } catch (e) { alert(e.message); }
            finally {
                btnSalvar.disabled = false;
                btnSalvar.innerText = 'SALVAR NO BANCO DE DADOS';
            }
        });
    }

    // Dashboard Refresh
    const btnRefresh = document.getElementById('btn-atualizar-dash');
    if (btnRefresh) btnRefresh.addEventListener('click', loadDashboard);
});

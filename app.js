/* 
   LOGICA PRINCIPAL - RH TREINAMENTOS
   Estilo Vanilla JS
*/

// CONFIGURAÇÃO SUPABASE
const SUPABASE_URL = "https://louvzculrtkfgaqoajxz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvdXZ6Y3VscnRrZmdhcW9hanh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyNDk0NDksImV4cCI6MjA5MjgyNTQ0OX0._EwXTNMveyldEMeOYdbbOPPftFrjfZ-Vzi8eVu4ENSY";
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, { db: { schema: 'treinamentos' } });

// LISTA DE FUNCIONÁRIOS (Hardcoded do original)
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

document.addEventListener('DOMContentLoaded', async () => {
    // DOM Elements
    const loginOverlay = document.getElementById('login-overlay');
    const appMain = document.getElementById('app-main');
    const btnEntrar = document.getElementById('btn-entrar');
    const btnSair = document.getElementById('btn-sair');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    const loginUser = document.getElementById('login-user');
    const loginPass = document.getElementById('login-pass');
    const loginError = document.getElementById('login-error');

    // Cadastro Elements
    const cadTipo = document.getElementById('cad-tipo');
    const cadExtra = document.getElementById('cad-extra-treinamento');
    const cadDataRealizada = document.getElementById('cad-data-realizada');
    const partContainer = document.getElementById('participantes-container');
    const btnSalvarCad = document.getElementById('btn-salvar-cadastro');
    
    // PDF Elements
    const pdfSelect = document.getElementById('pdf-select-treinamento');
    const pdfNumDoc = document.getElementById('pdf-num-doc');
    const pdfWarning = document.getElementById('pdf-warning-num');
    const btnAtribuirNum = document.getElementById('btn-atribuir-num');
    const btnDownloadPdf = document.getElementById('btn-download-pdf');
    const btnExcluirDefinitivo = document.getElementById('btn-excluir-definitivo');

    // Dashboard Elements
    const dashDataInicio = document.getElementById('dash-data-inicio');
    const dashDataFim = document.getElementById('dash-data-fim');
    const btnAtualizarDash = document.getElementById('btn-atualizar-dash');
    
    // Default dates for Dash (Last 30 days)
    const dtHoje = new Date();
    const dtInicio = new Date();
    dtInicio.setDate(dtHoje.getDate() - 30);
    dashDataInicio.valueAsDate = dtInicio;
    dashDataFim.valueAsDate = dtHoje;

    // Set Default Date
    cadDataRealizada.valueAsDate = new Date();

    // --- FORM LOGIC ---
    cadTipo.addEventListener('change', () => {
        if (cadTipo.value === 'Treinamento') cadExtra.classList.remove('hidden');
        else cadExtra.classList.add('hidden');
    });

    // Generate Participants Checkboxes
    function renderParticipants() {
        partContainer.innerHTML = '';
        partContainer.className = 'participantes-list';
        
        // Select All Option
        const allLabel = document.createElement('label');
        allLabel.className = 'participante-item header';
        allLabel.innerHTML = `
            <input type="checkbox" id="check-all-parts">
            <span>SELECIONAR TODOS</span>
        `;
        partContainer.appendChild(allLabel);

        LISTA_FUNCIONARIOS.forEach(func => {
            const label = document.createElement('label');
            label.className = 'participante-item';
            label.innerHTML = `
                <input type="checkbox" class="part-check" value="${func}">
                <span>${func}</span>
            `;
            partContainer.appendChild(label);
        });

        document.getElementById('check-all-parts').addEventListener('change', (e) => {
            document.querySelectorAll('.part-check').forEach(c => c.checked = e.target.checked);
        });
    }

    renderParticipants();

    // --- LOGICA DE LOGIN ---
    btnEntrar.addEventListener('click', () => {
        const user = loginUser.value;
        const pass = loginPass.value;

        // Credenciais idênticas ao script Python
        if (user === 'rh_stema' && pass === 'rh123') {
            loginOverlay.classList.add('hidden');
            appMain.classList.remove('hidden');
            loginError.style.display = 'none';
        } else {
            loginError.style.display = 'block';
        }
    });

    btnSair.addEventListener('click', () => {
        appMain.classList.add('hidden');
        loginOverlay.classList.remove('hidden');
        loginPass.value = ''; // Limpa a senha
    });

    btnAtualizarDash.addEventListener('click', loadDashboard);

    // --- NAVEGAÇÃO POR ABAS ---
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');
            switchTab(target);
        });
    });

    function switchTab(target) {
        tabButtons.forEach(b => {
            if (b.getAttribute('data-tab') === target) b.classList.add('active');
            else b.classList.remove('active');
        });
        tabContents.forEach(c => {
            if (c.id === target) c.classList.add('active');
            else c.classList.remove('active');
        });

        // Refresh data when switching to specific tabs
        if (target === 'programados') loadProgramados();
        if (target === 'eficacia') loadEficacia();
        if (target === 'pdf') loadPDFTab();
        if (target === 'dashboard') loadDashboard();
    }

    // --- SERVIÇOS DE DADOS ---
    async function loadProgramados() {
        const tbody = document.getElementById('tbody-programados');
        tbody.innerHTML = '<tr><td colspan="5">Carregando...</td></tr>';
        
        const { data, error } = await _supabase.from('treinamentos_programados').select('*');
        if (error) {
            tbody.innerHTML = '<tr><td colspan="5">Erro ao carregar dados.</td></tr>';
            return;
        }
        
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
                    <button class="btn-primary" style="padding: 2px 10px; font-size: 0.7rem;" onclick="preencherConclusao('${t.id}', '${t.atividade}')">CONCLUIR</button>
                </td>
            </tr>
        `).join('');
    }

    // Função global para ser acessada pelo onclick do HTML (necessário em Vanilla sem framework)
    window.preencherConclusao = (id, atividade) => {
        switchTab('cadastro');
        document.getElementById('cad-atividade').value = atividade;
        // Armazenar ID original para deletar após salvar
        window.currentProgramadoId = id;
    };

    async function loadEficacia() {
        const tbody = document.getElementById('tbody-eficacia');
        tbody.innerHTML = '<tr><td colspan="5">Carregando...</td></tr>';
        
        const { data, error } = await _supabase.from('treinamentos')
            .select('*')
            .eq('tipo', 'Treinamento')
            .eq('eficacia_concluida', false);

        if (error) {
            tbody.innerHTML = '<tr><td colspan="5">Erro ao carregar dados.</td></tr>';
            return;
        }
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">Nenhuma avaliação pendente.</td></tr>';
            return;
        }

        tbody.innerHTML = data.map(t => `
            <tr>
                <td>${t.atividade}</td>
                <td>${t.data_realizada}</td>
                <td>${t.vencimento_eficacia}</td>
                <td>${t.responsavel_aval}</td>
                <td>
                    <button class="btn-primary" style="padding: 2px 10px; font-size: 0.7rem;" onclick="darBaixaEficacia('${t.id}')">BAIXA</button>
                </td>
            </tr>
        `).join('');
    }

    window.darBaixaEficacia = async (id) => {
        if (!confirm('Deseja confirmar a eficácia deste treinamento?')) return;
        
        const { error } = await _supabase.from('treinamentos')
            .update({ eficacia_concluida: true })
            .eq('id', id);

        if (error) alert('Erro: ' + error.message);
        else {
            alert('Eficácia concluída!');
            loadEficacia();
        }
    };

    async function loadDashboard() {
        const dtInicio = new Date(dashDataInicio.value);
        const dtFim = new Date(dashDataFim.value);
        dtFim.setHours(23, 59, 59);

        // Fetch Data
        const { data: realizados, error: errReal } = await _supabase.from('treinamentos').select('*');
        const { data: programados, error: errProg } = await _supabase.from('treinamentos_programados').select('*');

        if (errReal || errProg) return alert("Erro ao carregar dados do dashboard.");

        // Helper to parse DD/MM/YYYY
        const parseDate = (str) => {
            if (!str) return null;
            const [d, m, y] = str.split('/');
            return new Date(y, m - 1, d);
        };

        // Filter Realizados by Period
        const filtrados = realizados.filter(r => {
            const dt = parseDate(r.data_realizada);
            return dt >= dtInicio && dt <= dtFim;
        });

        // --- CALCULO KPIs ---
        const totalHorasReal = filtrados.reduce((acc, curr) => acc + (parseFloat(curr.duracao_horas) || 0), 0);
        const totalHorasProg = programados.reduce((acc, curr) => acc + (parseFloat(curr.duracao_horas) || 0), 0);
        
        // Eficácias Vencidas
        const hoje = new Date();
        const vencidos = realizados.filter(r => {
            if (r.tipo !== 'Treinamento' || r.eficacia_concluida) return false;
            const dtVenc = parseDate(r.vencimento_eficacia);
            return dtVenc && dtVenc < hoje;
        }).length;

        // Taxa de Execução (Concluídos que eram programados / Total planejado)
        // No original: planejado = programados atuais + realizados que tinham data_programada
        const concluidosQueEramProg = filtrados.filter(r => r.data_programada && r.data_programada !== "").length;
        const totalPlanejado = programados.length + concluidosQueEramProg;
        const taxaExec = totalPlanejado > 0 ? (concluidosQueEramProg / totalPlanejado * 100) : 0;

        // Update KPI Cards
        document.getElementById('kpi-taxa').innerText = `${taxaExec.toFixed(1)}%`;
        document.getElementById('kpi-horas-real').innerText = `${totalHorasReal.toFixed(1)}h`;
        document.getElementById('kpi-horas-prog').innerText = `${totalHorasProg.toFixed(1)}h`;
        document.getElementById('kpi-vencidos').innerText = vencidos;

        // --- GRÁFICOS ---
        renderTiposChart(filtrados);
        renderTendenciaChart(filtrados);
    }

    function renderTiposChart(data) {
        const counts = data.reduce((acc, curr) => {
            acc[curr.tipo] = (acc[curr.tipo] || 0) + 1;
            return acc;
        }, {});

        const ctx = document.getElementById('chart-tipos').getContext('2d');
        
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
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom', labels: { font: { family: 'Inter', weight: 'bold' } } }
                }
            }
        });
    }

    function renderTendenciaChart(data) {
        // Agrupar por Mês/Ano
        const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const tendencia = data.reduce((acc, curr) => {
            const dt = parseDate(curr.data_realizada);
            if (!dt) return acc;
            const key = `${meses[dt.getMonth()]}/${dt.getFullYear()}`;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        const ctx = document.getElementById('chart-tendencia').getContext('2d');
        
        if (window.tendenciaChart) window.tendenciaChart.destroy();
        
        window.tendenciaChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Object.keys(tendencia),
                datasets: [{
                    label: 'Nº Treinamentos',
                    data: Object.values(tendencia),
                    borderColor: '#1a3d6b',
                    backgroundColor: 'rgba(26, 61, 107, 0.1)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#eee' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // --- LOGICA ABA PDF ---
    let allTrainingsForPDF = [];

    async function loadPDFTab() {
        pdfSelect.innerHTML = '<option value="">Carregando...</option>';
        const { data, error } = await _supabase.from('treinamentos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) return alert(error.message);
        
        allTrainingsForPDF = data;
        pdfSelect.innerHTML = '<option value="">Selecione um treinamento...</option>' + 
            data.map(t => `<option value="${t.id}">${t.tipo.toUpperCase()} - ${t.atividade} (${t.data_realizada})</option>`).join('');
        
        resetPDFUI();
    }

    function resetPDFUI() {
        pdfNumDoc.value = '';
        pdfWarning.classList.add('hidden');
        btnDownloadPdf.classList.add('hidden');
    }

    pdfSelect.addEventListener('change', () => {
        const id = pdfSelect.value;
        if (!id) {
            resetPDFUI();
            return;
        }

        const training = allTrainingsForPDF.find(t => t.id == id);
        if (training.num_doc) {
            pdfNumDoc.value = training.num_doc;
            pdfWarning.classList.add('hidden');
            btnDownloadPdf.classList.remove('hidden');
        } else {
            pdfNumDoc.value = 'PENDENTE';
            pdfWarning.classList.remove('hidden');
            btnDownloadPdf.classList.add('hidden');
        }
    });

    btnAtribuirNum.addEventListener('click', async () => {
        const id = pdfSelect.value;
        if (!id) return;

        btnAtribuirNum.disabled = true;
        btnAtribuirNum.innerText = 'PROCESSANDO...';

        try {
            // Pegar maior num_doc atual
            const { data: maxDoc, error: errMax } = await _supabase.from('treinamentos').select('num_doc');
            let nextNum = 1;
            if (maxDoc && maxDoc.length > 0) {
                const nums = maxDoc.map(d => parseInt(d.num_doc)).filter(n => !isNaN(n));
                if (nums.length > 0) nextNum = Math.max(...nums) + 1;
            }

            const numStr = nextNum.toString().padStart(4, '0');

            const { error: errUpd } = await _supabase.from('treinamentos')
                .update({ num_doc: numStr })
                .eq('id', id);

            if (errUpd) throw errUpd;

            alert(`Número ${numStr} atribuído com sucesso!`);
            loadPDFTab(); // Recarrega
        } catch (e) {
            alert('Erro: ' + e.message);
        } finally {
            btnAtribuirNum.disabled = false;
            btnAtribuirNum.innerText = 'ATRIBUIR NÚMERO E LIBERAR DOWNLOAD';
        }
    });

    btnDownloadPdf.addEventListener('click', async () => {
        const id = pdfSelect.value;
        const training = allTrainingsForPDF.find(t => t.id == id);
        if (!training) return;

        btnDownloadPdf.disabled = true;
        btnDownloadPdf.innerText = 'GERANDO PDF...';

        try {
            const doc = await generateFRRH01(training, training.num_doc);
            doc.save(`Registro_${training.tipo}_${training.num_doc}.pdf`);
        } catch (e) {
            alert('Erro ao gerar PDF: ' + e.message);
        } finally {
            btnDownloadPdf.disabled = false;
            btnDownloadPdf.innerText = '⬇️ BAIXAR PDF OFICIAL';
        }
    });

    btnExcluirDefinitivo.addEventListener('click', async () => {
        const id = pdfSelect.value;
        if (!id) return alert('Selecione um treinamento primeiro.');
        
        if (!confirm('TEM CERTEZA? Esta ação é irreversível e apagará todos os dados deste treinamento.')) return;

        const { error } = await _supabase.from('treinamentos').delete().eq('id', id);
        if (error) alert(error.message);
        else {
            alert('Excluído permanentemente.');
            loadPDFTab();
        }
    });

    // --- SALVAR CADASTRO ---
    btnSalvarCad.addEventListener('click', async () => {
        const atividade = document.getElementById('cad-atividade').value;
        const tipo = cadTipo.value;
        const duracao = parseFloat(document.getElementById('cad-duracao').value);
        const responsavel = document.getElementById('cad-responsavel').value;
        const dataRealizada = cadDataRealizada.value;
        
        const selectedParts = Array.from(document.querySelectorAll('.part-check:checked')).map(c => c.value);

        if (!tipo || !atividade || !responsavel || selectedParts.length === 0) {
            alert('Por favor, preencha os campos obrigatórios e selecione ao menos um participante.');
            return;
        }

        let extraData = {};
        if (tipo === 'Treinamento') {
            const dias = parseInt(document.getElementById('cad-prazo-eficacia').value);
            const respAval = document.getElementById('cad-resp-aval').value;
            const criterios = document.getElementById('cad-criterios').value;

            if (!respAval || !criterios) {
                alert('Preencha os campos de avaliação de eficácia.');
                return;
            }

            // Cálculo de vencimento (DD/MM/YYYY como no original)
            const dt = new Date(dataRealizada);
            dt.setDate(dt.getDate() + dias);
            const vencStr = dt.toLocaleDateString('pt-BR');

            extraData = {
                dias_eficacia: dias.toString(),
                vencimento_eficacia: vencStr,
                criterios: criterios,
                responsavel_aval: respAval,
                eficacia_concluida: false
            };
        }

        const payload = {
            tipo,
            atividade,
            duracao_horas: duracao,
            responsavel,
            data_programada: "",
            data_realizada: new Date(dataRealizada).toLocaleDateString('pt-BR'),
            participantes: selectedParts,
            ...extraData
        };

        btnSalvarCad.disabled = true;
        btnSalvarCad.innerText = 'SALVANDO...';

        const { error } = await _supabase.from('treinamentos').insert(payload);

        if (error) {
            alert('Erro ao salvar no Supabase: ' + error.message);
        } else {
            alert('Gravado com sucesso!');
            
            // Se veio de um programado, deletar a programação
            if (window.currentProgramadoId) {
                await _supabase.from('treinamentos_programados').delete().eq('id', window.currentProgramadoId);
                window.currentProgramadoId = null;
            }

            // Reset form
            document.getElementById('cad-atividade').value = '';
            document.querySelectorAll('.part-check').forEach(c => c.checked = false);
            document.getElementById('check-all-parts').checked = false;
        }

        btnSalvarCad.disabled = false;
        btnSalvarCad.innerText = 'SALVAR NO BANCO DE DADOS';
    });
});

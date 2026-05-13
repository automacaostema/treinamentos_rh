/* 
   LOGICA PRINCIPAL - RH TREINAMENTOS
   Migrado para MariaDB via API Local
*/


const SUPABASE_URL = 'https://rozrtspxrgtfexaoemfq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvenJ0c3B4cmd0ZmV4YW9lbWZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MzQ3MDksImV4cCI6MjA5NDIxMDcwOX0.aw4HdzZZwPFUqd-RdmfcsnLl-V4cVcum0-khuiyz1nc';

// Inicializa o cliente (o schema padrão é 'public')
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const dbService = {
    getTreinamentos: async () => {
        const { data, error } = await supabaseClient.schema('rh').from('treinamentos').select('*').order('id', { ascending: false });
        if (error) {
            console.error('Erro Detalhado Supabase:', error);
            throw error;
        }
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

document.addEventListener('DOMContentLoaded', async () => {
    // Configuração carregada via Supabase SDK


    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Cadastro Elements
    const cadTipo = document.getElementById('cad-tipo');
    const cadExtra = document.getElementById('cad-extra-treinamento');
    const cadExtraInfo = document.getElementById('cad-extra-informativo');
    const cadDataRealizada = document.getElementById('cad-data-realizada');
    const partContainer = document.getElementById('participantes-container');
    const btnSalvarCad = document.getElementById('btn-salvar-cadastro');
    


    // Dashboard Elements
    const dashDataInicio = document.getElementById('dash-data-inicio');
    const dashDataFim = document.getElementById('dash-data-fim');
    const btnAtualizarDash = document.getElementById('btn-atualizar-dash');

    // Modal Eficacia Elements
    const modalEficacia = document.getElementById('modal-eficacia');
    const modalDataAval = document.getElementById('modal-data-aval');
    const modalResultado = document.getElementById('modal-resultado-eficacia');
    const btnSalvarModal = document.getElementById('btn-salvar-modal');
    const btnCancelarModal = document.getElementById('btn-cancelar-modal');
    let currentEficaciaId = null;
    
    cadDataRealizada.valueAsDate = new Date();


    // --- FORM LOGIC ---
    const labelData = document.getElementById('label-data');
    cadTipo.addEventListener('change', () => {
        if (cadTipo.value === 'Treinamento') {
            cadExtra.classList.remove('hidden');
            cadExtraInfo.classList.add('hidden');
        } else if (cadTipo.value === 'Informativo') {
            cadExtra.classList.add('hidden');
            cadExtraInfo.classList.remove('hidden');
        } else {
            cadExtra.classList.add('hidden');
            cadExtraInfo.classList.add('hidden');
        }

        if (cadTipo.value === 'Programado') {
            labelData.innerText = 'DATA PROGRAMADA';
            partContainer.style.display = 'none';
        } else {
            labelData.innerText = 'DATA REALIZADA';
            partContainer.style.display = 'block';
        }
    });

    function renderParticipants() {
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

    renderParticipants();

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

        if (target === 'programados') loadProgramados();
        if (target === 'eficacia') loadEficacia();

        if (target === 'dashboard') loadDashboard();
    }

    // --- SERVIÇOS DE DADOS ---
    async function loadProgramados() {
        const tbody = document.getElementById('tbody-programados');
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

    window.preencherConclusao = (id, atividade, dataProg) => {
        switchTab('cadastro');
        document.getElementById('cad-atividade').value = atividade;
        window.currentProgramadoId = id;
        window.currentProgramadoDate = dataProg;
    };

    async function loadEficacia() {
        const tbody = document.getElementById('tbody-eficacia');
        tbody.innerHTML = '<tr><td colspan="5">Carregando...</td></tr>';
        
        try {
            const all = await dbService.getTreinamentos();
            const data = all.filter(t => t.tipo === 'Treinamento' && !t.eficacia_concluida);

            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5">Nenhuma avaliação pendente.</td></tr>';
                return;
            }

            tbody.innerHTML = data.map(t => {
                const dtVenc = FrontendLogic.parseDate(t.vencimento_eficacia);
                const isVencido = dtVenc && dtVenc < new Date();
                const colorStyle = isVencido ? 'color: #e74c3c; font-weight: bold;' : '';

                return `
                    <tr>
                        <td>${t.atividade}</td>
                        <td>${t.data_realizada}</td>
                        <td style="${colorStyle}">${t.vencimento_eficacia}</td>
                        <td>${t.responsavel_aval}</td>
                        <td>
                            <button class="btn-primary" style="padding: 2px 10px; font-size: 0.7rem;" onclick="darBaixaEficacia('${t.id}')">BAIXA</button>
                        </td>
                    </tr>
                `;
            }).join('');
        } catch (error) {
            tbody.innerHTML = '<tr><td colspan="5">Erro ao carregar dados.</td></tr>';
        }
    }

    // Removido: Usando FrontendLogic.FrontendLogic.parseDate


    window.darBaixaEficacia = (id) => {
        currentEficaciaId = id;
        modalDataAval.valueAsDate = new Date();
        modalResultado.value = '';
        modalEficacia.classList.remove('hidden');
    };

    btnCancelarModal.addEventListener('click', () => {
        modalEficacia.classList.add('hidden');
        currentEficaciaId = null;
    });

    btnSalvarModal.addEventListener('click', async () => {
        if (!currentEficaciaId) return;
        if (!modalDataAval.value || !modalResultado.value) {
            return alert('Preencha a data e o resultado da avaliação.');
        }

        const [year, month, day] = modalDataAval.value.split('-');
        const dataFormatada = `${day}/${month}/${year}`;

        btnSalvarModal.disabled = true;
        btnSalvarModal.innerText = 'SALVANDO...';

        try {
            await dbService.updateTreinamento(currentEficaciaId, { 
                eficacia_concluida: true,
                data_avaliacao: dataFormatada,
                resultado_eficacia: modalResultado.value
            });
            alert('Eficácia concluída e registrada!');
            modalEficacia.classList.add('hidden');
            loadEficacia();
        } catch (error) {
            alert('Erro: ' + error.message);
        } finally {
            btnSalvarModal.disabled = false;
            btnSalvarModal.innerText = 'SALVAR E CONCLUIR';
        }
    });


    async function loadDashboard() {
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
                tbodyDet.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px;">Nenhuma atividade realizada neste período.</td></tr>';
            } else {
                tbodyDet.innerHTML = filtrados.sort((a,b) => FrontendLogic.parseDate(b.data_realizada) - FrontendLogic.parseDate(a.data_realizada)).map(r => `
                    <tr>
                        <td style="font-weight:bold;">${r.atividade}</td>
                        <td>${r.data_realizada}</td>
                        <td>${r.duracao_horas}h</td>
                        <td>${r.responsavel}</td>
                        <td style="font-weight:900; color: ${r.num_doc ? '#28a745' : '#666'};">${r.num_doc || '—'}</td>
                        <td>
                            ${!r.num_doc ? `<button class="btn-table btn-table-num" onclick="atribuirNumero('${r.id}')" title="Atribuir Nº Doc">#</button>` : ''}
                            ${r.num_doc ? `<button class="btn-table btn-table-download" onclick="baixarPDF('${r.id}')" title="Baixar PDF">⬇️</button>` : ''}
                            <button class="btn-table btn-table-delete" onclick="deletarRegistro('${r.id}')" title="Excluir">🗑️</button>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao carregar dados do dashboard.");
        }
    }

    // --- FUNÇÕES DE AÇÃO NA TABELA ---
    window.atribuirNumero = async (id) => {
        try {
            const all = await dbService.getTreinamentos();
            const nums = all.map(d => parseInt(d.num_doc)).filter(n => !isNaN(n));
            const nextNum = nums.length > 0 ? Math.max(...nums) + 1 : 1;
            const numStr = nextNum.toString().padStart(4, '0');
            await dbService.updateTreinamento(id, { num_doc: numStr });
            alert(`Nº DOC ${numStr} atribuído com sucesso!`);
            updateDashboard();
        } catch (e) {
            alert('Erro ao atribuir número: ' + e.message);
        }
    };

    window.baixarPDF = async (id) => {
        try {
            const data = await dbService.getTreinamentos();
            const t = data.find(item => item.id == id);
            if (!t) return;
            const doc = await generateFRRH01(t, t.num_doc);
            doc.save(`REGISTRO_${t.tipo}_${t.num_doc}.pdf`);
            alert('Download iniciado!');
        } catch (e) {
            alert('Erro ao gerar PDF: ' + e.message);
        }
    };

    window.deletarRegistro = async (id) => {
        if (!confirm('Deseja excluir este registro permanentemente?')) return;
        try {
            await dbService.deleteTreinamento(id);
            alert('Registro excluído!');
            updateDashboard();
        } catch (e) {
            alert('Erro ao excluir: ' + e.message);
        }
    };


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

        const ctx = document.getElementById('chart-tendencia').getContext('2d');
        if (window.tendenciaChart) window.tendenciaChart.destroy();
        window.tendenciaChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: sortedKeys,
                datasets: [{
                    label: 'Nº Treinamentos',
                    data: sortedKeys.map(k => tendencia[k]),
                    borderColor: '#1a3d6b',
                    backgroundColor: 'rgba(26, 61, 107, 0.1)',
                    fill: true, tension: 0.3
                }]
            },
            options: { responsive: true, plugins: { legend: { display: false } } }
        });
    }



    // --- SALVAR CADASTRO ---
    btnSalvarCad.addEventListener('click', async () => {
        const atividade = document.getElementById('cad-atividade').value.toUpperCase();
        const tipo = cadTipo.value;
        const duracao = parseFloat(document.getElementById('cad-duracao').value);
        const responsavel = document.getElementById('cad-responsavel').value.toUpperCase();
        const dataRealizada = cadDataRealizada.value;
        const selectedParts = Array.from(document.querySelectorAll('.part-check:checked')).map(c => c.value.toUpperCase());


        if (!tipo || !atividade || !responsavel || (tipo !== 'Programado' && selectedParts.length === 0)) {
            alert('Por favor, preencha os campos obrigatórios e selecione ao menos um participante.');
            return;
        }

        let extraData = {};
        if (tipo === 'Treinamento') {
            const dias = parseInt(document.getElementById('cad-prazo-eficacia').value);
            const respAval = document.getElementById('cad-resp-aval').value;
            const criterios = document.getElementById('cad-criterios').value;
            if (!respAval || !criterios) return alert('Preencha os campos de avaliação de eficácia.');
            const [y, m, d] = dataRealizada.split('-').map(Number);
            const dt = new Date(y, m - 1, d);
            dt.setDate(dt.getDate() + dias);
            extraData = {
                dias_eficacia: dias.toString(),
                vencimento_eficacia: dt.toLocaleDateString('pt-BR'),
                criterios: criterios.toUpperCase(),
                responsavel_aval: respAval.toUpperCase(),
                eficacia_concluida: false,
                descricao_atividade: document.getElementById('cad-descricao-treinamento').value.toUpperCase()
            };
        } else if (tipo === 'Informativo') {
            extraData = { descricao_atividade: document.getElementById('cad-descricao-informativo').value.toUpperCase() };
        }


        const isProg = (tipo === 'Programado');
        const [year, month, day] = dataRealizada.split('-');
        const dataFormatada = `${day}/${month}/${year}`;

        const payload = isProg ? {
            tipo, atividade, duracao_horas: duracao, responsavel, data_programada: dataFormatada, participantes: selectedParts
        } : {
            tipo, atividade, duracao_horas: duracao, responsavel, data_programada: window.currentProgramadoDate || "", data_realizada: dataFormatada, participantes: selectedParts, ...extraData
        };

        btnSalvarCad.disabled = true;
        btnSalvarCad.innerText = 'SALVANDO...';

        try {
            if (isProg) await dbService.saveProgramado(payload);
            else await dbService.saveTreinamento(payload);

            alert('Gravado com sucesso!');
            if (window.currentProgramadoId) {
                await dbService.deleteProgramado(window.currentProgramadoId);
                window.currentProgramadoId = null;
                window.currentProgramadoDate = null;
            }

            // Reset Form
            cadTipo.value = '';
            cadTipo.dispatchEvent(new Event('change'));
            document.getElementById('cad-atividade').value = '';
            document.getElementById('cad-duracao').value = '1.0';
            document.getElementById('cad-responsavel').value = '';
            document.getElementById('cad-data-realizada').value = '';
            document.getElementById('cad-prazo-eficacia').value = '30';
            document.getElementById('cad-resp-aval').value = '';
            document.getElementById('cad-criterios').value = '';
            document.getElementById('cad-descricao-treinamento').value = '';
            document.getElementById('cad-descricao-informativo').value = '';
            document.querySelectorAll('.part-check').forEach(c => c.checked = false);
            document.getElementById('check-all-parts').checked = false;
        } catch (error) {
            alert('Erro ao salvar: ' + error.message);
        } finally {
            btnSalvarCad.disabled = false;
            btnSalvarCad.innerText = 'SALVAR NO BANCO DE DADOS';
        }
    });
});

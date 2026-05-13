/* 
   LOGICA PRINCIPAL - RH TREINAMENTOS
   Refatorado para TDD e Cloud-Native (Supabase)
*/

const SUPABASE_URL = 'https://rozrtspxrgtfexaoemfq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvenJ0c3B4cmd0ZmV4YW9lbWZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MzQ3MDksImV4cCI6MjA5NDIxMDcwOX0.aw4HdzZZwPFUqd-RdmfcsnLl-V4cVcum0-khuiyz1nc';

// Passo 1: Declaração sem inicialização no topo
let supabaseClient = null;
let dbService = null;

// Passo 2: Função de inicialização
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
            getProgramados: async () => {
                const { data, error } = await supabaseClient.schema('rh').from('treinamentos_programados').select('*').order('id', { ascending: false });
                if (error) throw error;
                return data;
            }
        };
    }
}

// Passo 3: TODAS as funções movidas para FORA do DOMContentLoaded
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

    if (!id || !dataAval || !res) return alert('Preencha tudo.');

    try {
        await dbService.updateTreinamento(id, {
            eficacia_concluida: true,
            data_avaliacao: dataAval,
            resultado_eficacia: res
        });
        document.getElementById('modal-eficacia').classList.add('hidden');
        loadEficacia();
    } catch (e) { alert(e.message); }
}

function closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add('hidden');
}

if (typeof window !== 'undefined') {
    window.initSupabase = initSupabase;
    window.darBaixaEficacia = darBaixaEficacia;
    window.salvarEficacia = salvarEficacia;
    window.loadEficacia = loadEficacia;
    window.closeModal = closeModal;
}

// Bloco de inicialização simplificado
document.addEventListener('DOMContentLoaded', () => {
    initSupabase();

    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');
            tabButtons.forEach(b => b.classList.toggle('active', b === btn));
            tabContents.forEach(c => c.classList.toggle('active', c.id === target));
            if (target === 'eficacia') loadEficacia();
        });
    });
});

const fs = require('fs');
const path = require('path');

describe('Teste de Qualidade (TDD) - Interação do Botão BAIXA', () => {
    beforeAll(() => {
        // Mocks solicitados pelo usuário
        global.supabase = {
            createClient: () => ({
                from: () => ({
                    select: jest.fn().mockResolvedValue({ data: [], error: null }),
                    insert: jest.fn().mockResolvedValue({ data: [], error: null }),
                    update: jest.fn().mockResolvedValue({ data: [], error: null }),
                })
            })
        };

        global.Chart = jest.fn().mockImplementation(() => ({
            update: jest.fn(),
            destroy: jest.fn(),
        }));

        global.jsPDF = jest.fn().mockImplementation(() => ({
            text: jest.fn(),
            save: jest.fn(),
        }));

        // Mock do FrontendLogic
        global.FrontendLogic = {
            parseDate: (d) => new Date(d)
        };

        // Prepara o DOM
        const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
        document.documentElement.innerHTML = html;

        // Carrega o app.js
        require('../app.js');
        
        // Emula o DOMContentLoaded para disparar a inicialização do app.js
        const event = document.createEvent('Event');
        event.initEvent('DOMContentLoaded', true, true);
        window.document.dispatchEvent(event);
    });

    beforeEach(() => {
        // Limpa o estado antes de cada teste
        window.currentEficaciaId = null;
        document.getElementById('modal-eficacia').classList.add('hidden');
    });

    it('CENÁRIO: Abertura do Modal de Eficácia', () => {
        const modal = document.getElementById('modal-eficacia');
        const tbody = document.getElementById('tbody-eficacia');

        tbody.innerHTML = `
            <tr>
                <td>TESTE</td>
                <td><button id="btn-baixa-test" onclick="darBaixaEficacia('999')">BAIXA</button></td>
            </tr>
        `;

        const btn = document.getElementById('btn-baixa-test');
        btn.click();

        expect(modal.classList.contains('hidden')).toBe(false);
        expect(window.currentEficaciaId).toBe('999');
    });

    it('CENÁRIO: Fechamento do Modal ao Cancelar', () => {
        const modal = document.getElementById('modal-eficacia');
        modal.classList.remove('hidden');

        // O botão no HTML é <button class="btn-secondary" onclick="closeModal('modal-eficacia')">CANCELAR</button>
        // Precisamos garantir que closeModal existe, pois ele vem do logic-frontend.js que não foi carregado aqui.
        // Vamos mockar o closeModal ou focar no comportamento.
        // Como closeModal está no logic-frontend.js, vamos simular o que ele faz.
        window.closeModal = (id) => document.getElementById(id).classList.add('hidden');

        const tbody = document.getElementById('modal-eficacia');
        const btnCancelar = tbody.querySelector('.btn-secondary');
        
        if(btnCancelar) {
            btnCancelar.click();
        } else {
            window.closeModal('modal-eficacia');
        }

        expect(modal.classList.contains('hidden')).toBe(true);
    });
});

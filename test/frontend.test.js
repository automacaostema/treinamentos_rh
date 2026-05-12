const { expect } = require('chai');
const FrontendLogic = require('../logic-frontend');

describe('Frontend Logic - Dashboard & Dates', () => {
    
    describe('parseDate', () => {
        it('deve converter string "DD/MM/YYYY" para objeto Date', () => {
            const date = FrontendLogic.parseDate('12/05/2026');
            expect(date.getDate()).to.equal(12);
            expect(date.getMonth()).to.equal(4); // Maio é 4 (0-indexed)
            expect(date.getFullYear()).to.equal(2026);
        });

        it('deve retornar null para valores vazios', () => {
            expect(FrontendLogic.parseDate('')).to.be.null;
        });
    });

    describe('calculateKPIs', () => {
        const mockRealizados = [
            { tipo: 'Treinamento', atividade: 'T1', duracao_horas: 2, data_realizada: '10/05/2026', data_programada: '10/05/2026' },
            { tipo: 'Treinamento', atividade: 'T2', duracao_horas: 3, data_realizada: '11/05/2026', data_programada: '' }
        ];
        const mockProgramados = [
            { tipo: 'Treinamento', atividade: 'T3', duracao_horas: 4, data_programada: '20/05/2026' }
        ];

        it('deve calcular corretamente o total de horas realizadas', () => {
            const kpis = FrontendLogic.calculateKPIs(mockRealizados, mockProgramados);
            expect(kpis.totalHorasReal).to.equal(5); // 2 + 3
        });

        it('deve calcular corretamente a taxa de execução', () => {
            // Planejados: T3 (programado) + T1 (realizado que era programado) = 2
            // Executados (que eram planejados): T1 = 1
            // Taxa: 1 / 2 = 50%
            const kpis = FrontendLogic.calculateKPIs(mockRealizados, mockProgramados);
            expect(kpis.taxaExec).to.equal(50);
        });

        it('deve filtrar por data corretamente', () => {
            // Filtro apenas dia 10/05
            const kpis = FrontendLogic.calculateKPIs(mockRealizados, mockProgramados, '2026-05-10', '2026-05-10');
            expect(kpis.filtrados).to.have.lengthOf(1);
            expect(kpis.filtrados[0].atividade).to.equal('T1');
        });
    });
});

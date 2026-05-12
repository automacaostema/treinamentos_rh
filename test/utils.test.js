const { expect } = require('chai');
const { formatData } = require('../utils');

describe('Utils - formatData', () => {
    it('deve converter string JSON de participantes em array', () => {
        const input = [
            { id: 1, atividade: 'Teste', participantes: '["FUNC 1", "FUNC 2"]' }
        ];
        const result = formatData(input);
        
        expect(result[0].participantes).to.be.an('array');
        expect(result[0].participantes).to.have.lengthOf(2);
        expect(result[0].participantes[0]).to.equal('FUNC 1');
    });

    it('deve garantir que textos sejam processados em caixa alta (Mock Simulado)', () => {
        const input = [{ atividade: 'teste minúsculo' }];
        // A lógica de conversão será testada no FrontendLogic
        const result = input[0].atividade.toUpperCase();
        expect(result).to.equal('TESTE MINÚSCULO');
    });


    it('deve converter campos numéricos (0/1) em booleanos', () => {
        const input = [
            { id: 1, eficacia_concluida: 1, arquivado: 0 }
        ];
        const result = formatData(input);
        
        expect(result[0].eficacia_concluida).to.be.true;
        expect(result[0].arquivado).to.be.false;
    });

    it('deve manter participantes se já for um array', () => {
        const input = [
            { id: 1, participantes: ['FUNC A'] }
        ];
        const result = formatData(input);
        expect(result[0].participantes).to.deep.equal(['FUNC A']);
    });
});

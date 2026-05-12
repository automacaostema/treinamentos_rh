const request = require('supertest');
const { expect } = require('chai');
const { app, pool } = require('../server');

describe('API Integration - Ciclo Completo', () => {
    
    // Fecha a conexão com o banco após todos os testes
    after(async () => {
        await pool.end();
    });

    it('Deve realizar o ciclo CRUD completo de um treinamento', async () => {
        // 1. POST - Criar
        const novoTreinamento = {
            tipo: 'Treinamento',
            atividade: 'TREINAMENTO DE TESTE TDD',
            duracao_horas: 2.5,
            responsavel: 'SISTEMA DE TESTE',
            participantes: ['FUNC TESTE 1', 'FUNC TESTE 2'],
            data_realizada: '12/05/2026'
        };

        const postRes = await request(app)
            .post('/api/treinamentos')
            .send(novoTreinamento);
        
        expect(postRes.status).to.equal(201);
        const testId = postRes.body.id;
        expect(testId).to.be.a('number');

        // 2. GET - Verificar se existe na lista
        const getRes = await request(app).get('/api/treinamentos');
        const criado = getRes.body.find(t => t.id === testId);
        
        expect(criado).to.exist;
        expect(criado.atividade).to.equal('TREINAMENTO DE TESTE TDD');
        expect(criado.participantes).to.be.an('array').with.lengthOf(2);

        // 3. DELETE - Limpar o banco
        const delRes = await request(app).delete(`/api/treinamentos/${testId}`);
        expect(delRes.status).to.equal(200);
        expect(delRes.body.success).to.be.true;

        // 4. GET Final - Confirmar exclusão
        const getFinal = await request(app).get('/api/treinamentos');
        const excluido = getFinal.body.find(t => t.id === testId);
        expect(excluido).to.not.exist;
    });
});

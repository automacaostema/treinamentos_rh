/**
 * Funções utilitárias para o backend
 */

const formatData = (rows) => {
    return rows.map(row => ({
        ...row,
        participantes: typeof row.participantes === 'string' ? JSON.parse(row.participantes) : row.participantes,
        eficacia_concluida: !!row.eficacia_concluida,
        arquivado: !!row.arquivado
    }));
};

module.exports = {
    formatData
};

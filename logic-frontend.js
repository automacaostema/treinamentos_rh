/**
 * Lógica pura do Frontend (Independente de DOM)
 */

const FrontendLogic = {
    parseDate: (str) => {
        if (!str) return null;
        const [d, m, y] = str.split('/');
        return new Date(y, m - 1, d);
    },

    calculateKPIs: (realizados, programados, filtroInicio = null, filtroFim = null) => {
        const filtrados = realizados.filter(r => {
            if (!filtroInicio && !filtroFim) return true;
            const dt = FrontendLogic.parseDate(r.data_realizada);
            const dtInicio = filtroInicio ? new Date(filtroInicio.replace(/-/g, '/')) : new Date(0);
            const dtFim = filtroFim ? new Date(filtroFim.replace(/-/g, '/')) : new Date(8640000000000000);

            if (filtroFim) dtFim.setHours(23, 59, 59);
            return dt >= dtInicio && dt <= dtFim;
        });

        const totalHorasReal = filtrados.reduce((acc, curr) => acc + (parseFloat(curr.duracao_horas) || 0), 0);
        const totalHorasProg = programados.reduce((acc, curr) => acc + (parseFloat(curr.duracao_horas) || 0), 0);
        
        const hoje = new Date();
        const vencidos = realizados.filter(r => {
            if (r.tipo !== 'Treinamento' || r.eficacia_concluida) return false;
            const dtVenc = FrontendLogic.parseDate(r.vencimento_eficacia);
            return dtVenc && dtVenc < hoje;
        }).length;

        const concluidosQueEramProg = filtrados.filter(r => r.data_programada && r.data_programada !== "").length;
        const totalPlanejado = programados.length + concluidosQueEramProg;
        const taxaExec = totalPlanejado > 0 ? (concluidosQueEramProg / totalPlanejado * 100) : 0;

        return {
            filtrados,
            totalHorasReal,
            totalHorasProg,
            vencidos,
            taxaExec
        };
    }
};

// Export para Node (Testes)
if (typeof module !== 'undefined') {
    module.exports = FrontendLogic;
}

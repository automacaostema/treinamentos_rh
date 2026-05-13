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
        const dtInicio = filtroInicio ? new Date(filtroInicio.replace(/-/g, '/')) : new Date(0);
        const dtFim = filtroFim ? new Date(filtroFim.replace(/-/g, '/')) : new Date(8640000000000000);
        if (filtroFim) dtFim.setHours(23, 59, 59);

        // Filtrados para exibir na tabela (por data de realização)
        const filtrados = realizados.filter(r => {
            const dt = FrontendLogic.parseDate(r.data_realizada);
            return dt >= dtInicio && dt <= dtFim;
        });

        // HORAS REALIZADAS: Soma de tudo que foi realizado no período
        const totalHorasReal = filtrados.reduce((acc, curr) => acc + (parseFloat(curr.duracao_horas) || 0), 0);

        // HORAS PROGRAMADAS: Soma de tudo que estava PLANEJADO para o período (pendente ou já feito)
        const progPendentesNoPeriodo = programados.filter(p => {
            const dt = FrontendLogic.parseDate(p.data_programada);
            return dt >= dtInicio && dt <= dtFim;
        });

        const progRealizadosNoPeriodo = realizados.filter(r => {
            if (!r.data_programada || r.data_programada === "") return false;
            const dt = FrontendLogic.parseDate(r.data_programada);
            return dt >= dtInicio && dt <= dtFim;
        });

        const totalHorasProg = [...progPendentesNoPeriodo, ...progRealizadosNoPeriodo]
            .reduce((acc, curr) => acc + (parseFloat(curr.duracao_horas) || 0), 0);
        
        const hoje = new Date();
        const vencidos = realizados.filter(r => {
            if (r.tipo !== 'Treinamento' || r.eficacia_concluida) return false;
            const dtVenc = FrontendLogic.parseDate(r.vencimento_eficacia);
            return dtVenc && dtVenc < hoje;
        }).length;

        // TAXA DE EXECUÇÃO: Baseada no que foi planejado para o período
        const totalPlanejadoCount = progPendentesNoPeriodo.length + progRealizadosNoPeriodo.length;
        const realizadosQueEramProgCount = progRealizadosNoPeriodo.length;
        const taxaExec = totalPlanejadoCount > 0 ? (realizadosQueEramProgCount / totalPlanejadoCount * 100) : 0;

        return {
            filtrados,
            totalHorasReal,
            totalHorasProg,
            vencidos,
            taxaExec
        };
    },

    formatTrainingLabel: (t) => {
        const prefix = t.num_doc ? `${t.num_doc.toString().padStart(4, '0')} - ` : '';
        return `${prefix}${t.tipo} - ${t.atividade} (${t.data_realizada})`.toUpperCase();
    }
};

// Export para Node (Testes)
if (typeof module !== 'undefined') {
    module.exports = FrontendLogic;
}

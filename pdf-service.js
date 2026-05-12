/* 
   SERVIÇO DE GERAÇÃO DE PDF - FR-RH-01
   Utiliza jsPDF e jsPDF-AutoTable
*/

async function generateFRRH01(registro, numDoc) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const larguraUtil = 175; // A4 width is 210, minus margins
    
    const COR_PRIMARIA = [26, 61, 107]; // #1A3D6B
    const COR_CABECALHO = [232, 237, 244]; // #E8EDF4
    const COR_BORDA = [197, 205, 217]; // #C5CDD9

    // --- FUNÇÃO DO CABEÇALHO ---
    const drawHeader = (data) => {
        // Logo (Assuming logo.png is in the same dir)
        try {
            // Ajustado: Proporção corrigida para evitar distorção (Largura 45, Altura 14)
            doc.addImage('logo.png', 'PNG', 18, 10, 45, 14);
        } catch(e) {}


        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(COR_PRIMARIA[0], COR_PRIMARIA[1], COR_PRIMARIA[2]);
        doc.text("FORMULÁRIO DE TREINAMENTO FR-RH-01 - REV01", 105, 32, { align: "center" });

        doc.setDrawColor(COR_PRIMARIA[0], COR_PRIMARIA[1], COR_PRIMARIA[2]);
        doc.setLineWidth(1);
        doc.line(18, 38, 192, 38);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        const paddedNum = (numDoc || '').toString().padStart(4, '0');
        doc.text(`Nº Doc: ${paddedNum || '______'}`, 192, 45, { align: "right" });
    };


    // --- CONTEÚDO PÁGINA 1 ---
    drawHeader();

    const bodyData = [
        ["TIPO", (registro.tipo || "—").toUpperCase()],
        ["ATIVIDADE", (registro.atividade || "—").toUpperCase()],
        ["DURAÇÃO (HORAS)", `${registro.duracao_horas || "—"}H`],
        ["RESPONSÁVEL", (registro.responsavel || "—").toUpperCase()],
        ["DATA PROGRAMADA", (registro.data_programada || "—").toUpperCase()],
        ["DATA REALIZADA", (registro.data_realizada || "—").toUpperCase()]
    ];


    doc.autoTable({
        startY: 50,
        margin: { left: 18, right: 18 },
        body: bodyData,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3, lineColor: COR_BORDA, lineWidth: 0.1 },
        columnStyles: { 
            0: { fillColor: COR_CABECALHO, fontStyle: 'bold', cellWidth: 60 },
            1: { fillColor: [255, 255, 255] }
        }
    });

    let currentY = doc.lastAutoTable.finalY + 10;

    // Descrição da Atividade (apenas para Informativo - aparece aqui)
    if (registro.tipo === "Informativo") {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(COR_PRIMARIA[0], COR_PRIMARIA[1], COR_PRIMARIA[2]);
        doc.text("DESCRIÇÃO DA ATIVIDADE", 18, currentY);
        
        doc.setDrawColor(COR_BORDA[0], COR_BORDA[1], COR_BORDA[2]);
        doc.rect(18, currentY + 3, larguraUtil, 35);
        
        if (registro.descricao_atividade) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            const splitDesc = doc.splitTextToSize(registro.descricao_atividade, larguraUtil - 4);
            doc.text(splitDesc, 20, currentY + 9);
        }
        
        currentY += 45;
    }

    // Seção de Eficácia
    if (registro.tipo === "Treinamento") {
        doc.text("AVALIAÇÃO DE EFICÁCIA", 18, currentY);
        
        const eficData = [
            ["PRAZO P/ AVALIAÇÃO (DIAS)", "VENCIMENTO DA AVALIAÇÃO", "RESPONSÁVEL PELA AVALIAÇÃO"],
            [registro.dias_eficacia || "—", (registro.vencimento_eficacia || "—").toUpperCase(), (registro.responsavel_aval || "—").toUpperCase()]
        ];


        doc.autoTable({
            startY: currentY + 3,
            margin: { left: 18, right: 18 },
            head: [eficData[0]],
            body: [eficData[1]],
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 2, lineColor: COR_BORDA, lineWidth: 0.1 },
            headStyles: { fillColor: COR_CABECALHO, textColor: [85, 96, 112], fontStyle: 'bold' }
        });

        currentY = doc.lastAutoTable.finalY + 10;

        if (registro.criterios) {
            doc.setFontSize(8);
            doc.text("CRITÉRIOS DE AVALIAÇÃO:", 18, currentY);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            const splitCriterios = doc.splitTextToSize(registro.criterios, larguraUtil - 4);
            doc.text(splitCriterios, 20, currentY + 5);
            doc.rect(18, currentY + 1, larguraUtil, (splitCriterios.length * 5) + 5);
            currentY += (splitCriterios.length * 5) + 15;
        }

        // Descrição da Atividade (para Treinamento - após critérios)
        if (registro.descricao_atividade) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(COR_PRIMARIA[0], COR_PRIMARIA[1], COR_PRIMARIA[2]);
            doc.text("DESCRIÇÃO DA ATIVIDADE", 18, currentY);
            
            doc.setDrawColor(COR_BORDA[0], COR_BORDA[1], COR_BORDA[2]);
            doc.rect(18, currentY + 3, larguraUtil, 35);
            
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            const splitDesc = doc.splitTextToSize(registro.descricao_atividade, larguraUtil - 4);
            doc.text(splitDesc, 20, currentY + 9);
            
            currentY += 45;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(COR_PRIMARIA[0], COR_PRIMARIA[1], COR_PRIMARIA[2]);
        doc.text("DESCRIÇÃO DA AVALIAÇÃO DA EFICÁCIA", 18, currentY);
        doc.rect(18, currentY + 3, larguraUtil, 40);
        currentY += 55;
    }

    // Assinatura
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Assinatura do responsável: ____________________________________________________", 18, currentY);

    // --- PÁGINA 2: LISTA DE PRESENÇA ---
    if (registro.participantes && registro.participantes.length > 0) {
        doc.addPage();
        drawHeader();

        doc.setFont("helvetica", "bold");
        doc.setFontSize(15);
        doc.setTextColor(COR_PRIMARIA[0], COR_PRIMARIA[1], COR_PRIMARIA[2]);
        doc.text("LISTA DE PRESENÇA", 105, 55, { align: "center" });

        const partRows = registro.participantes.map((nome, index) => [
            index + 1,
            nome,
            ""
        ]);

        doc.autoTable({
            startY: 65,
            margin: { left: 18, right: 18 },
            head: [["Nº", "NOME DO FUNCIONÁRIO", "ASSINATURA"]],
            body: partRows,
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 4, valign: 'middle' },
            headStyles: { fillColor: COR_CABECALHO, textColor: [0, 0, 0], fontStyle: 'bold' },
            columnStyles: {
                0: { cellWidth: 15, halign: 'center' },
                2: { cellWidth: 50, halign: 'center' }
            }
        });
    }

    // --- PAGINAÇÃO (RODAPÉ) ---
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`${i} de ${totalPages}`, 105, 290, { align: "center" });
    }

    return doc;
}

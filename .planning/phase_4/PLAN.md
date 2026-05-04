# Plano de Execução: Fase 4 - Dashboard e Indicadores (Chart.js)

## Objetivo
Implementar um painel visual de indicadores para monitoramento do desempenho de treinamentos, utilizando a biblioteca **Chart.js**.

## Tarefas

### 4.1 - Configuração de Bibliotecas
- [ ] Adicionar `Chart.js` via CDN no `index.html`.
- [ ] Criar estrutura de containers para os gráficos e cards KPI.

### 4.2 - Lógica de Processamento de Dados (`app.js`)
- [ ] Implementar filtros de período (Data Início / Fim).
- [ ] Desenvolver função `calculateKPIs()`:
    - [ ] Calcular taxa de execução (Programados vs Realizados).
    - [ ] Somar horas realizadas e programadas.
    - [ ] Identificar eficácias vencidas.
- [ ] Implementar função `renderCharts()`:
    - [ ] Gráfico de pizza/barra para tipos de atividade.
    - [ ] Gráfico de linha para tendência de treinamentos por mês (opcional/desejável).

### 4.3 - Interface do Dashboard
- [ ] Desenvolver grid de cards KPI com design premium.
- [ ] Garantir responsividade dos gráficos.
- [ ] Adicionar botão de "Atualizar Dashboard".

### 4.4 - Refinamento Visual
- [ ] Aplicar as cores da marca (STEMA - Azul e Cinza Industrial) nos gráficos.
- [ ] Adicionar tooltips e legendas claras.

## Critérios de Aceite (UAT)
- [ ] Os indicadores devem bater exatamente com a lógica do script Python original.
- [ ] O filtro de data deve atualizar instantaneamente os gráficos.
- [ ] A interface deve ser limpa e profissional (STEMA aesthetic).

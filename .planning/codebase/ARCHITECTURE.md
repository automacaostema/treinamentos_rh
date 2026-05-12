# ARCHITECTURE.md

## Visão Geral
O projeto segue uma arquitetura **Single Page Application (SPA)** baseada em abas, utilizando apenas tecnologias nativas do navegador (HTML/CSS/JS) sem frameworks como React ou Vue.

## Fluxo de Dados
1. O usuário interage com a interface (abas/formulários).
2. `app.js` captura os eventos e realiza chamadas assíncronas ao Supabase.
3. O estado da interface é atualizado dinamicamente manipulando o DOM.
4. O `pdf-service.js` é acionado para processamento pesado de geração de arquivos no lado do cliente.

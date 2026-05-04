# RH - Controle de Treinamentos (Refatoração HTML)

## Objetivo
Refatorar a aplicação atual de controle de treinamentos, migrando de Streamlit (Python) para uma interface **HTML/JS minimalista e premium**, mantendo todas as integrações com o Supabase e a lógica de geração de PDFs.

## Stack Alvo
- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+).
- **Backend/API**: Supabase JS SDK.
- **PDF**: jsPDF + jsPDF-AutoTable.
- **Estética**: Design minimalista, dark mode opcional, alta performance.

## Funcionalidades Principais
1. **Autenticação**: Tela de login simples.
2. **Cadastro**: Formulário de novos treinamentos/informativos.
3. **Gestão de Programados**: Visualização e conclusão de treinamentos agendados.
4. **Gestão de Eficácia**: Controle de avaliações pendentes e vencidas.
5. **Geração de PDF**: Download do formulário FR-RH-01 fiel ao layout original.
6. **Dashboard**: Indicadores visuais de performance do RH.

## Metas de Design
- Layout "Wow" (premium).
- Micro-animações para feedback de usuário.
- Interface limpa e intuitiva (GSD-style).

# Preocupações e Pontos de Atenção

## Segurança
- **Credenciais Hardcoded**: Usuário e senha de acesso definidos diretamente no código (Linha 45).
- **Segredos**: Dependência de `st.secrets` que deve estar corretamente configurado no `.streamlit/secrets.toml`.

## Manutenibilidade
- **Arquivo Único**: O arquivo `cadastro_treinamento.py` está ficando grande (~800 linhas), dificultando a manutenção.
- **Acoplamento**: Alta dependência entre a UI (Streamlit) e a lógica de PDF (ReportLab).

## Refatoração
- A migração para HTML/JS exigirá a substituição do ReportLab por uma biblioteca JS compatível (ex: jsPDF).

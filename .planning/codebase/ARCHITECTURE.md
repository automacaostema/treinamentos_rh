# Arquitetura

## Padrão de Design
- **Monolítico**: Toda a aplicação (UI e Lógica) reside no arquivo `cadastro_treinamento.py`.
- **Paradigma**: Programação procedural e funcional.

## Fluxo de Dados
1. Usuário acessa o Streamlit.
2. Autenticação via `st.session_state`.
3. Interação com Supabase para CRUD de treinamentos.
4. Geração de PDF em memória (`io.BytesIO`) para download.

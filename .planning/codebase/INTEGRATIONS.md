# INTEGRATIONS.md

## Supabase
- **URL**: Definida em `config.json`.
- **Chave Anônima**: Definida em `config.json`.
- **Tabelas Principais**:
    - `treinamentos`: Armazena dados de treinamentos, informativos e programados.
    - `participantes`: (Provável) Lista de funcionários para seleção.

## PDF Service
- Gera o formulário `FR-RH-01` utilizando os dados extraídos do banco.
- Depende de `jspdf` e `jspdf-autotable`.

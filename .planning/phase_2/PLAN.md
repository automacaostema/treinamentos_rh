# Plano de Execução: Fase 2 - Integração de Dados (Supabase)

## Objetivo
Conectar a interface HTML ao Supabase usando o JavaScript SDK, permitindo CRUD real de treinamentos e persistência de dados.

## Tarefas

### 2.1 - Setup do SDK
- [ ] Adicionar o CDN do Supabase JS no `index.html`.
- [ ] Inicializar o cliente Supabase no `app.js`.

### 2.2 - Serviços de Dados
- [ ] Implementar `fetchTreinamentos()`: Busca todos da tabela `treinamentos` (schema: `treinamentos`).
- [ ] Implementar `fetchProgramados()`: Busca da tabela `treinamentos_programados`.
- [ ] Implementar lógica de salvamento para novos cadastros.

### 2.3 - UI Dinâmica (Cadastro)
- [ ] Criar o formulário de Cadastro conforme o layout industrial.
- [ ] Adicionar multiselect customizado para Participantes (estilo minimalista).
- [ ] Implementar validação de campos obrigatórios.

### 2.4 - UI Dinâmica (Programados e Eficácia)
- [ ] Criar tabelas dinâmicas para listar treinamentos.
- [ ] Implementar botões de "Concluir" (migração entre tabelas) e "Dar Baixa" (eficácia).

## Critérios de Aceite (UAT)
- [ ] Dados salvos no HTML devem aparecer no Supabase Dashboard.
- [ ] O app deve carregar os dados reais ao abrir as abas.
- [ ] Mensagens de sucesso/erro devem seguir o estilo minimalista.

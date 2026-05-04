# Plano de Execução: Fase 3 - Geração de PDF (jsPDF)

## Objetivo
Implementar a geração do formulário oficial FR-RH-01 (Lista de Presença) diretamente no navegador, mantendo a fidelidade visual do modelo original.

## Tarefas

### 3.1 - Configuração de Bibliotecas
- [ ] Adicionar `jsPDF` e `jsPDF-AutoTable` via CDN no `index.html`.
- [ ] Incluir suporte a fontes e imagens (logo STEMA).

### 3.2 - Módulo de PDF (`pdf-service.js`)
- [ ] Criar função `generateFRRH01(data, numDoc)`:
    - [ ] Desenhar cabeçalho com logo e título REV01.
    - [ ] Criar grade de informações gerais.
    - [ ] Adicionar seções de "Descrição da Atividade" e "Avaliação de Eficácia".
    - [ ] Gerar segunda página com a lista de participantes e campo para assinatura.

### 3.3 - Integração na UI
- [ ] Implementar a aba **04 - Gerar PDF**:
    - [ ] Listar treinamentos cadastrados.
    - [ ] Lógica de numeração de documentos (atribuir próximo número se pendente).
    - [ ] Botão de "Baixar PDF".

### 3.4 - Refinamento Visual
- [ ] Garantir que as cores (Azul STEMA, cinzas de cabeçalho) correspondam ao original.
- [ ] Testar quebra de página automática para listas longas.

## Critérios de Aceite (UAT)
- [ ] O PDF gerado deve ser idêntico ao produzido pelo script Python anterior.
- [ ] O número do documento deve ser gravado no Supabase ao ser gerado.
- [ ] O arquivo deve ser baixado com o nome correto: `Registro_[TIPO]_[NUM].pdf`.

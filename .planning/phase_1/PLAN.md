# Plano de Execução: Fase 1 - Fundação e Design

## Objetivo
Estabelecer a base visual e estrutural do app em HTML/CSS/JS, garantindo a estética minimalista "STEMA" e o sistema de navegação por abas.

## Tarefas

### 1.1 - Estrutura Base (HTML)
- [ ] Criar `index.html`.
- [ ] Implementar `header` com título e identificação do usuário.
- [ ] Criar container de navegação (Abas: Cadastro, Programados, Eficácia, PDF, Dashboard).
- [ ] Estruturar as `section` de cada aba (inicialmente vazias).
- [ ] Implementar o modal/overlay de Login.

### 1.2 - Design System (CSS)
- [ ] Definir variáveis CSS (tokens) baseadas no `UI-SPEC.md`.
- [ ] Estilizar `header` e abas com bordas pretas e estados ativos.
- [ ] Criar classes utilitárias para botões (`.btn-black`) e formulários (`.form-group`).
- [ ] Garantir responsividade básica.

### 1.3 - Comportamento (JS)
- [ ] Implementar script de troca de abas (Vanilla JS).
- [ ] Criar lógica de exibição/ocultação da tela de login.
- [ ] Setup inicial do arquivo `app.js` para futuras integrações.

## Critérios de Aceite (UAT)
- [ ] O visual deve ser idêntico aos prints fornecidos.
- [ ] A navegação entre abas deve ser instantânea e funcional.
- [ ] A tela de login deve aparecer primeiro ao carregar o app.

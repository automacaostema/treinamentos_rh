# UI-SPEC: RH - Controle de Treinamentos

## 1. Design Tokens (Estilo STEMA)

### Cores
- **Background**: `#FFFFFF` (Branco puro)
- **Texto Primário**: `#000000` (Preto puro)
- **Bordas**: `#000000` (1px solid)
- **Destaque (Ativo)**: `#000000` (Fundo preto, texto branco)
- **Hover/Interação**: `#333333` (Cinza escuro para botões)

### Tipografia
- **Família**: 'Inter', sans-serif (Google Fonts)
- **Headings**: Bold/Extra-Bold, UPPERCASE para títulos de seções.
- **Labels**: Semi-bold, tamanho 12px, UPPERCASE.
- **Inputs**: Regular, 14px, padding 10px.

## 2. Componentes Estruturais

### Login
- Card centralizado com borda preta grossa.
- Título em destaque à esquerda.
- Botão "ENTRAR" ocupando largura total.

### Header & Navegação
- Barra superior fixa com nome do sistema e botão "SAIR" (estilo outline).
- Sistema de abas horizontais:
  - Inativo: Fundo branco, borda preta.
  - Ativo: Fundo preto, texto branco.

### Formulários
- Labels acima dos campos.
- Inputs com borda preta nítida (sem arredondamento).
- Seções separadas por linhas horizontais (`<hr>` estilo 1px preto).

### Dashboards/Cards
- Layout de grid limpo.
- Métricas em texto grande e negrito.
- Sem sombras ou gradientes (estética Flat Industrial).

## 3. Micro-animações
- Transição suave de opacidade no carregamento das abas.
- Inversão de cor instantânea nos botões ao passar o mouse.

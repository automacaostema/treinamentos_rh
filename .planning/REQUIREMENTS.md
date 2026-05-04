# Requisitos do Projeto

## Funcionais (RF)
- [ ] **RF01 - Login**: Autenticação simples (rh_stema / rh123).
- [ ] **RF02 - CRUD Treinamentos**: Integração total com o schema `treinamentos` do Supabase.
- [ ] **RF03 - Filtros Dinâmicos**: Filtragem de treinamentos por status (Pendente/Concluído) e data.
- [ ] **RF04 - Geração de PDF**: Replicar layout FR-RH-01 usando jsPDF.
- [ ] **RF05 - Alertas**: Notificações visuais para avaliações de eficácia próximas do vencimento.
- [ ] **RF06 - Dashboard**: Gráficos minimalistas para taxa de execução e horas.

## Não Funcionais (RNF)
- [ ] **RNF01 - Estética**: Design minimalista e premium.
- [ ] **RNF02 - Performance**: Carregamento instantâneo (Vanilla JS).
- [ ] **RNF03 - Responsividade**: Adaptável a diferentes tamanhos de tela.
- [ ] **RNF04 - Manutenibilidade**: Código modular e bem comentado em Português.

## Regras de Negócio (RN)
- [ ] **RN01 - Numeração de Documento**: Deve seguir a lógica de gap-filling (próximo número disponível).
- [ ] **RN02 - Cálculo de Vencimento**: Prazo de eficácia calculado automaticamente a partir da data realizada.

# PROCESSO DE DESENVOLVIMENTO

## RECURSOS MÍNIMOS
| Categoria | Tecnologia |
| :--- | :--- |
| **Linguagem** | JavaScript (ES6+), HTML5, CSS3 |
| **Frontend** | Vanilla JS, CSS puro |
| **Backend** | Supabase (Cloud-Native) |
| **Deploy** | Vercel (https://controledetreinamentosrh.vercel.app) |
| **GitHub** | https://github.com/automacaostema/treinamentos_rh |

---

## LOG DE OPERAÇÕES
| Data | Operação | Resumo |
| :--- | :--- | :--- |
| 2026-05-12 | Inicialização | Criação do arquivo de processo e mapeamento inicial da base de código. |
| 2026-05-12 | Migração DB | Criação do banco `rh_treinamento` e tabelas no MariaDB local. |
| 2026-05-12 | Refatoração | Criação do `server.js` (Express) e refatoração do `app.js` para usar API local. |
| 2026-05-12 | TDD & Testes | Implementação de 9 testes automatizados (Mocha/Chai) cobrindo API, Utils e Frontend. |
| 2026-05-12 | Refatoração | Extração de `utils.js` e `logic-frontend.js` para aumentar a testabilidade e corrigir bug de timezone. |
| 2026-05-12 | Design & Padronização | Correção da proporção do logo, formatação de 4 dígitos no Nº Doc e implementação de Uppercase global. |
| 2026-05-12 | Feature | Unificação do Dashboard e melhoria na Eficácia dos Treinamentos. |
| 2026-05-13 | Migração Cloud | Transição profissional para Supabase (Schema `rh`) e refatoração para Cloud-Native. |
| 2026-05-13 | Deploy GitHub | Versionamento profissional e auditoria de segurança via DP2. |
| 2026-05-13 | Deploy Vercel | Publicação final, resolução de erros 500 e limpeza de arquivos legados via DP3. |
| 2026-05-13 | Governança | Criação e padronização da esteira de deploy: Skills DP1, DP1.5, DP2, DP3 e DP4. |
| 2026-05-13 | Manuten��o | Corre��o de Double-Click no N� DOC e implementa��o de reatividade no Dashboard (via DP4). |
| 2026-05-13 | Melhoria | Adi��o da coluna N� DOC na aba de Avalia��o de Efic�cia para facilitar localiza��o. |

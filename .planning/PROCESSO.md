# PROCESSO DE DESENVOLVIMENTO

## RECURSOS MÍNIMOS
| Categoria | Tecnologia |
| :--- | :--- |
| **Linguagem** | JavaScript (ES6+), HTML5, CSS3 |
| **Frontend** | Vanilla JS, CSS puro |
| **Backend** | MariaDB (Local), Supabase (Legado) |
| **Bibliotecas** | jsPDF, Chart.js |

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

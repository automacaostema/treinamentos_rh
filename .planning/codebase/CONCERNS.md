# CONCERNS.md

## Pontos de Atenção
- **Segurança**: As chaves do Supabase estão expostas no `config.json` e carregadas no cliente. Para produção, seria ideal um proxy backend ou restrições de RLS rigorosas.
- **Manutenibilidade**: `app.js` está crescendo e pode precisar ser refatorado em submódulos (ex: `ui-manager.js`, `db-service.js`).
- **Escalabilidade**: Geração de PDFs no cliente pode travar o navegador em dispositivos com pouca memória se o volume de dados for muito alto.

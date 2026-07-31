# CodeConnect Web

Frontend React, TypeScript e Vite da CodeConnect. A aplicação usa `AuthProvider`, cliente `fetch` centralizado e proxy `/api` para `http://localhost:3000` no desenvolvimento.

## Rotas

Públicas: `/feed`, `/login`, `/cadastro` e `/posts/:id`. Protegidas: `/publicar` e `/perfil` (placeholder). O feed, detalhes, comentários, curtidas, compartilhamento e publicação usam contratos da API; componentes nunca recebem token diretamente.

## Comandos

```powershell
pnpm.cmd web:dev
pnpm.cmd web:lint
pnpm.cmd web:test
pnpm.cmd web:build
```

`VITE_API_URL` usa a configuração atual do cliente; autenticação provisória é centralizada em `sessionStorage`. Os testes incluem acessibilidade com jest-axe e as páginas mantêm labels, foco visível e mensagens acessíveis.

As imagens em `docs/design/references/codeconnect` são referências de desenvolvimento e nunca devem ser importadas para o bundle ou `public`.

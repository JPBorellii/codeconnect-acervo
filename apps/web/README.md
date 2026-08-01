# CodeConnect Web

Frontend React, TypeScript e Vite da CodeConnect. A aplicação usa `AuthProvider`, cliente `fetch` centralizado e proxy `/api` para `http://localhost:3000` no desenvolvimento.

## Rotas

Públicas: `/feed`, `/login`, `/cadastro`, `/posts/:id` e `/sobre`. Protegidas: `/publicar` e `/perfil`. O perfil lista as publicações do usuário autenticado, e a página Sobre nós adapta seus CTAs ao estado da sessão. O feed, detalhes, comentários, curtidas, compartilhamento e publicação usam contratos da API; componentes nunca recebem token diretamente.

## Comandos

```powershell
pnpm.cmd web:dev
pnpm.cmd web:lint
pnpm.cmd web:test
pnpm.cmd web:build
```

`VITE_API_URL` usa a configuração atual do cliente; a autenticação provisória é centralizada em `sessionStorage`. A suíte frontend é executada com Vitest, Testing Library e jest-axe para acessibilidade. As páginas mantêm labels, foco visível e mensagens acessíveis.

As imagens em `docs/design/references/codeconnect` são referências de desenvolvimento e nunca devem ser importadas para o bundle ou `public`.

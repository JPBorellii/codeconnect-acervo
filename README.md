# CodeConnect

Monorepo da plataforma CodeConnect: frontend React/Vite, API NestJS, PostgreSQL e autenticação JWT.

## Estrutura

- `apps/web`: React, TypeScript e Vite; o proxy `/api` encaminha ao backend local.
- `apps/api`: NestJS, TypeORM, PostgreSQL, JWT, bcrypt e Swagger.
- `docs/design/references`: referências visuais de desenvolvimento; não entram no bundle.

## Pré-requisitos e instalação

Use Node.js, pnpm, Docker Desktop e Git. Instale dependências com `pnpm.cmd install` e mantenha `apps/api/.env` local, ignorado pelo Git. Não versione credenciais.

## Banco e migrations

Inicie o banco de desenvolvimento (porta 5432):

```powershell
docker compose --env-file apps/api/.env up -d postgres
pnpm.cmd --filter api migration:show
pnpm.cmd --filter api migration:run
```

As migrations atuais são CreateUsers, CreatePosts e CreateCommentsAndPostLikes. O projeto usa migrations explícitas: `synchronize` e `migrationsRun` permanecem desativados.

O banco isolado de testes usa `postgres-test`, profile `test` e porta 5433:

```powershell
docker compose --env-file apps/api/.env --profile test up -d postgres-test
```

## Executar

```powershell
pnpm.cmd api:dev
pnpm.cmd web:dev
```

Frontend: `http://127.0.0.1:5173` · API: `http://127.0.0.1:3000` · Swagger: `http://127.0.0.1:3000/docs`.

## Qualidade

```powershell
pnpm.cmd web:lint
pnpm.cmd web:test
pnpm.cmd web:build
pnpm.cmd api:lint
pnpm.cmd api:test
pnpm.cmd api:test:e2e
pnpm.cmd api:build
```

## Rotas e limitações

Públicas: `/feed`, `/login`, `/cadastro`, `/posts/:id`, `GET /posts` e detalhes/comentários públicos. Protegidas: `/publicar`, `/perfil` (placeholder), `/auth/me`, criação de post/comentário e curtidas.

O token JWT fica provisoriamente em `sessionStorage` por uma chave centralizada; senhas não são armazenadas no frontend e o backend decide autorização/autoria. A evolução recomendada é cookie Secure + HttpOnly + SameSite com refresh token.

Ainda não há Perfil, Sobre nós, upload binário, tags persistidas, respostas aninhadas, nem edição/exclusão de posts ou comentários. Imagem de capa é URL HTTP(S).

# CodeConnect API

API NestJS com TypeORM, PostgreSQL, JWT, bcrypt e Swagger em `/docs`.

## Executar e migrations

```powershell
pnpm.cmd api:dev
pnpm.cmd --filter api migration:show
pnpm.cmd --filter api migration:run
```

O banco de desenvolvimento usa a porta 5432; o banco isolado de testes usa `postgres-test`, profile `test` e porta 5433. As migrations são explícitas (CreateUsers, CreatePosts e CreateCommentsAndPostLikes); `synchronize` e `migrationsRun` são falsos.

## Endpoints

Públicos: registro/login, listagem e detalhe de posts e comentários. Protegidos por Bearer JWT: `/auth/me`, criação de posts e comentários e consulta/alteração de curtidas. Posts aceitam título, conteúdo e `thumbnailUrl` HTTP(S) opcional; autoria vem do JWT. Respostas públicas expõem autor somente com id e name.

## Qualidade

```powershell
pnpm.cmd api:lint
pnpm.cmd api:test
pnpm.cmd api:test:e2e
pnpm.cmd api:build
```

Não versione `apps/api/.env`, tokens ou credenciais. Não há upload binário, tags, respostas aninhadas ou edição/exclusão de posts e comentários.

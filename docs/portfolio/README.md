# Evidências do CodeConnect

Esta pasta reúne evidências selecionadas do funcionamento do projeto. As imagens foram recortadas, organizadas e comprimidas para apresentação pública no GitHub e em portfólio.

## Produto

| Evidência | O que demonstra |
|---|---|
| `00-codeconnect-cover.webp` | Visão geral do produto e identidade visual. |
| `01-login-desktop.webp` | Interface de autenticação em desktop. |
| `02-feed-desktop.webp` | Feed público, busca e cards de publicações. |
| `03-post-details-desktop.webp` | Página pública de detalhes, compartilhamento e área de comentários. |
| `04-publish-desktop.webp` | Fluxo autenticado de criação e prévia de publicação. |
| `05-profile-desktop.webp` | Perfil autenticado e listagem das próprias publicações. |
| `06-about-desktop.webp` | Página pública Sobre nós com conteúdo verdadeiro sobre o produto. |
| `07-responsive-showcase.webp` | Adaptação da interface para desktop, tablet e mobile. |

## Backend, banco e qualidade

| Evidência | O que demonstra |
|---|---|
| `08-api-swagger.webp` | API NestJS documentada por Swagger/OpenAPI. |
| `09-docker-postgresql.webp` | PostgreSQL isolado para desenvolvimento e testes. |
| `10-quality-summary.webp` | Resultado final de testes, lint, builds e auditoria de segredos. |
| `11-ai-development-process.webp` | Fluxo supervisionado de engenharia assistida por IA. |

## Critérios de seleção

Foram priorizadas capturas que:

- mostram funcionalidades reais e concluídas;
- não exibem tokens, senhas, `passwordHash` ou arquivos `.env`;
- não dependem de promessas, métricas ou informações institucionais inventadas;
- representam os fluxos mais relevantes para recrutadores;
- possuem leitura clara mesmo fora do ambiente local.

## Imagens descartadas

Não foram incluídas:

- capturas da pasta de referências do Figma, pois documentam materiais de desenvolvimento e não o produto funcionando;
- logs brutos com erro de chave duplicada, pois podem ser interpretados como falha sem o contexto técnico;
- telas com navegador, notificações pessoais, barra de tarefas ou caminhos locais quando havia alternativa limpa;
- evidências antigas com contagens de testes desatualizadas;
- estados de erro usados somente durante QA;
- imagens repetidas ou quase idênticas.

## Segurança e privacidade

Antes de publicar novas imagens, confirme que não aparecem:

- token JWT ou header `Authorization`;
- senha, chave de API ou conteúdo de `.env`;
- `passwordHash`;
- dados pessoais reais;
- notificações pessoais;
- caminhos locais desnecessários;
- logs com payloads sensíveis.

# Repository Guidelines

## Project Structure & Module Organization

This repository is a pnpm workspace containing two TypeScript applications:

- `apps/web/`: React 19 frontend built with Vite. Application code lives in `src/`, static files in `public/`, and imported images in `src/assets/`.
- `apps/api/`: NestJS backend. Keep controllers, services, and modules in `src/`; unit tests sit beside source files as `*.spec.ts`. End-to-end tests and their Jest configuration live in `test/`.

Workspace configuration is defined in `pnpm-workspace.yaml`. Generated directories such as `dist/`, `coverage/`, and `node_modules/` must not be committed.

## Build, Test, and Development Commands

Run commands from the repository root whenever a corresponding root script exists. In Codex running natively on Windows, invoke `npm.cmd`, `npx.cmd`, and `pnpm.cmd` to avoid PowerShell `.ps1` wrapper restrictions:

- `pnpm.cmd install`: install all workspace dependencies.
- `pnpm.cmd web:dev`: start the Vite development server with hot reload.
- `pnpm.cmd web:build`: type-check and build the frontend.
- `pnpm.cmd web:lint`: run Oxlint for the frontend.
- `pnpm.cmd web:preview`: preview the production frontend build.
- `pnpm.cmd api:dev`: start NestJS in watch mode.
- `pnpm.cmd api:start`: start NestJS without watch mode.
- `pnpm.cmd api:build`: build the API.
- `pnpm.cmd api:lint`: run the API ESLint/Prettier checks. This script applies fixes.
- `pnpm.cmd api:test`: run API unit tests.
- `pnpm.cmd api:test:e2e`: run API integration tests.
- `pnpm.cmd --filter api test:cov`: run the API package's coverage script and generate output in `apps/api/coverage/`.

## Coding Style & Naming Conventions

Use TypeScript throughout and preserve each application's established formatting: frontend files use two-space indentation and no semicolons, while API files follow Prettier defaults with semicolons and single quotes. Name React components in PascalCase (`UserCard.tsx`), functions and variables in camelCase, and NestJS files by role (`users.controller.ts`, `users.service.ts`, `users.module.ts`). Run the relevant lint command before submitting changes.

## Frontend Architecture: Atomic Design

Place every reusable frontend component under `apps/web/src/components/`, grouped into these directories:

```text
apps/web/src/components/
├── atoms/
├── molecules/
├── organisms/
├── templates/
└── pages/
```

Dependencies must flow from higher-level components to lower-level components; a level must never import a component from a higher level.

- `atoms` are the smallest reusable UI elements and must not import from `molecules`, `organisms`, `templates`, or `pages`.
- `molecules` may compose `atoms`, but must not import from `organisms`, `templates`, or `pages`.
- `organisms` may compose `atoms` and `molecules`, but must not import from `templates` or `pages`.
- `templates` arrange page layouts using lower-level components and placeholders. They must not connect routes or depend on real application data.
- `pages` connect routes and real data to templates and lower-level components.

Name React components and their files in PascalCase. Keep components focused and split components that become excessively large or combine unrelated responsibilities.

## Frontend Styling

Tailwind CSS will be the standard styling approach once it is installed. Do not install Tailwind as part of unrelated work or until the user explicitly authorizes the dependency change. When Tailwind is available, prefer utility classes over creating new global CSS files. Regardless of styling approach, preserve semantic HTML, accessible behavior, and clearly visible keyboard focus states.

## Design Tokens

Global design tokens belong in the `@theme` block of `apps/web/src/index.css`. Name tokens for semantic roles, reuse existing tokens before creating new ones, and do not create different aliases for the same role. Preserve exact Figma measurements; unique structural values may remain arbitrary in the component. `--color-surface` corresponds to `#171d1f`, never `#271d1f`. Changes to tokens require visual validation of both Login and Cadastro.

## Testing Guidelines

Jest and `ts-jest` cover the API. Name colocated unit tests `*.spec.ts` and end-to-end tests `*.e2e-spec.ts`. Add tests for new routes, service behavior, and regressions. The frontend suite uses Vitest, React Testing Library, and jest-axe; run `pnpm.cmd web:test` alongside the relevant lint and build commands and manual verification for affected UI behavior.

Every new frontend component must have a co-located test:

```text
ComponentName.tsx
ComponentName.test.tsx
```

Frontend component tests should cover essential usage, rendering, the primary interaction, and accessibility when applicable. Aim for meaningful risk-based coverage; 100% coverage is not required. Public routes include `/feed`, `/login`, `/cadastro`, `/posts/:id`, and `/sobre`; `/publicar` and `/perfil` require authentication.

## Backend REST Conventions

Preserve NestJS's module, controller, service, and dependency-injection patterns. Design HTTP APIs according to these rules:

- Represent resources with nouns in URLs, never actions.
- Use plural collection names such as `/users` and `/posts`.
- Use `GET`, `POST`, `PUT`, `PATCH`, and `DELETE` according to their HTTP semantics.
- Return semantically correct HTTP status codes.
- Use nested routes only for a genuine ownership relationship, and avoid nesting deeper than two levels.
- Support pagination through query parameters on collection endpoints when applicable.
- Keep successful JSON response shapes consistent across related endpoints.
- Return errors with `statusCode` and `message`, adding `errors` when structured validation or multiple error details are needed.

## Git, Commits, and Pull Requests

All commits must follow Conventional Commits:

```text
<type>(<scope>): <description>
```

Allowed types are `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `perf`, `ci`, `build`, `revert`, and `chore`. Prefer the scopes `web`, `api`, and `root`.

Examples:

- `feat(web): add post card component`
- `fix(api): validate missing post title`
- `docs(root): document local setup`
- `test(web): cover button interaction`

Use a short, imperative description with no trailing period. Do not create commits unless the user explicitly requests one.

Pull requests should explain the change and verification performed, link relevant issues, and include screenshots for visible UI changes. Keep changes focused, document configuration updates, and ensure applicable builds, lint checks, and tests pass.

## Agent-Specific Instructions

- In Codex running natively on Windows, use `npm.cmd`, `npx.cmd`, and `pnpm.cmd` instead of their PowerShell `.ps1` wrappers.
- Run commands from the repository root whenever the root `package.json` provides the corresponding script.
- Never edit `node_modules`, `dist`, `coverage`, or `.pnpm-store`.
- Do not change `pnpm-lock.yaml` unless dependencies have actually changed.
- Do not install packages without explicit user authorization.
- For backend-only work, do not modify `apps/web`; for frontend-only work, do not modify `apps/api`.
- Before completing code changes, run only the relevant validation commands, such as lint, tests, and build.
- If a command fails, explain the error before making additional changes that the user did not request.
- Do not run `git add`, `git commit`, `git push`, or destructive operations unless the user explicitly requests them.

## Security & Configuration

Never commit secrets or local `.env` files. Add sanitized examples as `.env.example` when introducing configuration, and validate environment inputs at application startup.

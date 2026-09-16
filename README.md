# Task Tracker

pnpm monorepo: Next.js web app, NestJS API, MongoDB. Shared Zod contracts live in `packages/shared`.

## Prerequisites

- Node.js 20+
- pnpm 10 (`corepack enable` or `npm install -g pnpm`)
- Docker (for Compose)

## Quick start (Docker)

```bash
cp .env.example .env
docker compose up --build
```

- Web: http://localhost:3000
- API health: http://localhost:3001/api/health

## Local development

```bash
cp .env.example .env
pnpm install
pnpm dev
```

`pnpm dev` starts Mongo via Compose, builds `packages/shared`, then runs web (port 3000) and API (port 3001) in watch mode.

## Workspace scripts

Root `lint`, `test`, `typecheck`, and `build` compile `@task-tracker/shared` first (`packages/shared/dist` is gitignored).

- `pnpm dev` — Mongo, shared build, web + API in watch mode
- `pnpm build` — production builds
- `pnpm test` — API Jest + web Vitest
- `pnpm typecheck` — TypeScript across packages
- `pnpm lint` — ESLint for apps (includes Prettier)
- `pnpm format` — Prettier write for the repo

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs lint, typecheck, test, then build on pushes and pull requests to `main`.

Identity is a **dev stub**: requests use `x-user-id` or `DEV_USER_ID`. Do not treat this as production authentication.

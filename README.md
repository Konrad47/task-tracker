# Task Tracker

pnpm monorepo: Next.js web app, NestJS API, MongoDB. Shared Zod contracts live in `packages/shared`.

## Prerequisites

- Node.js 20+
- pnpm 10 (`npm install -g pnpm`)
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
docker compose up mongo
cp .env.example .env
pnpm install
pnpm dev
```

Web runs on port 3000, API on 3001.

## Workspace scripts

- `pnpm dev` — shared build, then web + API in watch mode
- `pnpm build` — production builds
- `pnpm typecheck` — TypeScript across packages
- `pnpm lint` — ESLint for apps

Identity is a **dev stub**: requests use `x-user-id` or `DEV_USER_ID`. Do not treat this as production authentication.

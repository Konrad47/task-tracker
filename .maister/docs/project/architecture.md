# System Architecture

## Overview

pnpm monorepo: Next.js client, NestJS REST API, MongoDB. Shared Zod schemas in `packages/shared`.

## Architecture Pattern

**Pattern**: Modular monorepo with REST JSON API.

## System Structure

### Web (`apps/web`)

- **Location**: `apps/web/`
- **Purpose**: Task CRUD and status filters.
- **Key files**: `src/app/page.tsx`, `src/features/tasks/`, `src/lib/api.ts`, `src/components/ui/`.

### API (`apps/api`)

- **Location**: `apps/api/`
- **Purpose**: REST API, MongoDB, stub identity.
- **Key files**: `src/health/`, `src/auth/dev-auth.guard.ts`, `src/tasks/`.

### Shared contracts (`packages/shared`)

- **Location**: `packages/shared/src/index.ts`
- **Purpose**: Zod schemas, types, `API_ROUTES`.

### MongoDB

Compose service `mongo`. Not accessed from Next.js.

## Data Flow

Browser TanStack Query → Nest `/api/*` with `x-user-id` → `DevAuthGuard` → `TasksService` (Mongoose, scoped to `userId`) → JSON matching shared `taskSchema`.

## External Integrations

MongoDB only.

## Database Schema

Task: `title`, `description`, `status` (`todo` | `in_progress` | `done`), `userId`, timestamps.

## Configuration

`.env.example`: `MONGODB_URI`, `PORT`, `DEV_USER_ID`, `CORS_ORIGIN`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_DEV_USER_ID`, `LOG_LEVEL` (optional `NODE_ENV` for JSON logs).

## Deployment Architecture

`docker-compose.yml`: mongo, api (3001), web (3000). Browser calls `NEXT_PUBLIC_API_URL` (host-mapped API).

REST:

- `GET /api/health`
- `GET/POST /api/tasks`
- `GET/PATCH/DELETE /api/tasks/:id`

---

*Based on implemented source, 2026-09-12.*

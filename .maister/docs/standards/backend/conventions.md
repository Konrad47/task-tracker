# Backend conventions

## API

- **Established**: NestJS modules `health`, `auth`, `tasks`.
- **Established**: global prefix `api` in `main.ts`.
- **Established**: Health is public; task routes use `DevAuthGuard`.
- **Established**: task queries and writes are scoped to the stub `userId`.

## Persistence

- **Established**: Mongoose `Task` schema with timestamps; index on `userId` and `status`.
- **Established**: MongoDB URI from `MONGODB_URI`.
- **Established**: pnpm hoists `@nestjs/*` (root `.npmrc` and `pnpm.overrides`) so Nest and `@nestjs/mongoose` share one `@nestjs/core`. Duplicate copies break `ModuleRef` injection.

## Validation

- **Established**: Zod schemas from `@task-tracker/shared` via `ZodValidationPipe`. Invalid list `status` query is 400.

## Testing

- **Established**: Jest unit tests colocated as `*.spec.ts` under `apps/api/src`. Run with `pnpm --filter @task-tracker/api test` or root `pnpm test`. API `tsconfig.json` sets `rootDir` to `src` and `types` to `node` and `jest` so the editor resolves Jest globals; it does not use `baseUrl`.
- **Required**: assert observable behavior (DTOs, HTTP exceptions, user scoping, validation outcomes, log events). Do not spy on private methods or depend on live Mongo, real clocks, or shared fixtures across tests.
- **Out of scope**: e2e/supertest against a running API; web tests.

## Observability

- **Established**: `GET /api/health` pings MongoDB. Compose healthcheck uses this endpoint.
- **Established**: API logs with `nestjs-pino` 4.x (Pino). Stay on 4.x with Nest 11. JSON to stdout when `NODE_ENV=production`; `pino-pretty` otherwise. `LOG_LEVEL` defaults to `info`. HTTP auto-logging skips `/api/health`. Redact `authorization` and `cookie` request headers. Task create/update/delete and not-found are logged in `TasksService`; list is not logged at info.

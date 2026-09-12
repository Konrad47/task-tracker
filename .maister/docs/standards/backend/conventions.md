# Backend conventions

## API

- **Established**: NestJS modules `health`, `auth`, `tasks`.
- **Established**: global prefix `api` in `main.ts`.
- **Established**: Health is public; task routes use `DevAuthGuard`.
- **Established**: task queries and writes are scoped to the stub `userId`.

## Persistence

- **Established**: Mongoose `Task` schema with timestamps; index on `userId` and `status`.
- **Established**: MongoDB URI from `MONGODB_URI`.

## Validation

- **Established**: Zod schemas from `@task-tracker/shared` via `ZodValidationPipe`. Invalid list `status` query is 400.

## Observability

- **Established**: `GET /api/health` pings MongoDB. Compose healthcheck uses this endpoint.

# Global conventions

## Naming

- **Established**: pnpm workspace names `apps/web`, `apps/api`, `packages/shared`; package names `@task-tracker/web`, `@task-tracker/api`, `@task-tracker/shared`.
- **Established**: Nest files kebab-case (`tasks.service.ts`); Next feature folders under `src/features/`.

## Formatting and types

- **Required**: Prettier (API ESLint prettier plugin); ESLint in both apps; TypeScript strict in web and API (API `strictPropertyInitialization` is false).
- **Recommended**: do not format files you are not changing.

## Dependencies

- **Established**: shared Zod and types in `@task-tracker/shared` (`workspace:*`).
- **Established**: no Vite; Next.js compiles the web app; Nest CLI builds the API.

## Errors and API

- **Established**: JSON REST under `/api`; Zod failures HTTP 400; missing tasks HTTP 404.

## Documentation

- **Recommended**: keep `.maister/docs` in sync when architecture or stack changes.
- **Established**: `.env.example` documents variables; `.env` is gitignored.

## Security

- **Established**: v1 identity is a stub (`DEV_USER_ID` / `x-user-id`). Do not treat it as production auth. CORS allowlist from `CORS_ORIGIN`.

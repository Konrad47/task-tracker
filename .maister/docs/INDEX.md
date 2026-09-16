# Maister knowledge base

Last refreshed: 2026-09-16 (CI shared package build).

## Project

- [Vision](project/vision.md) — practice fullstack tracker; Docker slice; stub auth.
- [Technology stack](project/tech-stack.md) — pinned versions from manifests (Next 16, Nest 11, Mongo 7, pnpm 10).
- [Architecture](project/architecture.md) — monorepo boundaries, REST flow, Compose.
- [Roadmap](project/roadmap.md) — MVP provision complete; real auth and e2e deferred; GitHub Actions CI, API Jest, and web Vitest in place.

## Standards

- [Global](standards/global/conventions.md)
- [Frontend](standards/frontend/conventions.md)
- [Backend](standards/backend/conventions.md)

Testing: API Jest and web Vitest. Root `pnpm lint` / `pnpm test` / `pnpm typecheck` / `pnpm build` compile `@task-tracker/shared` first (`dist` is gitignored). GitHub Actions: `.github/workflows/ci.yml`. E2e remains deferred.

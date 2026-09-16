# Technology Stack

## Overview

Task Tracker is a pnpm monorepo. Versions below are from workspace manifests after scaffold.

## Languages

### TypeScript (^5.9 in root / shared; apps use workspace TypeScript 5.9)

- **Usage**: web, API, and shared contracts.
- **Rationale**: user-provided.
- **Key Features Used**: strict typing; Zod-inferred DTO types.

## Frameworks

### Frontend

- Next.js 16.3.5 (App Router; no Vite).
- React 19.2.8.
- Tailwind CSS 4 (via `@tailwindcss/postcss`).
- shadcn-style primitives in `apps/web/src/components/ui/`.
- TanStack Query ^5.102.
- React Hook Form ^7.88 with `@hookform/resolvers` and Zod.

### Backend

- NestJS ^11 (`@nestjs/cli` for build).
- `@nestjs/mongoose` ^12 and mongoose ^9.
- Zod validation via `ZodValidationPipe` and `@task-tracker/shared`.
- Logging: `nestjs-pino` ~4.5, `pino` ^10, `pino-http` ^11; `pino-pretty` as a devDependency. Root `.npmrc` hoists `@nestjs/*` so pnpm does not install duplicate `@nestjs/core`.

### Testing

- Jest 30 + ts-jest + `@nestjs/testing` in `apps/api` for colocated unit specs (`*.spec.ts`).
- Jest `transformIgnorePatterns` allows compiling ESM `@nestjs/*` and `nestjs-pino` under pnpm.
- Vitest 5 + Testing Library + jsdom in `apps/web` for colocated unit specs. Vitest is the test runner only; Next.js still compiles the app (no Vite app bundler).
- Root script `pnpm test` runs both apps. API e2e config exists but is unused. Playwright and CI are still deferred.

## Database

### MongoDB 7 (Compose image `mongo:7`)

- **Type**: document store.
- **Client**: Mongoose.
- **Rationale**: user-provided.

## Build Tools & Package Management

- pnpm 10.34.5 workspaces (`apps/web`, `apps/api`, `packages/shared`).
- `next build` / `next dev` for web.
- `nest build` / `nest start --watch` for API.

## Infrastructure

### Containerization

Docker Compose services `web`, `api`, `mongo` with healthchecks. Multi-stage Dockerfiles under `apps/web` and `apps/api`.

### CI/CD

Not in this pass.

### Hosting

Local Docker / local Node.

## Development Tools

- ESLint 9 and Prettier 3 (root `.prettierrc.json`, LF). API: type-checked `typescript-eslint`. Web: Next core-web-vitals plus Testing Library / jest-dom / Vitest on specs.
- TypeScript strict mode (`apps/web` tsconfig `strict`; `apps/api` `strict` with `strictPropertyInitialization` false for Nest decorators). API compiler options include `rootDir: src` and `types: ["node", "jest"]`.

## Key Dependencies

- `@task-tracker/shared` — Zod 3.25 schemas.
- Web: Next 16, TanStack Query, RHF, Zod.
- API: Nest 11, Mongoose 9, Zod, nestjs-pino.

## Version Management

Root `pnpm-lock.yaml`. `packageManager` field: `pnpm@10.34.5`.

---

*Last Updated*: 2026-09-16
*Auto-detected*: versions from `package.json` files after scaffold
*User-provided*: stack choices

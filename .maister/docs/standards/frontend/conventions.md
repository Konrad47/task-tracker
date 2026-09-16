# Frontend conventions

## Framework

- **Established**: Next.js App Router with `src/app` for routes only.
- **Established**: feature modules under `src/features/tasks/`.
- **Established**: UI primitives under `src/components/ui/` (shadcn-style: Button, Input, Select, Card, Badge, Label).

## State and data

- **Established**: TanStack Query for server state (`src/components/providers.tsx` is a client component).
- **Established**: Nest API is the only persistence boundary (`src/lib/api.ts`).
- **Established**: forms use React Hook Form + Zod schemas from `@task-tracker/shared`.

## Styling

- **Established**: Tailwind CSS v4 plus local UI primitives.

## Testing

- **Established**: Vitest unit tests colocated as `*.spec.ts` / `*.spec.tsx` under `apps/web/src`. Run with `pnpm --filter @task-tracker/web test`.
- **Required**: assert observable behavior (fetch URLs/methods, form and filter outcomes, loading/empty/error copy). Query by accessible name. Mock `fetch` / `@/lib/api`. Fresh QueryClient per test (`retry: false`). Do not assert CSS classes or shadcn internals.
- **Out of scope**: Playwright/e2e; page/layout/providers wiring; UI primitives.

## Accessibility

- **Recommended**: labeled form fields, filter buttons, loading/empty/error copy.

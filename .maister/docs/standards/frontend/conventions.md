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

## Accessibility

- **Recommended**: labeled form fields, filter buttons, loading/empty/error copy.

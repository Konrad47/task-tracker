# Development Roadmap

This roadmap outlines planned work for Task Tracker. It does not invent calendar dates.

## Phase 1: MVP (this provision)

- [x] **Monorepo scaffold** — pnpm workspaces, shared Zod package, ESLint, Prettier, strict TypeScript
- [x] **Docker Compose** — web, api, mongo, healthchecks, `.env.example`
- [x] **API** — Health, DevAuthGuard, Tasks CRUD with Mongoose
- [x] **Web** — Next.js tracker UI with filters, TanStack Query, React Hook Form
- [x] **Verification** — compose up, health, CRUD in the UI, typecheck and lint
- [x] **API unit tests** — colocated Jest specs; no live Mongo
- [x] **Web unit tests** — colocated Vitest specs; mocked fetch
- [x] **GitHub Actions CI** — lint, typecheck, test, build; shared package built first

## Phase 2: Deferred (explicit non-goals of v1)

- Real authentication (replace the stub guard)
- API/web e2e, OpenAPI
- Extra task fields (tags, due dates, comments)
- Multi-user permissions

## Future Enhancements

- Replace stub identity with sessions or JWT without changing the task module boundary
- Playwright when e2e quality gates are requested
- Expand beyond unit tests (e2e)

---

*Last Updated*: 2026-09-16
*Source*: user-provided planning decisions

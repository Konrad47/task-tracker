# Project Vision

## Pitch

Task Tracker is a small fullstack web application that helps a single developer (or a local team in later phases) capture and move work items by status, using a modern Next.js and NestJS stack.

## Problem Statement

The repository is a practice project whose immediate goal is a provisioned, containerized, end-to-end working tracker rather than a feature-rich product. Without a thin but complete vertical slice (UI, API, MongoDB, Docker), later architecture and tooling work has nothing to attach to.

## Target Users

- The project owner, using the app locally via Docker Compose or `pnpm dev`.
- Cursor agents implementing later features against documented standards.

## Key Features

- Create, list, update, and delete tasks.
- Task status: `todo`, `in_progress`, `done`, with list filters.
- Dev-only stub identity (`DEV_USER_ID` / `x-user-id`) so tasks are attributed without real authentication.
- Shared Zod contracts between web and API.
- Run the stack with Docker Compose.

## Success Criteria

- `docker compose up --build` starts MongoDB, the NestJS API, and the Next.js web app.
- Health endpoint reports API and MongoDB as reachable.
- A user can create a task, filter by status, update it, and delete it in the UI.
- TypeScript strict checking and ESLint succeed for both apps.

## Differentiators

Practice-oriented: modern tools and feature-based layout over product uniqueness. Real auth, CI, web/e2e tests, and extra task fields are deferred; the API has Jest unit tests.

---

*Last Updated*: 2026-09-16
*Source*: user-provided (planning conversation); repository was empty at initialization

# EcoSphere — Architecture & Coding Standards

## Overview

EcoSphere follows a layered architecture within the Next.js App Router, separating
concerns between presentation (pages/components), business logic (lib/), and
data persistence (Upstash Redis).

## Folder Structure

```
app/                    Route handlers and pages (Next.js App Router)
  api/                  Server-side API routes (auth, user, activities, chat, predictions)
  dashboard/            Main dashboard page
  tracker/              Habit tracking page
  ...
components/             Reusable React components
  ui/                   Low-level UI primitives (Button, Input, Select, Card)
  charts/               Data visualization components
hooks/                  Custom React hooks (useEcoApp encapsulates client state)
lib/                    Core business logic, framework-agnostic
  calculations.ts       Carbon footprint calculation engine
  rate-limit.ts         Sliding-window rate limiter
  auth/                 Authentication service (JWT, password hashing)
  db/                   Database access layer (Upstash Redis)
__tests__/              Jest test suites (145 tests, 100% coverage on core logic)
docs/                   Architecture and methodology documentation
```

## Design Principles

**Separation of concerns.** Calculation logic in `lib/calculations.ts` has zero
dependency on React, Next.js, or the database — it is pure, deterministic, and
fully unit-testable in isolation, which is why it achieves 100% branch coverage.

**Single source of truth.** Emission factors, badge definitions, and habit data
all live in one exported constant (`EMISSION_FACTORS`, `BADGES_DATABASE`,
`HABITS_DATABASE`) rather than being duplicated across components.

**Defense in depth on the API layer.** Every API route validates the session via
`getSessionUser`, validates and sanitizes input, and returns typed JSON responses
with appropriate HTTP status codes. The chat endpoint additionally applies a
per-user sliding-window rate limit and strips HTML/script content before
forwarding text to the AI service.

**Type safety.** All API payloads and database records are described by
TypeScript interfaces (`User`, `Activity`, `Goal`, `EnrolledChallenge`,
`CalculatorInputs`, `FootprintResult`). Loosely-typed boundaries (e.g. modal
callback props) were tightened to concrete shapes rather than `any`.

## Data Flow

1. Client component calls a `fetch()` against an `/app/api/*` route, sending a
   Bearer token in the `Authorization` header.
2. The route verifies the session via `getSessionUser`, which validates the
   HMAC-SHA256 signed JWT and checks expiry.
3. Business logic (`calculateFootprint`, badge/streak logic) runs against the
   request payload.
4. State is persisted via `readDb()` / `writeDb()`, backed by Upstash Redis.
5. A typed JSON response is returned to the client.

## Testing Strategy

- `calculations.test.ts` + `calculations.branch.test.ts`: exhaustive coverage of
  the carbon footprint engine, including every conditional branch and fallback.
- `auth.test.ts`: password hashing, JWT signing/verification, tamper and
  expiry detection.
- `db.test.ts`: schema shape validation, streak/XP/badge business rules.
- `api.test.ts`: input validation, footprint classification, prediction model.
- `rate-limit.test.ts`: sliding-window rate limiting and input sanitization.

## Performance

- Heavy client components (`CalculatorModal`, `EmissionsChart`) are loaded via
  `next/dynamic` with `ssr: false`, removing them from the initial dashboard
  bundle (124 kB → 7.78 kB).
- Derived dashboard values (footprint deltas, tree equivalents, savings totals)
  are wrapped in `useMemo` to avoid recomputation on unrelated re-renders.

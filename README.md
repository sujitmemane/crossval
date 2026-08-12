# CrossVal Backend / Full-Stack Assignment

A multi-tenant order and payment management platform built for the [CrossVal](https://crossval.com) Backend / Full-Stack Developer assignment. It models a slice of what CrossVal does in production: **financial operations where correctness, auditability, and end-to-end ownership matter**.

Admins manage a catalog, create orders for customers, record payments and refunds, and export data for reporting. Every money-moving action is validated, idempotent where it needs to be, and written to an immutable audit trail.

---

## What I Built

| Area | Implementation |
| --- | --- |
| **Backend** | Node.js, Express 5, TypeScript, MongoDB (Mongoose), Zod validation |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, TanStack Query |
| **Auth** | JWT access + refresh tokens (httpOnly cookies), bcrypt, forgot/reset password |
| **Multi-tenancy** | Organization-scoped data; all queries filtered by `organizationId` from the token |
| **Orders** | Line items with snapshotted rates, derived status, partial updates |
| **Payments** | Payments & refunds with idempotency keys, atomic balance updates, race-safe replay |
| **Auditability** | Append-only audit log for order and payment lifecycle events |
| **Reporting** | Dashboard aggregates + streamed CSV export with guardrails |
| **API testing** | Postman collection with auto-captured tokens and IDs |

---

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB running locally (or a remote URI)

### 1. API

```bash
cd apps/api
cp .env.example .env   # fill in secrets and Mongo URI
npm install
npm run dev            # http://localhost:4000
```

### 2. Web

```bash
cd apps/web
cp .env.example .env   # defaults to http://localhost:4000/api
npm install
npm run dev            # http://localhost:5173
```

### 3. Try the flow

1. **Sign up** as an admin — this creates your organization.
2. Add **items** to the catalog and **customers** (users with role `CUSTOMER`).
3. Create an **order**, record a **payment**, issue a **refund** if needed.
4. Open the order drawer to see **transactions** and the **audit trail**.
5. Export orders as **CSV** from the Orders page.

Import `apps/api/postman/Settle-API.postman_collection.json` to exercise the API without the UI. Tokens and entity IDs are captured automatically between requests.

---

## Architecture

```
apps/
├── api/                          # Express + MongoDB backend
│   ├── src/
│   │   ├── config/               # Env loading, DB connection
│   │   ├── domain/               # Pure business logic (unit-testable)
│   │   │   ├── order/            # Status derivation, totals, edit rules
│   │   │   └── payment/          # Payment/refund validation
│   │   ├── lib/                  # CSV, dates, email, errors, responses
│   │   ├── middleware/           # Auth, validation, error handling
│   │   └── modules/              # Feature modules (routes → controller → service → repository)
│   └── postman/
└── web/                          # React SPA
    └── src/
        ├── api/                  # Typed API clients
        ├── pages/                # Feature screens
        └── components/ui/        # Shared UI primitives
```

Each API module follows the same shape:

| Layer | Responsibility |
| --- | --- |
| `*.routes.ts` | HTTP routing + middleware wiring |
| `*.controller.ts` | Request parsing, response shaping |
| `*.service.ts` | Business orchestration, transactions, audit logging |
| `*.repository.ts` | MongoDB queries (always scoped by organization) |
| `*.model.ts` | Mongoose schema |
| `*.schema.ts` | Zod request validation |

`src/domain/` holds framework-free rules — status derivation, total calculation, payment bounds — so they can be tested without a database or HTTP layer.

---

## Core Domain Rules

### Order status (derived, not stored)

Status is computed at read time from `totalAmount`, `amountPaid`, and `dueDate`:

```
PAID            → amountPaid >= totalAmount
OVERDUE         → balance remains AND now > dueDate
PARTIALLY_PAID  → amountPaid > 0
PENDING         → otherwise
```

**Priority:** `PAID` wins over `OVERDUE`. A fully paid order is never shown as overdue, even if the due date has passed.

### Order line items snapshot rates

When an order is created or its items are updated, the item's current `rate` is copied onto the order line. Later catalog price changes do not retroactively alter existing orders.

### Order edit constraints

An order can be edited only when:

- It is **not fully paid** (`amountPaid < totalAmount`), and
- Any new line-item total is **≥ amount already paid** (you cannot reduce the total below collected funds).

Fully paid orders lock line items and customer reassignment on the frontend; the API enforces the same rules.

### Payments & refunds

- **Payment:** `amountPaid + payment ≤ totalAmount`
- **Refund:** `refund ≤ amountPaid`
- **Idempotency:** Every transaction requires an `idempotencyKey`. A unique compound index on `(organizationId, idempotencyKey)` prevents duplicates. Retries return the original result instead of double-applying.
- **Atomicity:** Payment/refund updates use a MongoDB `$expr` guard so concurrent requests cannot overpay or over-refund even under race conditions.

---

## API Overview

Base URL: `http://localhost:4000/api`

| Method | Path | Description |
| --- | --- | --- |
| **Auth** | | |
| `POST` | `/auth/sign-up` | Create account (+ org for admins) |
| `POST` | `/auth/sign-in` | Sign in |
| `POST` | `/auth/refresh-token` | Refresh access token |
| `POST` | `/auth/forgot-password` | Send reset link |
| `POST` | `/auth/reset-password` | Reset password |
| **Items** | | |
| `GET/POST` | `/items` | List / create catalog items |
| `PATCH` | `/items/:id` | Update item |
| **Users** | | |
| `GET/POST` | `/users` | List / invite users (admin) |
| `GET/PATCH` | `/users/:id` | Get / update user |
| `GET/PATCH` | `/users/me` | Profile |
| **Orders** | | |
| `GET/POST` | `/orders` | List (paginated) / create |
| `GET` | `/orders/stats` | Dashboard aggregates |
| `GET` | `/orders/export` | Stream CSV by `createdAt` date range |
| `PATCH` | `/orders/:id` | Update due date, items, or customer |
| **Transactions** | | |
| `POST` | `/transactions` | Record payment or refund |
| `GET` | `/transactions?orderId=` | List transactions for an order |
| **Audit logs** | | |
| `GET` | `/audit-logs?orderId=` | Order-scoped audit trail |
| **Organization** | | |
| `GET/PATCH` | `/organizations/me` | Org profile & settings |

All protected routes require a valid JWT. Organization-scoped routes additionally require `organizationId` on the token.

---

## Assumptions

These are deliberate simplifications for the assignment scope:

1. **Single currency per organization** — amounts are plain numbers; no FX or multi-currency ledger.
2. **Status is derived** — not persisted on the order document, avoiding stale status under concurrent payments.
3. **Item inventory is not decremented** — the `quantity` field on items is catalog metadata, not live stock tracking.
4. **Customers are invited by admins** — self-signup creates a standalone account or a new org (admin flow), not membership in an existing org.
5. **Export filters by `createdAt`** — not `dueDate`. Date ranges are inclusive and interpreted in UTC in the exported file.
6. **No partial line-item fulfillment** — an order is a single receivable; payments apply to the order total, not individual lines.
7. **Soft deletes are out of scope** — records are permanent; audit logs are append-only.
8. **Local deployment** — no AWS/CI wiring in this repo; architecture is designed to map cleanly to containerized AWS deployment.

---

## Edge Cases Handled

### Financial correctness

| Scenario | Handling |
| --- | --- |
| Overpayment | Rejected in service layer **and** atomically blocked in MongoDB via `$expr` on `applyOrderPayment` |
| Over-refund | Same dual-layer guard for refunds |
| Concurrent duplicate payment | Unique idempotency index + duplicate-key catch returns the original transaction |
| Idempotent retry | Same `idempotencyKey` → `200` with existing transaction and current order status |
| Edit order below paid amount | Blocked: new total must be ≥ `amountPaid` |
| Edit fully paid order | Blocked at API; UI locks item/customer fields |
| Unavailable catalog item on order | Rejected at create/update with a clear error |
| Missing or cross-org item IDs | Rejected; duplicate item IDs in payload deduped via `Set` size check |

### Data integrity

| Scenario | Handling |
| --- | --- |
| Order create + audit log | Wrapped in a MongoDB transaction session |
| Payment + audit log + status change log | Single transaction; rolls back on any failure |
| Rate changes after order creation | Snapshotted `rate` on order lines preserves historical totals |

### Export

| Scenario | Handling |
| --- | --- |
| Empty date range | `404` — no orders found |
| Range > 50,000 rows | `413` — asks user to narrow the range |
| Large exports | Streamed via cursor (`batchSize: 500`), not loaded into memory |
| Excel compatibility | UTF-8 BOM + proper CSV escaping for commas, quotes, newlines |
| Timezone clarity | All exported dates formatted as UTC with a header comment |

### Auth & security

| Scenario | Handling |
| --- | --- |
| Expired access token | Frontend silently refreshes via httpOnly refresh cookie |
| Cross-org access | Every repository query includes `organizationId` from the JWT |
| Role-gated routes | Admin-only user management enforced in middleware |
| Password reset | Time-limited token (10 min), cleared after use |
| Validation errors | Zod issues mapped to field-level `errors` in the response envelope |

---

## Frontend Highlights

Built end-to-end in the same TypeScript codebase — aligned with CrossVal's "carry the feature through to the UI" expectation:

- **Dashboard** — collection rate, overdue exposure, quick-create shortcuts with keyboard bindings
- **Orders** — filterable list, detail drawer (overview + audit tab), inline pay/refund/edit actions
- **Payment modal** — client-side max-amount validation, progress bar, idempotency key per submission
- **CSV export bar** — date range picker with client-side range validation before download
- **Shared form layout** — consistent create/edit flows for items, users, orders, and profile
- **Token refresh** — axios interceptor retries once on `401` before surfacing auth errors

---

## Tech Stack

**API:** Node.js · Express 5 · TypeScript · MongoDB (Mongoose) · Zod · JWT · bcrypt · Vitest · Supertest

**Web:** React 19 · TypeScript · Vite · Tailwind CSS 4 · TanStack Query · React Hook Form · React Router 7 · Axios

---

## MongoDB Index Design

| Collection | Index | Purpose |
| --- | --- | --- |
| `transactions` | `{ organizationId: 1, idempotencyKey: 1 }` unique | Idempotent payment processing |
| `users` | `{ email: 1 }` unique | Login lookup |
| `organizations` | `{ slug: 1 }` unique | Org identity |

In production I would add compound indexes on hot query paths — e.g. `{ organizationId: 1, createdAt: -1 }` on orders for list/export, and `{ organizationId: 1, orderId: 1 }` on audit logs and transactions.

---

## What I'd Add for Production

Mapping this assignment to CrossVal's production bar:

- **AWS deployment** — ECS/Fargate or Lambda, DocumentDB or Atlas, Secrets Manager, CloudWatch alarms
- **Webhook ingestion** — for bank/accounting integrations with signature verification and retry queues
- **Decimal precision** — store amounts as integer minor units (fils/cents) to avoid floating-point drift
- **Background reconciliation** — nightly job comparing `amountPaid` against the sum of transactions
- **Rate limiting** — per-org API quotas, especially on export and payment endpoints
- **Structured logging + tracing** — correlation IDs across payment → audit log writes
- **CI/CD** — lint, typecheck, domain unit tests, and integration tests on every PR

---

## Scripts

### API (`apps/api`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled output |
| `npm test` | Run Vitest suite |
| `npm run test:watch` | Vitest in watch mode |

### Web (`apps/web`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |

---

## Author
Sujit Memane
Built as a take-home assignment for CrossVal's Backend / Full-Stack Developer role.

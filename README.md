# CrossVal Backend / Full-Stack Assignment

A multi-tenant order and payment management platform built for the [CrossVal](https://crossval.com) Backend / Full-Stack Developer assignment. It models a slice of what CrossVal does in production: **financial operations where correctness, auditability, and end-to-end ownership matter**.

Admins manage a catalog, create orders for customers, record payments and refunds, and export data for reporting. Every money-moving action is validated, idempotent where it needs to be, and written to an immutable audit trail.

---

## Walkthrough

The full app flow and the edge cases below are in this video — catalog, orders, payments, idempotency, refunds, audit, multi-tenancy, and auth.

**[Watch the 5-minute walkthrough on Loom](https://www.loom.com/share/2818b809f18a4b66a7bcdae0070544c6)**

[![Watch the 5-minute app walkthrough](https://cdn.loom.com/sessions/thumbnails/2818b809f18a4b66a7bcdae0070544c6-with-play.gif)](https://www.loom.com/share/2818b809f18a4b66a7bcdae0070544c6)

| Time | What I cover |
| --- | --- |
| 0:00 | Intro — reliability, auditability, and financial edge cases |
| 0:20 | Dashboard + catalog. Line-item **rate snapshot** so later price changes do not rewrite old orders |
| 0:50 | Customer + create order. Status is **derived** (pending / partially paid / overdue / paid), not stored |
| 1:30 | Record a payment. Remaining balance updates. **Overpayment rejected** by the API, not only the UI |
| 2:30 | **Idempotency** — same `idempotencyKey` replayed in Postman returns the existing transaction |
| 3:10 | Refund cannot exceed amount paid. **Audit trail** for every money-moving action |
| 3:40 | Architecture (`route → controller → service → repository`), org-scoped queries, JWT httpOnly cookies |

Flow shown: **Catalog → Customer → Order → Payment → Refund → Audit**.

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

### 3. Watch, then click through

Start with the **[walkthrough video](https://www.loom.com/share/2818b809f18a4b66a7bcdae0070544c6)**. Reproduce it with **[Testing Workflow](#testing-workflow)**. Import `apps/api/postman/Settle-API.postman_collection.json` for overpayment and idempotency. Tokens and IDs are captured between requests.

---

## Testing Workflow

Watch the [walkthrough](https://www.loom.com/share/2818b809f18a4b66a7bcdae0070544c6) first. Use this if you want to click through the same path locally.

The UI happy path is enough for catalog → order → pay → refund → audit. **Overpayment** and **idempotency** are easiest in Postman — the payment modal caps the amount and mints a new idempotency key on every submit.

Suggested numbers: items at **300** and **200** (order total **500**), then a partial payment of **200**.

### 1. Sign up → dashboard

1. Open `http://localhost:5173` → **Create account**.
2. Organization name, country `US`, currency `USD`, your name / email / password (min 8 chars).

**Expect:** signed in as admin on **Dashboard**. Collection and overdue stats start at zero.

### 2. Catalog

**Items → Add item.** Create `Consulting` at **300** and `Setup fee` at **200**, both Available.

**Expect:** both in the catalog. Changing a catalog rate later does **not** change rates already snapshotted on an order.

### 3. Customer

**Users → Add user**, role **Customer**. Copy the generated temp password if you want to sign in as that user later.

**Expect:** customer is selectable on the order form. Self-signup does not join an existing org.

### 4. Create order

**Orders → New order.** Pick the customer, add both items (qty 1), keep a **future** due date, save.

**Expect:** total **500**, status **Pending**. Status is derived from `amountPaid`, `totalAmount`, and `dueDate`.

Optional: change catalog rate of item A to `400`, reopen the order — line still shows **300**.

### 5. Partial payment

Open the order → **Pay** → amount **200**.

**Expect:** paid **200**, balance **300**, status **Partially paid**, transaction on the overview.

### 6. Overpayment (Postman)

UI will not allow this. `POST /api/transactions`:

```json
{
  "orderId": "<orderId>",
  "amount": 600,
  "type": "PAYMENT",
  "method": "CARD",
  "idempotencyKey": "overpay-test-1"
}
```

**Expect:** rejected. `amountPaid` stays **200**. Same rule is applied in the domain layer and again atomically in MongoDB (`$expr` on `amountPaid`).

### 7. Idempotency (Postman)

Use a **fixed** key (not `{{$guid}}`):

```json
{
  "orderId": "<orderId>",
  "amount": 50,
  "type": "PAYMENT",
  "method": "CARD",
  "note": "Idempotency demo",
  "idempotencyKey": "pay-retry-demo-1"
}
```

Send once → transaction created. Send the **same body** again.

**Expect:** `Transaction already processed`; balance unchanged. Unique index is `(organizationId, idempotencyKey)`.

### 8. Refund + audit

Order drawer → **Refund** (e.g. **50**) → confirm. Then open the **Audit** tab.

**Expect:** `amountPaid` drops; refund cannot exceed collected funds. Audit lists create / payment / refund, not only current balances.

### 9. Other states to try

| Check | How | Expect |
| --- | --- | --- |
| Fully paid | Pay remaining balance | **Paid**; Pay disabled; items/customer locked on edit |
| Overdue | Order with a **past** due date, unpaid | **Overdue**; dashboard overdue stats increment |
| Paid vs overdue | Fully pay that overdue order | **Paid** wins — never shown as overdue |
| Edit below paid | Drop line-item total under `amountPaid` | Rejected |
| CSV export | Orders page → date range | Rows filtered by `createdAt` |
| Cross-org | Second admin org hits the first org's `orderId` | `404` — queries scoped by JWT `organizationId` |

### Postman

1. Import `apps/api/postman/Settle-API.postman_collection.json`.
2. `baseUrl` = `http://localhost:4000/api` (or Render URL + `/api`).
3. Sign Up / Sign In → Create Item → Invite User → Create Order → Create Transaction.
4. For idempotency, hardcode `idempotencyKey` and replay.

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

These are the cases the walkthrough and domain layer are built around. Pure rules live in `apps/api/src/domain/` so they can be reasoned about without HTTP or Mongo.

### Auth

| Scenario | Handling |
| --- | --- |
| Duplicate signup email | `409 Email already in use` |
| Wrong password / unknown email | Same `401 Invalid email or password` (no user enumeration on sign-in) |
| Missing access cookie / Bearer token | `401 Authentication token missing` |
| Expired or tampered access JWT | `401`; web client refreshes once via httpOnly **refresh** cookie, then retries |
| Missing / invalid / expired refresh token | `401 Invalid or expired refresh token` |
| Refresh for a deleted user | Refresh looks the user up again; fails closed |
| Customer with no `organizationId` | `403` on org-scoped routes (`requireOrganization`) |
| Non-admin hitting user-admin routes | `403` via `requireRole('ADMIN')` |
| Forgot password for unknown email | `404` on that path; reset token is 32-byte random, TTL **10 minutes**, cleared after use |
| Expired / reused reset link | `400 Invalid or expired reset link` |
| Cross-site cookies (Vercel → Render) | Production cookies are `httpOnly`, `Secure`, `SameSite=None` so the access token is sent on credentialed API calls |
| Password change | Current password must match; new password hashed with bcrypt |

Tokens are not stored in `localStorage`. Access + refresh go in httpOnly cookies; CORS uses the exact `FRONTEND_URL` with `credentials: true`.

### Multi-tenancy

| Scenario | Handling |
| --- | --- |
| Org A reads Org B's order / item / user | Every repository query includes `organizationId` from the JWT — result is `404`, not another tenant's row |
| Item IDs from another org on create-order | `One or more items not found` — lookup is org-scoped |
| Reassign order to a user in another org | `User not found` |
| Idempotency key reused in a **different** org | Allowed — unique index is `(organizationId, idempotencyKey)` |
| Admin signup | Creates a **new** organization; customer self-signup does not join an existing org |

### Domain — orders

Status is **computed at read time** in `deriveOrderStatus` (`PAID` → `OVERDUE` → `PARTIALLY_PAID` → `PENDING`). It is not persisted, so concurrent payments cannot leave a stale status on the document.

| Scenario | Handling |
| --- | --- |
| Catalog price changes after order create | Line `rate` is snapshotted; historical totals stay put |
| Unavailable catalog item on create/update | Rejected with the item name |
| Duplicate item IDs in the payload | Caught via `Set` size vs found count |
| Missing / foreign item IDs | Rejected |
| Fully paid order — edit items or customer | `isOrderUpdateAllowed` is false; API `400`; UI locks those fields |
| New line-item total **below** `amountPaid` | Blocked — you cannot shrink the receivable under collected funds |
| Due date only change on a paid order | Allowed (does not change money); still audit-logged |
| Paid order whose due date is in the past | **Paid wins** — never shown as overdue |
| Unpaid / partial, due date in the past | **Overdue**, including when `amountPaid > 0` |
| Create order + audit `ORDER_CREATED` | Same Mongo session; abort rolls both back |

### Domain — payments & refunds

`isPaymentAllowed` / `isRefundAllowed` run first. `applyOrderPayment` then updates with a Mongo `$expr` so `0 ≤ amountPaid + delta ≤ totalAmount` even if two requests race.

| Scenario | Handling |
| --- | --- |
| Pay more than remaining balance | Rejected in domain **and** `$expr` (walkthrough overpay demo) |
| Refund more than `amountPaid` | Same dual-layer guard |
| Two payments in flight that would overshoot | Second `findOneAndUpdate` matches 0 docs → `400`; no overpay |
| Client retries the same payment (network blip) | Same `idempotencyKey` → existing txn returned, balance unchanged |
| Two retries racing to insert | Unique index `11000` → catch and replay the winner |
| Payment / refund + audit + status-change log | One Mongo transaction; any failure aborts all three |
| Status change after payment | Extra audit event `ORDER_<NEW_STATUS>` with `{ from, to }` |
| UI max-amount vs API | Modal caps input; Postman/API is the source of truth |

### Export

| Scenario | Handling |
| --- | --- |
| Empty date range | `404` |
| Range > 50,000 rows | `413` — narrow the range |
| Large exports | Cursor stream (`batchSize: 500`), not loaded into memory |
| Excel | UTF-8 BOM + CSV escaping |
| Timezone | UTC timestamps + header comment |

### Validation

Zod on every write path. Field-level `errors` in the response envelope so the UI can highlight inputs instead of a generic toast.

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

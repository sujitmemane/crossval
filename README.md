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

### 3. Test the product

Follow **[Testing Workflow](#testing-workflow)** below. Import `apps/api/postman/Settle-API.postman_collection.json` for the API-only checks (overpayment and payment idempotency). Tokens and entity IDs are captured automatically between requests.

---

## Testing Workflow

Use this as a reviewer script. The happy path is in the UI; overpayment and idempotency are easiest to prove in Postman because the payment modal blocks invalid amounts and generates a new idempotency key on every submit.

Suggested sample data: two catalog items at **300** and **200** (order total **500**), then a partial payment of **200**.

Drop captures into `docs/screenshots/` using the filenames below. GitHub will render them here once the files exist.

| File | What to capture |
| --- | --- |
| `01-signup.png` | Sign-up form (org + admin) |
| `02-dashboard-empty.png` | Dashboard right after signup (zeros) |
| `03-dashboard-activity.png` | Dashboard after orders/payments (collection + overdue) |
| `04-catalog.png` | Items list with two catalog items |
| `05-item-form.png` | Add/edit item form |
| `06-users.png` | Users list with a customer |
| `07-order-form.png` | New order form with customer + line items + total 500 |
| `08-orders-pending.png` | Orders list, status **Pending** |
| `09-drawer-pending.png` | Order drawer overview — unpaid, balance 500 |
| `10-payment-modal.png` | Record payment modal (amount 200, max 500) |
| `11-orders-partial.png` | Orders list, status **Partially paid** |
| `12-drawer-partial.png` | Drawer after payment — paid 200, due 300 |
| `13-postman-overpay.png` | Postman overpayment rejected |
| `14-postman-idempotent-1.png` | First payment with fixed idempotency key (created) |
| `15-postman-idempotent-2.png` | Same request replayed (existing transaction returned) |
| `16-refund-modal.png` | Issue refund modal + confirm step |
| `17-drawer-audit.png` | Order drawer **Audit** tab (create, payment, refund) |
| `18-orders-paid.png` | Orders list, status **Paid**; Pay disabled |
| `19-order-edit-locked.png` | Edit screen on a fully paid order (items/customer locked) |
| `20-orders-overdue.png` | Orders list, status **Overdue** |
| `21-dashboard-overdue.png` | Dashboard overdue amount / count |
| `22-csv-export.png` | Orders page export bar / downloaded CSV |

### 1. Sign up and land on the dashboard

1. Open `http://localhost:5173` (or the deployed Vercel URL).
2. Go to **Create account**.
3. Fill in:
   - Organization name
   - Country (`US`) and currency (`USD`)
   - Your name, email, and a password (min 8 characters)
4. Submit.

**Expect:** you are signed in as an admin and redirected to **Dashboard**. Collection and overdue stats start at zero. Quick actions are available for orders, items, and users.

![Sign up](docs/screenshots/01-signup.png)

![Dashboard — empty](docs/screenshots/02-dashboard-empty.png)

### 2. Catalog

1. Open **Items** → **Add item**.
2. Create item A: name `Consulting`, rate `300`, status **Available**.
3. Create item B: name `Setup fee`, rate `200`, status **Available**.

**Expect:** both items appear in the catalog. Later, if you change an item's rate, existing orders keep the rate that was snapshotted at order time.

![Add item form](docs/screenshots/05-item-form.png)

![Catalog](docs/screenshots/04-catalog.png)

### 3. Customer

1. Open **Users** → **Add user**.
2. Create a user with role **Customer** (name + unique email).
3. Copy the generated temporary password if you want to sign in as that customer later.

**Expect:** the customer appears in the users list and is selectable when creating an order. Admins invite customers; customers do not join an existing org via self-signup.

![Users / customers](docs/screenshots/06-users.png)

### 4. Create an order

1. Open **Orders** → **New order** (or use the dashboard shortcut).
2. Select the customer.
3. Add both catalog items (quantities `1` each).
4. Leave the default due date (or pick a future date so the order stays **Pending**, not **Overdue**).
5. Save.

**Expect:**
- Order total is **500** (sum of snapshotted line rates × quantities).
- Status is **Pending** (`amountPaid = 0`, due date in the future).
- Status is derived, not stored — it will change automatically after payments.

Optional snapshot check: edit item A's catalog rate to `400`, then reopen the order. Line items should still show **300**.

![Create order](docs/screenshots/07-order-form.png)

![Orders — Pending](docs/screenshots/08-orders-pending.png)

![Order drawer — Pending](docs/screenshots/09-drawer-pending.png)

### 5. Partial payment

1. Open the order (row click or drawer).
2. Click **Pay** / **Record payment**.
3. Enter **200**, pick a method (e.g. Cash), submit.

**Expect:**
- Amount paid = **200**, balance due = **300**.
- Status becomes **Partially paid**.
- The transaction appears on the order overview.

![Payment modal](docs/screenshots/10-payment-modal.png)

![Orders — Partially paid](docs/screenshots/11-orders-partial.png)

![Order drawer — after payment](docs/screenshots/12-drawer-partial.png)

### 6. Overpayment (backend rule)

The UI will not submit an amount above the remaining balance. Use Postman (or any HTTP client) against `POST /api/transactions`.

1. Sign in via the collection (**Auth → Sign In**) so the access cookie is set.
2. Use the `orderId` from the order you just created.
3. Send:

```json
{
  "orderId": "<orderId>",
  "amount": 600,
  "type": "PAYMENT",
  "method": "CARD",
  "idempotencyKey": "overpay-test-1"
}
```

**Expect:** the request is rejected (the remaining balance is 300). The order's `amountPaid` stays **200**. This is enforced in the service layer and again atomically in MongoDB (`$expr`), so two concurrent payments cannot overshoot the total.

![Postman — overpayment rejected](docs/screenshots/13-postman-overpay.png)

### 7. Payment idempotency (Postman)

1. Send a valid payment once, with a **fixed** key (do not use `{{$guid}}` for this check):

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

**Expect:** transaction created; `amountPaid` increases by **50**.

2. Send the **exact same body** again (same `idempotencyKey`).

**Expect:** no second payment. The API returns the existing transaction (`Transaction already processed`) and the order balance is unchanged.

The unique index is `(organizationId, idempotencyKey)`, so the same key can be reused in a different org but never double-applies inside one org.

![Postman — first payment](docs/screenshots/14-postman-idempotent-1.png)

![Postman — replay same key](docs/screenshots/15-postman-idempotent-2.png)

### 8. Refund + audit trail

**In the UI**

1. Open the same order → **Refund** / **Issue refund**.
2. Enter an amount **less than** amount paid (e.g. **50**).
3. Confirm the refund.

**Expect:** `amountPaid` decreases, status updates (still **Partially paid** if a balance remains), and you cannot refund more than has been collected (UI max + API guard).

**Audit**

1. In the order drawer, open the **Audit** tab.

**Expect:** append-only events for order creation, payment received, and refund — not only the current balances.

![Refund modal](docs/screenshots/16-refund-modal.png)

![Audit trail](docs/screenshots/17-drawer-audit.png)

### 9. Optional checks

| Check | How | Expect |
| --- | --- | --- |
| Fully paid | Pay the remaining balance | Status **Paid**; Pay is disabled; line items/customer are locked on edit |
| Overdue | Create an order with a **past** due date and no payment | Status **Overdue**; dashboard overdue stats increment |
| Paid wins over overdue | Fully pay that overdue order | Status **Paid**, never overdue |
| Edit below paid amount | Edit a partially paid order and drop the total under `amountPaid` | Rejected |
| CSV export | Orders page → date range → export | Download includes orders in that `createdAt` range |
| Multi-tenancy | Sign up a second admin (new org) and try the first org's `orderId` in Postman | `404` / no access — queries are scoped by `organizationId` from the JWT |

![Orders — Paid](docs/screenshots/18-orders-paid.png)

![Edit locked when fully paid](docs/screenshots/19-order-edit-locked.png)

![Orders — Overdue](docs/screenshots/20-orders-overdue.png)

![Dashboard — overdue activity](docs/screenshots/21-dashboard-overdue.png)

![CSV export](docs/screenshots/22-csv-export.png)

After there is real activity on the org, recapture the dashboard:

![Dashboard — with activity](docs/screenshots/03-dashboard-activity.png)

### Postman setup

1. Import `apps/api/postman/Settle-API.postman_collection.json`.
2. Set `baseUrl` to `http://localhost:4000/api` (or your Render URL + `/api`).
3. Run **Sign Up** or **Sign In**, then **Create Item** → **Create/Invite User** → **Create Order** → **Create Transaction**.
4. For idempotency, replace `"idempotencyKey": "{{$guid}}"` with a hardcoded string and replay the request.

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

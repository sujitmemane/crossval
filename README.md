# Settle

A monorepo containing the **API** (Express + MongoDB) and **Web** (React + Vite) apps.

## Project structure

```
.
├── apps/
│   ├── api/                     # Express + TypeScript + MongoDB backend
│   │   ├── src/
│   │   │   ├── config/          # Environment/config loading
│   │   │   ├── domain/          # Pure business logic (no framework/DB deps)
│   │   │   │   ├── order/
│   │   │   │   └── payment/
│   │   │   ├── lib/             # Infra: db connection, logger, error classes
│   │   │   ├── middleware/      # Express middleware (auth, validation, errors)
│   │   │   ├── modules/         # Feature modules, one folder per domain
│   │   │   │   ├── auth/
│   │   │   │   ├── orders/
│   │   │   │   └── payments/
│   │   │   ├── routes/          # Route aggregation
│   │   │   ├── app.ts           # Express app (middleware + routes wiring)
│   │   │   └── server.ts        # Entrypoint (starts the HTTP server)
│   │   ├── tests/
│   │   │   ├── domain/          # Unit tests for domain logic
│   │   │   └── integration/     # Route/API-level tests
│   │   ├── .env.example
│   │   └── package.json
│   │
│   └── web/                     # React + TypeScript + Vite frontend
│       ├── src/
│       ├── public/
│       └── package.json
│
├── .gitignore
└── README.md
```

Each feature module under `apps/api/src/modules/<name>/` follows the same layout:

| File | Responsibility |
| --- | --- |
| `*.routes.ts` | Maps HTTP routes to controller functions |
| `*.controller.ts` | Parses the request, calls the service, shapes the response |
| `*.service.ts` | Orchestrates business logic, calls the repository |
| `*.repository.ts` | Data access (MongoDB queries) |
| `*.model.ts` | Mongoose schema/model |
| `*.schema.ts` | Zod request validation schemas |

`src/domain/` holds pure, framework-free business rules (e.g. balance/total calculation, status derivation) so they can be unit tested without a database.

## Getting started

Each app is installed and run independently.

### API

```bash
cd apps/api
cp .env.example .env   # fill in real values
npm install
npm run dev             # http://localhost:4000
```

Other scripts: `npm run build`, `npm start`, `npm test`, `npm run test:watch`.

### Web

```bash
cd apps/web
npm install
npm run dev              # http://localhost:5173
```

Other scripts: `npm run build`, `npm run lint`, `npm run preview`.

## Tech stack

- **API:** Node.js, Express 5, TypeScript, MongoDB (Mongoose), Zod, JWT auth, Vitest
- **Web:** React 19, TypeScript, Vite, Tailwind CSS

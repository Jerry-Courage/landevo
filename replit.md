# Landevo — Real Estate Marketplace

A full-stack real estate marketplace connecting verified agents, government commissions, and buyers through a digital escrow system.

## Stack

- **Frontend**: React + Vite + TypeScript (`artifacts/landevo/`)
- **Backend**: Express 5 + TypeScript (`artifacts/api-server/`)
- **Database**: PostgreSQL via Drizzle ORM (`lib/db/`)
- **API contract**: OpenAPI 3.1 spec + Orval codegen (`lib/api-spec/`, `lib/api-client-react/`, `lib/api-zod/`)
- **Session storage**: PostgreSQL-backed sessions (`connect-pg-simple`)
- **Object storage**: Google Cloud Storage (`@google-cloud/storage`)

## Running the project

Both services start automatically via the **Project** workflow:

| Service | Port | Command |
|---|---|---|
| API Server | 8080 | `PORT=8080 pnpm --filter @workspace/api-server run dev` |
| Frontend | 21072 | `pnpm --filter @workspace/landevo run dev` |

The frontend proxies `/api/*` to the API server on port 8080.

## User roles

| Role | Description |
|---|---|
| `agent` | Lists properties, manages offers and transactions |
| `buyer` | Browses listings, makes offers, tracks escrow |
| `commission_admin` | Reviews and approves listing verifications |
| `system_admin` | Full platform oversight and user management |

## Key directories

```
artifacts/
  api-server/       # Express API (routes, middleware, libs)
  landevo/          # React frontend (pages, components, hooks)
lib/
  api-spec/         # openapi.yaml + Orval codegen config
  api-client-react/ # Generated React Query hooks
  api-zod/          # Generated Zod validation schemas
  db/               # Drizzle schema + migrations
  object-storage-web/ # Uppy-based file upload helpers
```

## After changing the OpenAPI spec

```bash
pnpm --filter @workspace/api-spec run codegen
```

This regenerates `lib/api-client-react/src/generated/` and `lib/api-zod/src/generated/`.

## Required secrets

| Secret | Purpose |
|---|---|
| `SESSION_SECRET` | Express session signing |

`DATABASE_URL` is runtime-managed by Replit — no manual setup needed.

## User preferences

- Keep the existing project structure and stack; no restructuring without explicit request.

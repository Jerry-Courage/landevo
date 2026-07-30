# Landevo

A real estate marketplace platform connecting verified agents, government land commissions, and buyers through a secure digital escrow system.

## Stack

- **Frontend**: React 19 + Vite + Tailwind CSS v4 + Wouter (routing) — `artifacts/landevo`
- **Backend**: Express 5 + Pino logging — `artifacts/api-server`
- **Database**: Replit PostgreSQL via Drizzle ORM — `lib/db`
- **Session store**: `connect-pg-simple` (sessions stored in Postgres)
- **Auth**: Email/password with bcryptjs; role-based (agent, buyer, commission_admin, system_admin)

## Project structure

```
artifacts/
  api-server/     Express API (port $PORT, default 8080)
  landevo/        React frontend (port $PORT, default 21072)
  mockup-sandbox/ Design canvas component sandbox
lib/
  db/             Drizzle schema + migrations
  api-spec/       OpenAPI spec (Orval codegen source)
  api-zod/        Generated Zod validators from OpenAPI spec
  api-client-react/ Generated React Query hooks from OpenAPI spec
```

## Running the project

Both services are managed as Replit workflows:

| Workflow | Command |
|---|---|
| `artifacts/api-server: API Server` | `pnpm --filter @workspace/api-server run dev` |
| `artifacts/landevo: web` | `pnpm --filter @workspace/landevo run dev` |

## Environment variables / secrets

| Key | Notes |
|---|---|
| `DATABASE_URL` | Runtime-managed by Replit (auto-injected) |
| `SESSION_SECRET` | Replit secret — required for Express sessions |

## Database

Schema is managed with Drizzle Kit. To push schema changes to the dev database:

```
cd lib/db && pnpm run push
```

The schema covers: `users`, `listings`, `offers`, `transactions`, `verifications`, `messages`, `notifications`, `session` (for connect-pg-simple).

## User preferences

_None recorded yet._

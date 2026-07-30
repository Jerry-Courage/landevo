# Landevo

A real estate marketplace platform with role-based access for agents, buyers, commission officers, and admins.

## Stack

- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui (`artifacts/landevo`)
- **Backend**: Express 5 API server with session-based auth (`artifacts/api-server`)
- **Database**: PostgreSQL via Drizzle ORM (`lib/db`)
- **Package manager**: pnpm workspaces

## How to run

Both services start automatically via their configured workflows:

- **Landevo Frontend** — `PORT=5173 pnpm --filter @workspace/landevo run dev`
- **API Server** — `PORT=8080 pnpm --filter @workspace/api-server run dev`

## Environment variables / secrets

| Key | Where | Notes |
|-----|-------|-------|
| `DATABASE_URL` | Runtime-managed | Set automatically by Replit |
| `SESSION_SECRET` | Secret | Required for express-session |

## Database

Schema is managed with Drizzle Kit. To push schema changes to the dev database:

```
pnpm --filter @workspace/db run push
```

Tables: `users` (with role enum: `agent`, `buyer`, `commission_admin`, `system_admin`), `session`

## Monorepo layout

```
artifacts/
  api-server/   Express API
  landevo/      React frontend
lib/
  api-client-react/   Generated React Query hooks
  api-spec/           OpenAPI spec
  api-zod/            Zod schemas
  db/                 Drizzle schema + client
```

## User preferences

(none yet)

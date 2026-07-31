# Landevo — Real Estate Marketplace

A full-stack Nigerian real estate marketplace platform connecting property agents, buyers, and commission officers.

## Stack

- **Frontend**: React 19 + Vite + Tailwind CSS (shadcn/ui components), served at `/`
- **API server**: Express 5 + Pino logger, served at port `8080`, proxied under `/api`
- **Database**: PostgreSQL (Replit built-in), schema managed by Drizzle ORM
- **Auth**: Session-based (express-session + connect-pg-simple), bcrypt password hashing

## User Roles

| Role | Email (dev seed) | Password |
|------|-----------------|----------|
| Agent | agent@landevo.ng | password123 |
| Buyer | buyer@landevo.ng | password123 |
| Commission Admin | commission@landevo.ng | password123 |
| System Admin | admin@landevo.ng | password123 |

## How to Run

The **Project** workflow runs both services together:

- `artifacts/landevo: web` — Vite dev server (port 21072, preview at `/`)
- `API Server` — Express server (port 8080, accessed via `/api` proxy)

## Project Structure

```
artifacts/
  api-server/      Express API (routes, middleware, libs)
  landevo/         React frontend (pages, components, hooks)
lib/
  api-spec/        OpenAPI spec + Orval codegen config
  api-client-react/ Generated React Query hooks
  api-zod/         Generated Zod validation schemas
  db/              Drizzle schema, migrations, seed script
```

## Database

Schema is pushed with:
```
pnpm --filter @workspace/db run push
```

Seed demo data with:
```
pnpm --filter @workspace/db run seed
```

After spec changes, regenerate types:
```
pnpm --filter @workspace/api-spec run codegen
```

## Environment Variables

- `DATABASE_URL` — auto-injected by Replit
- `SESSION_SECRET` — set as a Replit Secret

## User Preferences

- Keep the project's existing structure and stack — do not restructure or migrate it.

# Landevo — Secure Land Transaction Marketplace

A Nigerian real estate marketplace connecting verified agents, government commissions, and buyers through a digital escrow system.

## Stack

- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui (`artifacts/landevo`)
- **Backend**: Express API server (`artifacts/api-server`)
- **Database**: PostgreSQL via Drizzle ORM (`lib/db`)
- **Auth**: Session-based (express-session + connect-pg-simple)
- **Monorepo**: pnpm workspaces

## Running the project

Two services must be running:

| Service | Workflow | Port |
|---------|----------|------|
| API server | `API Server` | 8080 |
| Frontend | `artifacts/landevo: web` | 21072 |

Both workflows are configured and auto-start. The frontend proxies `/api` requests to the API server.

## Test accounts (password: `password123`)

| Role | Email |
|------|-------|
| Agent | agent@landevo.ng |
| Buyer | buyer@landevo.ng |
| Commission Officer | commission@landevo.ng |
| System Admin | admin@landevo.ng |

## Project structure

```
artifacts/
  api-server/     Express API (routes, middleware, build)
  landevo/        React frontend (pages, components, hooks)
lib/
  db/             Drizzle schema + seed script
  api-spec/       OpenAPI spec + orval codegen config
  api-zod/        Generated Zod validation schemas
  api-client-react/ Generated React Query hooks
```

## Database

Schema is managed with Drizzle. To push schema changes:
```bash
pnpm --filter @workspace/db run push
```

To re-seed demo data:
```bash
pnpm --filter @workspace/db run seed
```

## External services

- **Cloudinary** — used for file storage and uploads. Credentials are stored as Replit Secrets (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`).
- **Google Cloud Storage** — also referenced in storage routes; optional alternative to Cloudinary. Requires `GOOGLE_APPLICATION_CREDENTIALS` if used.

## User preferences

- Keep the existing monorepo structure and pnpm workspace conventions

# Landevo

A secure land transaction marketplace connecting verified agents, government commissions, and buyers through an immutable digital escrow system.

## Stack

- **Frontend**: React 19 + Vite + Tailwind CSS 4 + shadcn/ui + Wouter + React Query (`artifacts/landevo/`)
- **Backend**: Express 5 API server with session auth (`artifacts/api-server/`)
- **Database**: PostgreSQL via Drizzle ORM (`lib/db/`)
- **File storage**: Cloudinary (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`)
- **API contract**: OpenAPI spec → Orval codegen → Zod schemas + React Query hooks (`lib/api-spec/`, `lib/api-zod/`, `lib/api-client-react/`)

## Running the app

Two workflows run the app:

| Workflow | Command | Port |
|---|---|---|
| `API Server` | `PORT=8080 pnpm --filter @workspace/api-server run dev` | 8080 |
| `artifacts/landevo: web` | `pnpm --filter @workspace/landevo run dev` | 21072 |

The frontend proxies `/api` requests to the API server at port 8080.

## Key commands

```bash
# Install dependencies
pnpm install

# Push DB schema changes
pnpm --filter @workspace/db run push

# Seed demo data
pnpm --filter @workspace/db run seed

# Regenerate API client after spec changes
pnpm --filter @workspace/api-spec run codegen
```

## Required secrets

- `SESSION_SECRET` — express-session secret (set)
- `DATABASE_URL` — auto-provisioned by Replit
- `CLOUDINARY_CLOUD_NAME` — Cloudinary cloud name (set)
- `CLOUDINARY_API_KEY` — Cloudinary API key (set)
- `CLOUDINARY_API_SECRET` — Cloudinary API secret (set)

## User preferences

- Keep the project's existing structure and stack

# Landevo

A full-stack real estate marketplace platform for secure land transactions. It connects verified agents, government commission officers, and buyers through a multi-role workflow with escrow-based transactions and official listing verification.

## Architecture

- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui (`artifacts/landevo/`)
- **Backend**: Express API server (`artifacts/api-server/`)
- **Database**: PostgreSQL via Drizzle ORM (`lib/db/`)
- **API contract**: OpenAPI spec + Orval codegen (`lib/api-spec/openapi.yaml`)
- **Generated clients**: React Query hooks (`lib/api-client-react/`) and Zod schemas (`lib/api-zod/`)

## User Roles

| Role | Description |
|------|-------------|
| `agent` | Lists and manages property listings, submits for verification |
| `buyer` | Browses verified listings, makes offers, tracks transactions |
| `commission_admin` | Reviews and approves listing verifications |
| `system_admin` | Full platform oversight and management |

## How to Run

Both services start automatically:

- **Frontend** (`artifacts/landevo: web`): Runs on `$PORT` (assigned by Replit, default 21072)
- **API Server** (`API Server`): Runs on port 8080 via `PORT=8080 pnpm --filter @workspace/api-server run dev`

The API server builds with esbuild before starting (`pnpm run build && pnpm run start`).

## Key Commands

```bash
# Install all workspace dependencies
pnpm install

# Re-run codegen after OpenAPI spec changes
pnpm --filter @workspace/api-spec run codegen

# Push DB schema changes
pnpm --filter @workspace/db run push

# Type-check libs
pnpm run typecheck:libs

# Seed the database
pnpm --filter @workspace/db run seed
```

## Environment Variables / Secrets

| Variable | Required | Description |
|----------|----------|-------------|
| `SESSION_SECRET` | Yes | Express session secret |
| `DATABASE_URL` | Yes | Postgres connection string (auto-provided by Replit) |

## Notes

- The API server's `node_modules` are isolated — run `pnpm --filter @workspace/api-server install` if esbuild or other devDeps go missing
- After any change to `lib/api-spec/openapi.yaml`, always re-run codegen before touching frontend or backend code that depends on generated types
- Session cookies use `secure: false` — TLS is terminated at the Replit proxy layer

## User Preferences

<!-- Add user preferences here as they are expressed -->

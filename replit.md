# Landevo

A real estate platform for property agents and buyers — agents list, verify, and manage properties; buyers browse, make offers, and track transactions.

## Run & Operate

- **Frontend** (port 5173): workflow `Landevo Frontend` — `PORT=5173 BASE_PATH=/ pnpm --filter @workspace/landevo run dev`
- **API** (port 8080): workflow `API Server` — `PORT=8080 pnpm --filter @workspace/api-server run dev`
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` (Replit-managed), `SESSION_SECRET` (Replit secret)

## Auth

Session-based auth (express-session + connect-pg-simple, 30-day cookies).

- `POST /api/auth/register` — `{ name, email, password, role: "agent"|"buyer" }`
- `POST /api/auth/login` — `{ email, password }`
- `POST /api/auth/logout`
- `GET /api/auth/me` — returns current user or 401

Roles:
- **agent** → `/dashboard` and agent sidebar (Dashboard, Marketplace, Transactions, Messages, Settings)
- **buyer** → `/buyer` and buyer portal
- **commission_admin** → `/commission` and dedicated Land Commission portal (Dashboard, Agent Verifications, Listing Audits, Activity Log, Officers)

Commission admins cannot self-register — they must be provisioned directly in the DB (INSERT with role `commission_admin`).

## Test Accounts
- Agent: `agent@test.com` / `password123`
- Buyer: `buyer@test.com` / `password123`
- Commission: `commission@landevo.ng` / `commission123`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

_Populate as you build — short repo map plus pointers to the source-of-truth file for DB schema, API contracts, theme files, etc._

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

_Describe the high-level user-facing capabilities of this app once they exist._

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

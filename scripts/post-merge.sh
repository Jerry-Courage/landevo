#!/bin/bash
set -e
pnpm install --frozen-lockfile
pnpm --filter db push

# Create the session table used by connect-pg-simple (idempotent via IF NOT EXISTS)
node --input-type=module << 'EOF'
import pg from './node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/index.js';
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
await pool.query(`
  CREATE TABLE IF NOT EXISTS "session" (
    "sid" varchar NOT NULL COLLATE "default",
    "sess" json NOT NULL,
    "expire" timestamp(6) NOT NULL,
    CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE
  ) WITH (OIDS=FALSE);
  CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
`);
await pool.end();
console.log('Session table ready.');
EOF

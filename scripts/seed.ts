/**
 * Seed script — creates test accounts for development.
 * Run: pnpm --filter @workspace/scripts run seed
 *
 * Accounts created (all idempotent via ON CONFLICT DO NOTHING):
 *   agent@test.com        / password123   (role: agent)
 *   buyer@test.com        / password123   (role: buyer)
 *   commission@landevo.ng / commission123 (role: commission_admin)
 */

import bcrypt from "bcryptjs";
import { pool } from "@workspace/db";

const accounts = [
  { name: "Test Agent", email: "agent@test.com", password: "password123", role: "agent" },
  { name: "Test Buyer", email: "buyer@test.com", password: "password123", role: "buyer" },
  { name: "Commission Admin", email: "commission@landevo.ng", password: "commission123", role: "commission_admin" },
];

for (const account of accounts) {
  const passwordHash = await bcrypt.hash(account.password, 12);
  await pool.query(
    "INSERT INTO users (email, name, password_hash, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING",
    [account.email, account.name, passwordHash, account.role],
  );
  console.log(`Seeded: ${account.email} (${account.role})`);
}

await pool.end();
process.exit(0);

/**
 * Seed script — creates test accounts for development.
 * Run: pnpm --filter scripts run seed
 *
 * Accounts created (all idempotent via ON CONFLICT DO NOTHING):
 *   agent@test.com       / password123  (role: agent)
 *   buyer@test.com       / password123  (role: buyer)
 *   commission@landevo.ng / commission123 (role: commission_admin)
 */

import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const accounts = [
  { name: "Test Agent", email: "agent@test.com", password: "password123", role: "agent" as const },
  { name: "Test Buyer", email: "buyer@test.com", password: "password123", role: "buyer" as const },
  { name: "Commission Admin", email: "commission@landevo.ng", password: "commission123", role: "commission_admin" as const },
];

for (const account of accounts) {
  const passwordHash = await bcrypt.hash(account.password, 12);
  await db.execute(sql`
    INSERT INTO ${usersTable} (email, name, password_hash, role)
    VALUES (${account.email}, ${account.name}, ${passwordHash}, ${account.role})
    ON CONFLICT (email) DO NOTHING
  `);
  console.log(`Seeded: ${account.email} (${account.role})`);
}

process.exit(0);

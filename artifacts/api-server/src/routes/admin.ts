import { Router } from "express";
import { db, usersTable, listingsTable, transactionsTable } from "@workspace/db";
import { eq, sql, count } from "drizzle-orm";
import { requireRole } from "../middleware/require-auth";

const router = Router();

// GET /api/admin/users?role=...
router.get("/users", requireRole("system_admin"), async (req, res) => {
  const { role } = req.query as Record<string, string>;

  const rows = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      createdAt: usersTable.createdAt,
      listingCount:
        sql<number>`CAST(COALESCE((SELECT COUNT(*) FROM listings WHERE agent_id = ${usersTable.id}),0) AS INT)`,
      transactionCount:
        sql<number>`CAST(COALESCE((SELECT COUNT(*) FROM transactions WHERE buyer_id = ${usersTable.id} OR agent_id = ${usersTable.id}),0) AS INT)`,
    })
    .from(usersTable)
    .where(role ? eq(usersTable.role, role as typeof usersTable.role._.data) : undefined)
    .orderBy(sql`${usersTable.createdAt} DESC`);

  return res.json(rows);
});

export default router;

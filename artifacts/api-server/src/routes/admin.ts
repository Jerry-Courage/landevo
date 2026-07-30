import { Router } from "express";
import { db, usersTable, listingsTable, transactionsTable } from "@workspace/db";
import { eq, sql, ne } from "drizzle-orm";
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
      isActive: usersTable.isActive,
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

// PATCH /api/admin/users/:id  — update role and/or active status
router.patch("/users/:id", requireRole("system_admin"), async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  // Prevent admins from modifying their own account
  if (id === req.session.userId) {
    return res.status(400).json({ error: "Cannot modify your own account" });
  }

  const { role, isActive } = req.body as { role?: string; isActive?: boolean };

  if (role === undefined && isActive === undefined) {
    return res.status(400).json({ error: "Provide role or isActive to update" });
  }

  const [existing] = await db
    .select({ id: usersTable.id, role: usersTable.role })
    .from(usersTable)
    .where(eq(usersTable.id, id));

  if (!existing) return res.status(404).json({ error: "User not found" });

  // Prevent changing another system_admin's role (safety guard)
  if (existing.role === "system_admin" && role !== undefined) {
    return res.status(403).json({ error: "Cannot change a system admin's role" });
  }

  const validRoles = ["agent", "buyer", "commission_admin", "system_admin"];
  if (role !== undefined && !validRoles.includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  const updates: Partial<{ role: typeof usersTable.role._.data; isActive: boolean }> = {};
  if (role !== undefined) updates.role = role as typeof usersTable.role._.data;
  if (isActive !== undefined) updates.isActive = Boolean(isActive);

  const [updated] = await db
    .update(usersTable)
    .set(updates)
    .where(eq(usersTable.id, id))
    .returning({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      isActive: usersTable.isActive,
      createdAt: usersTable.createdAt,
    });

  return res.json(updated);
});

// GET /api/admin/stats  — overall platform stats for the dashboard
router.get("/stats", requireRole("system_admin"), async (req, res) => {
  const [userCounts] = await db
    .select({
      total: sql<number>`CAST(COUNT(*) AS INT)`,
      agents: sql<number>`CAST(SUM(CASE WHEN role = 'agent' THEN 1 ELSE 0 END) AS INT)`,
      buyers: sql<number>`CAST(SUM(CASE WHEN role = 'buyer' THEN 1 ELSE 0 END) AS INT)`,
      commissionAdmins: sql<number>`CAST(SUM(CASE WHEN role = 'commission_admin' THEN 1 ELSE 0 END) AS INT)`,
    })
    .from(usersTable);

  const [listingCounts] = await db
    .select({
      total: sql<number>`CAST(COUNT(*) AS INT)`,
      verified: sql<number>`CAST(SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) AS INT)`,
      pending: sql<number>`CAST(SUM(CASE WHEN status = 'pending_verification' THEN 1 ELSE 0 END) AS INT)`,
    })
    .from(listingsTable);

  const [txCounts] = await db
    .select({
      total: sql<number>`CAST(COUNT(*) AS INT)`,
      completed: sql<number>`CAST(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS INT)`,
      inEscrow: sql<number>`CAST(SUM(CASE WHEN status IN ('escrow_opened','funds_deposited') THEN 1 ELSE 0 END) AS INT)`,
      totalEscrowValue: sql<string>`COALESCE(SUM(CASE WHEN status IN ('escrow_opened','funds_deposited') THEN agreed_amount ELSE 0 END), 0)`,
    })
    .from(transactionsTable);

  return res.json({
    users: userCounts,
    listings: listingCounts,
    transactions: {
      ...txCounts,
      totalEscrowValue: parseFloat(txCounts?.totalEscrowValue ?? "0"),
    },
  });
});

export default router;

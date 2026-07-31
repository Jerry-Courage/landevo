import { Router } from "express";
import {
  db,
  usersTable,
  listingsTable,
  transactionsTable,
  activityLogsTable,
} from "@workspace/db";
import { eq, sql, desc, inArray } from "drizzle-orm";
import { requireRole } from "../middleware/require-auth";
import { logActivity } from "../lib/logActivity";

const router = Router();

// ─── USERS ────────────────────────────────────────────────────────────────────

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
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  if (id === req.session.userId) {
    return res.status(400).json({ error: "Cannot modify your own account" });
  }

  const { role, isActive } = req.body as { role?: string; isActive?: boolean };

  if (role === undefined && isActive === undefined) {
    return res.status(400).json({ error: "Provide role or isActive to update" });
  }

  const [existing] = await db
    .select({ id: usersTable.id, role: usersTable.role, name: usersTable.name })
    .from(usersTable)
    .where(eq(usersTable.id, id));

  if (!existing) return res.status(404).json({ error: "User not found" });

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

  const actorName = req.session.userName ?? "System Admin";
  if (isActive === false) {
    await logActivity({
      actorId: req.session.userId, actorName, actorRole: "Super Administrator",
      action: "Suspended user account",
      targetType: "User", targetLabel: `${existing.name} (USR-${id})`,
      kind: "reject", note: "Account deactivated by admin",
    });
  } else if (role) {
    await logActivity({
      actorId: req.session.userId, actorName, actorRole: "Super Administrator",
      action: `Changed user role to ${role}`,
      targetType: "User", targetLabel: `${existing.name} (USR-${id})`,
      kind: "system", note: `Role updated from ${existing.role} to ${role}`,
    });
  }

  return res.json(updated);
});

// GET /api/admin/stats
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

// ─── ESCROWS ──────────────────────────────────────────────────────────────────

function escrowStatus(txStatus: string): string {
  switch (txStatus) {
    case "escrow_opened":
    case "funds_deposited":        return "In Escrow";
    case "verification_complete":  return "Pending Release";
    case "completed":              return "Released";
    case "disputed":               return "Disputed";
    case "cancelled":              return "Refunded";
    default:                       return "In Escrow";
  }
}

function commissionStatus(txStatus: string): string {
  switch (txStatus) {
    case "escrow_opened":
    case "funds_deposited":        return "Pending";
    case "verification_complete":  return "Cleared";
    case "completed":              return "Cleared";
    case "disputed":               return "On Hold";
    case "cancelled":              return "N/A";
    default:                       return "Pending";
  }
}

// GET /api/admin/escrows
router.get("/escrows", requireRole("system_admin"), async (req, res) => {
  const rows = await db
    .select({
      id:            transactionsTable.id,
      listingTitle:  listingsTable.title,
      buyerName:     sql<string>`buyer.name`,
      agentName:     sql<string>`agent.name`,
      agreedAmount:  transactionsTable.agreedAmount,
      offerAmount:   transactionsTable.offerAmount,
      status:        transactionsTable.status,
      createdAt:     transactionsTable.createdAt,
      updatedAt:     transactionsTable.updatedAt,
    })
    .from(transactionsTable)
    .innerJoin(listingsTable, eq(transactionsTable.listingId, listingsTable.id))
    .innerJoin(sql`users buyer`, sql`buyer.id = ${transactionsTable.buyerId}`)
    .innerJoin(sql`users agent`, sql`agent.id = ${transactionsTable.agentId}`)
    .where(
      sql`${transactionsTable.status} IN ('escrow_opened','funds_deposited','verification_complete','completed','cancelled','disputed')`
    )
    .orderBy(desc(transactionsTable.createdAt));

  const now = Date.now();
  const mapped = rows.map((r) => {
    const status = escrowStatus(r.status);
    const heldSince = new Date(r.createdAt);
    const daysHeld = status === "Released" || status === "Refunded"
      ? 0
      : Math.floor((now - heldSince.getTime()) / 86_400_000);

    return {
      id: `TXN-${r.id}`,
      transactionId: r.id,
      property: r.listingTitle,
      buyer: r.buyerName,
      agent: r.agentName,
      value: parseFloat((r.agreedAmount ?? r.offerAmount) as string),
      status,
      held: heldSince.toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" }),
      commission: commissionStatus(r.status),
      daysHeld,
    };
  });

  return res.json(mapped);
});

// PATCH /api/admin/escrows/:id/release
router.patch("/escrows/:id/release", requireRole("system_admin"), async (req, res) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const [tx] = await db
    .select({ id: transactionsTable.id, status: transactionsTable.status, listingId: transactionsTable.listingId })
    .from(transactionsTable)
    .where(eq(transactionsTable.id, id));

  if (!tx) return res.status(404).json({ error: "Transaction not found" });
  if (tx.status !== "verification_complete") {
    return res.status(400).json({ error: "Transaction must be in verification_complete status to release" });
  }

  await db
    .update(transactionsTable)
    .set({ status: "completed", updatedAt: new Date() })
    .where(eq(transactionsTable.id, id));

  const [listing] = await db
    .select({ title: listingsTable.title })
    .from(listingsTable)
    .where(eq(listingsTable.id, tx.listingId));

  await logActivity({
    actorId: req.session.userId,
    actorName: req.session.userName ?? "System Admin",
    actorRole: "Super Administrator",
    action: "Released escrow funds",
    targetType: "Escrow",
    targetLabel: `TXN-${id} — ${listing?.title ?? "Unknown"}`,
    kind: "release",
    note: "Commission cleared, transaction completed",
  });

  return res.json({ success: true });
});

// PATCH /api/admin/escrows/:id/dispute
router.patch("/escrows/:id/dispute", requireRole("system_admin"), async (req, res) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const { note } = req.body as { note?: string };

  const [tx] = await db
    .select({ id: transactionsTable.id, status: transactionsTable.status, listingId: transactionsTable.listingId })
    .from(transactionsTable)
    .where(eq(transactionsTable.id, id));

  if (!tx) return res.status(404).json({ error: "Transaction not found" });
  if (!["escrow_opened", "funds_deposited", "verification_complete"].includes(tx.status)) {
    return res.status(400).json({ error: "Transaction cannot be disputed in its current state" });
  }

  await db
    .update(transactionsTable)
    .set({ status: "disputed", updatedAt: new Date() })
    .where(eq(transactionsTable.id, id));

  const [listing] = await db
    .select({ title: listingsTable.title })
    .from(listingsTable)
    .where(eq(listingsTable.id, tx.listingId));

  await logActivity({
    actorId: req.session.userId,
    actorName: req.session.userName ?? "System Admin",
    actorRole: "Super Administrator",
    action: "Flagged escrow dispute",
    targetType: "Escrow",
    targetLabel: `TXN-${id} — ${listing?.title ?? "Unknown"}`,
    kind: "flag",
    note: note ?? "Dispute raised by admin",
  });

  return res.json({ success: true });
});

// PATCH /api/admin/escrows/:id/resolve — resolve a dispute back to verification_complete
router.patch("/escrows/:id/resolve", requireRole("system_admin"), async (req, res) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const [tx] = await db
    .select({ id: transactionsTable.id, status: transactionsTable.status, listingId: transactionsTable.listingId })
    .from(transactionsTable)
    .where(eq(transactionsTable.id, id));

  if (!tx) return res.status(404).json({ error: "Transaction not found" });
  if (tx.status !== "disputed") {
    return res.status(400).json({ error: "Transaction is not in disputed state" });
  }

  await db
    .update(transactionsTable)
    .set({ status: "verification_complete", updatedAt: new Date() })
    .where(eq(transactionsTable.id, id));

  const [listing] = await db
    .select({ title: listingsTable.title })
    .from(listingsTable)
    .where(eq(listingsTable.id, tx.listingId));

  await logActivity({
    actorId: req.session.userId,
    actorName: req.session.userName ?? "System Admin",
    actorRole: "Super Administrator",
    action: "Resolved escrow dispute",
    targetType: "Escrow",
    targetLabel: `TXN-${id} — ${listing?.title ?? "Unknown"}`,
    kind: "approve",
    note: "Dispute resolved, funds returned to pending release",
  });

  return res.json({ success: true });
});

// GET /api/admin/activity-logs
router.get("/activity-logs", requireRole("system_admin"), async (req, res) => {
  const { type } = req.query as Record<string, string>;

  const rows = await db
    .select()
    .from(activityLogsTable)
    .orderBy(desc(activityLogsTable.createdAt))
    .limit(200);

  const filtered = type && type !== "All"
    ? rows.filter((r) => r.targetType === type)
    : rows;

  const mapped = filtered.map((r) => ({
    id: `SYS-${r.id}`,
    actor: r.actorName,
    role: r.actorRole,
    action: r.action,
    target: r.targetLabel,
    type: r.targetType,
    time: new Date(r.createdAt).toLocaleDateString("en-NG", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    }),
    note: r.note ?? "",
    kind: r.kind,
  }));

  return res.json(mapped);
});

export default router;

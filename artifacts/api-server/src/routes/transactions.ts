import { Router } from "express";
import {
  db,
  transactionsTable,
  listingsTable,
  usersTable,
  offersTable,
} from "@workspace/db";
import { eq, and, or, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/require-auth";
import { createNotification } from "../lib/notify";

const router = Router();

function txSelect() {
  return {
    id: transactionsTable.id,
    listingId: transactionsTable.listingId,
    listingTitle: listingsTable.title,
    buyerId: transactionsTable.buyerId,
    buyerName: sql<string>`buyer.name`,
    agentId: transactionsTable.agentId,
    agentName: sql<string>`agent.name`,
    offerId: transactionsTable.offerId,
    offerAmount: transactionsTable.offerAmount,
    agreedAmount: transactionsTable.agreedAmount,
    status: transactionsTable.status,
    escrowReference: transactionsTable.escrowReference,
    createdAt: transactionsTable.createdAt,
    updatedAt: transactionsTable.updatedAt,
  };
}

function formatTx(raw: Record<string, unknown>) {
  return {
    ...raw,
    offerAmount: raw.offerAmount != null ? parseFloat(raw.offerAmount as string) : null,
    agreedAmount: raw.agreedAmount != null ? parseFloat(raw.agreedAmount as string) : null,
  };
}

async function fetchTxById(id: number) {
  const [row] = await db
    .select(txSelect())
    .from(transactionsTable)
    .innerJoin(listingsTable, eq(transactionsTable.listingId, listingsTable.id))
    .innerJoin(sql`users buyer`, sql`buyer.id = ${transactionsTable.buyerId}`)
    .innerJoin(sql`users agent`, sql`agent.id = ${transactionsTable.agentId}`)
    .where(eq(transactionsTable.id, id));
  return row ?? null;
}

// GET /api/transactions
router.get("/", requireAuth, async (req, res) => {
  const userId = req.session.userId!;
  const role = req.session.userRole!;
  const { status } = req.query as Record<string, string>;

  const conditions = [];
  if (role === "buyer") {
    conditions.push(eq(transactionsTable.buyerId, userId));
  } else if (role === "agent") {
    conditions.push(eq(transactionsTable.agentId, userId));
  }
  // system_admin and commission_admin see all

  if (status) {
    conditions.push(
      eq(transactionsTable.status, status as typeof transactionsTable.status._.data),
    );
  }

  const rows = await db
    .select(txSelect())
    .from(transactionsTable)
    .innerJoin(listingsTable, eq(transactionsTable.listingId, listingsTable.id))
    .innerJoin(sql`users buyer`, sql`buyer.id = ${transactionsTable.buyerId}`)
    .innerJoin(sql`users agent`, sql`agent.id = ${transactionsTable.agentId}`)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(sql`${transactionsTable.createdAt} DESC`);

  return res.json(rows.map(formatTx));
});

// GET /api/transactions/:id
router.get("/:id", requireAuth, async (req, res) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const tx = await fetchTxById(id);
  if (!tx) return res.status(404).json({ error: "Transaction not found" });

  const userId = req.session.userId!;
  const role = req.session.userRole!;
  const isParticipant =
    tx.buyerId === userId ||
    tx.agentId === userId ||
    role === "system_admin" ||
    role === "commission_admin";
  if (!isParticipant) return res.status(403).json({ error: "Access denied" });

  return res.json(formatTx(tx as Record<string, unknown>));
});

// PATCH /api/transactions/:id/status
router.patch("/:id/status", requireAuth, async (req, res) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const { status } = req.body as { status?: string };
  if (!status) return res.status(400).json({ error: "status is required" });

  const [existing] = await db
    .select({
      id: transactionsTable.id,
      buyerId: transactionsTable.buyerId,
      agentId: transactionsTable.agentId,
      status: transactionsTable.status,
    })
    .from(transactionsTable)
    .where(eq(transactionsTable.id, id));

  if (!existing) return res.status(404).json({ error: "Transaction not found" });

  const userId = req.session.userId!;
  const role = req.session.userRole!;
  const isParticipant =
    existing.buyerId === userId ||
    existing.agentId === userId ||
    role === "system_admin" ||
    role === "commission_admin";

  if (!isParticipant) return res.status(403).json({ error: "Access denied" });

  // Role-based state machine
  // Terminal / immutable states
  if (existing.status === "completed" || existing.status === "cancelled") {
    return res.status(400).json({ error: "Transaction is already finalised" });
  }

  // Which statuses each role is permitted to set
  const allowedByRole: Record<string, string[]> = {
    buyer:            ["escrow_opened", "funds_deposited", "cancelled"],
    agent:            ["escrow_opened", "cancelled"],
    commission_admin: ["escrow_opened", "funds_deposited", "verification_complete", "completed", "cancelled"],
    system_admin:     ["escrow_opened", "funds_deposited", "verification_complete", "completed", "cancelled"],
  };

  const roleAllowed = allowedByRole[role] ?? [];
  if (!roleAllowed.includes(status)) {
    return res.status(403).json({ error: `Role '${role}' cannot set status '${status}'` });
  }

  // Forward-only validation: each status may only be reached from specific predecessor states
  const validFromStates: Record<string, string[]> = {
    escrow_opened:         ["accepted"],
    funds_deposited:       ["escrow_opened"],
    verification_complete: ["funds_deposited"],
    completed:             ["verification_complete"],
    cancelled:             ["accepted", "escrow_opened", "funds_deposited"],
  };

  const validFrom = validFromStates[status];
  if (validFrom && !validFrom.includes(existing.status)) {
    return res.status(400).json({
      error: `Cannot transition from '${existing.status}' to '${status}'`,
    });
  }

  await db
    .update(transactionsTable)
    .set({ status: status as typeof transactionsTable.status._.data, updatedAt: new Date() })
    .where(eq(transactionsTable.id, id));

  // Update listing status on terminal transitions
  if (status === "completed") {
    // Fetch the listing id from the transaction
    const [txRow] = await db
      .select({ listingId: transactionsTable.listingId })
      .from(transactionsTable)
      .where(eq(transactionsTable.id, id));
    if (txRow) {
      await db
        .update(listingsTable)
        .set({ status: "sold", updatedAt: new Date() })
        .where(eq(listingsTable.id, txRow.listingId));
    }
  } else if (status === "cancelled") {
    const [txRow] = await db
      .select({ listingId: transactionsTable.listingId })
      .from(transactionsTable)
      .where(eq(transactionsTable.id, id));
    if (txRow) {
      // Only revert to active if it's currently under_offer (guards against edge cases)
      await db
        .update(listingsTable)
        .set({ status: "active", updatedAt: new Date() })
        .where(and(eq(listingsTable.id, txRow.listingId), eq(listingsTable.status, "under_offer")));
    }
  }

  // Notify both parties
  const tx = await fetchTxById(id);
  if (tx) {
    const msg = `Transaction #${tx.id} for "${tx.listingTitle}" is now: ${status.replace(/_/g, " ")}.`;
    await createNotification({
      userId: existing.buyerId,
      type: "transaction_update",
      title: "Transaction updated",
      body: msg,
      relatedId: id,
    });
    if (existing.agentId !== existing.buyerId) {
      await createNotification({
        userId: existing.agentId,
        type: "transaction_update",
        title: "Transaction updated",
        body: msg,
        relatedId: id,
      });
    }
  }

  return res.json(formatTx((await fetchTxById(id))! as Record<string, unknown>));
});

export default router;

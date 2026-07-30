import { Router } from "express";
import {
  db,
  verificationsTable,
  listingsTable,
  usersTable,
} from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth, requireRole } from "../middleware/require-auth";
import { createNotification } from "../lib/notify";

const router = Router();

const officerAlias = usersTable;

async function getVerification(id: number) {
  const [row] = await db
    .select({
      id: verificationsTable.id,
      listingId: verificationsTable.listingId,
      listingTitle: listingsTable.title,
      agentId: listingsTable.agentId,
      agentName: sql<string>`agent.name`,
      officerId: verificationsTable.officerId,
      officerName: sql<string | null>`officer.name`,
      status: verificationsTable.status,
      notes: verificationsTable.notes,
      submittedAt: verificationsTable.submittedAt,
      reviewedAt: verificationsTable.reviewedAt,
      createdAt: verificationsTable.createdAt,
    })
    .from(verificationsTable)
    .innerJoin(listingsTable, eq(verificationsTable.listingId, listingsTable.id))
    .innerJoin(
      sql`users agent`,
      sql`agent.id = ${listingsTable.agentId}`,
    )
    .leftJoin(
      sql`users officer`,
      sql`officer.id = ${verificationsTable.officerId}`,
    )
    .where(eq(verificationsTable.id, id));

  return row ?? null;
}

// GET /api/verifications
router.get("/", requireAuth, async (req, res) => {
  const { status } = req.query as Record<string, string>;
  const role = req.session.userRole!;
  const userId = req.session.userId!;

  const conditions: ReturnType<typeof eq>[] = [];
  if (status) {
    conditions.push(
      eq(verificationsTable.status, status as typeof verificationsTable.status._.data),
    );
  }

  // Agents only see verifications for their own listings
  if (role === "agent") {
    conditions.push(eq(listingsTable.agentId, userId));
  }

  const rows = await db
    .select({
      id: verificationsTable.id,
      listingId: verificationsTable.listingId,
      listingTitle: listingsTable.title,
      agentName: sql<string>`agent.name`,
      officerId: verificationsTable.officerId,
      officerName: sql<string | null>`officer.name`,
      status: verificationsTable.status,
      notes: verificationsTable.notes,
      submittedAt: verificationsTable.submittedAt,
      reviewedAt: verificationsTable.reviewedAt,
      createdAt: verificationsTable.createdAt,
    })
    .from(verificationsTable)
    .innerJoin(listingsTable, eq(verificationsTable.listingId, listingsTable.id))
    .innerJoin(sql`users agent`, sql`agent.id = ${listingsTable.agentId}`)
    .leftJoin(sql`users officer`, sql`officer.id = ${verificationsTable.officerId}`)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(sql`${verificationsTable.createdAt} DESC`);

  return res.json(rows);
});

// GET /api/verifications/:id
router.get("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const v = await getVerification(id);
  if (!v) return res.status(404).json({ error: "Verification not found" });

  return res.json(v);
});

// PATCH /api/verifications/:id/assign
router.patch("/:id/assign", requireRole("commission_admin"), async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const { officerId } = req.body as { officerId?: number };
  if (!officerId) return res.status(400).json({ error: "officerId is required" });

  const [v] = await db
    .select({ id: verificationsTable.id, status: verificationsTable.status })
    .from(verificationsTable)
    .where(eq(verificationsTable.id, id));

  if (!v) return res.status(404).json({ error: "Verification not found" });

  await db
    .update(verificationsTable)
    .set({ officerId, status: "in_review" })
    .where(eq(verificationsTable.id, id));

  const updated = await getVerification(id);
  return res.json(updated);
});

// PATCH /api/verifications/:id/approve
router.patch("/:id/approve", requireRole("commission_admin"), async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const { notes } = req.body as { notes?: string };

  const [v] = await db
    .select({
      id: verificationsTable.id,
      listingId: verificationsTable.listingId,
      status: verificationsTable.status,
    })
    .from(verificationsTable)
    .where(eq(verificationsTable.id, id));

  if (!v) return res.status(404).json({ error: "Verification not found" });
  if (!["pending", "in_review"].includes(v.status)) {
    return res.status(400).json({ error: "Verification already resolved" });
  }

  await db
    .update(verificationsTable)
    .set({ status: "approved", notes: notes ?? null, reviewedAt: new Date() })
    .where(eq(verificationsTable.id, id));

  // Update listing status to active
  const [listing] = await db
    .select({ agentId: listingsTable.agentId, title: listingsTable.title })
    .from(listingsTable)
    .where(eq(listingsTable.id, v.listingId));

  await db
    .update(listingsTable)
    .set({ status: "active", updatedAt: new Date() })
    .where(eq(listingsTable.id, v.listingId));

  if (listing) {
    await createNotification({
      userId: listing.agentId,
      type: "listing_verified",
      title: "Listing approved!",
      body: `Your listing "${listing.title}" has been verified and is now active.`,
      relatedId: v.listingId,
    });
  }

  const updated = await getVerification(id);
  return res.json(updated);
});

// PATCH /api/verifications/:id/reject
router.patch("/:id/reject", requireRole("commission_admin"), async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const { notes } = req.body as { notes?: string };

  const [v] = await db
    .select({
      id: verificationsTable.id,
      listingId: verificationsTable.listingId,
      status: verificationsTable.status,
    })
    .from(verificationsTable)
    .where(eq(verificationsTable.id, id));

  if (!v) return res.status(404).json({ error: "Verification not found" });
  if (!["pending", "in_review"].includes(v.status)) {
    return res.status(400).json({ error: "Verification already resolved" });
  }

  await db
    .update(verificationsTable)
    .set({ status: "rejected", notes: notes ?? null, reviewedAt: new Date() })
    .where(eq(verificationsTable.id, id));

  // Revert listing to draft
  const [listing] = await db
    .select({ agentId: listingsTable.agentId, title: listingsTable.title })
    .from(listingsTable)
    .where(eq(listingsTable.id, v.listingId));

  await db
    .update(listingsTable)
    .set({ status: "draft", updatedAt: new Date() })
    .where(eq(listingsTable.id, v.listingId));

  if (listing) {
    await createNotification({
      userId: listing.agentId,
      type: "listing_rejected",
      title: "Listing needs changes",
      body: `Your listing "${listing.title}" was not approved.${notes ? ` Reason: ${notes}` : ""}`,
      relatedId: v.listingId,
    });
  }

  const updated = await getVerification(id);
  return res.json(updated);
});

export default router;

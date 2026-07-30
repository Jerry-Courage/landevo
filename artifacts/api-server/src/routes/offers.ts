import { Router } from "express";
import {
  db,
  offersTable,
  listingsTable,
  usersTable,
  transactionsTable,
} from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth, requireRole } from "../middleware/require-auth";
import { createNotification } from "../lib/notify";

const router = Router();

function offerSelect() {
  return {
    id: offersTable.id,
    listingId: offersTable.listingId,
    listingTitle: listingsTable.title,
    buyerId: offersTable.buyerId,
    buyerName: usersTable.name,
    amount: offersTable.amount,
    message: offersTable.message,
    status: offersTable.status,
    createdAt: offersTable.createdAt,
  };
}

function formatOffer(raw: Record<string, unknown>) {
  return {
    ...raw,
    amount: raw.amount != null ? parseFloat(raw.amount as string) : null,
  };
}

// GET /api/listings/:listingId/offers
router.get("/listings/:listingId/offers", requireAuth, async (req, res) => {
  const listingId = parseInt(req.params.listingId);
  if (isNaN(listingId)) return res.status(400).json({ error: "Invalid ID" });

  const role = req.session.userRole!;
  const userId = req.session.userId!;

  // Agents can only see offers on their own listings
  if (role === "agent") {
    const [listing] = await db
      .select({ agentId: listingsTable.agentId })
      .from(listingsTable)
      .where(eq(listingsTable.id, listingId));
    if (!listing || listing.agentId !== userId) {
      return res.status(403).json({ error: "Not your listing" });
    }
  }

  const conditions = [eq(offersTable.listingId, listingId)];
  // Buyers can only see their own offers
  if (role === "buyer") {
    conditions.push(eq(offersTable.buyerId, userId));
  }

  const rows = await db
    .select(offerSelect())
    .from(offersTable)
    .innerJoin(listingsTable, eq(offersTable.listingId, listingsTable.id))
    .innerJoin(usersTable, eq(offersTable.buyerId, usersTable.id))
    .where(and(...conditions))
    .orderBy(sql`${offersTable.createdAt} DESC`);

  return res.json(rows.map(formatOffer));
});

// POST /api/listings/:listingId/offers
router.post("/listings/:listingId/offers", requireRole("buyer"), async (req, res) => {
  const listingId = parseInt(req.params.listingId);
  if (isNaN(listingId)) return res.status(400).json({ error: "Invalid ID" });

  const { amount, message } = req.body;
  if (!amount || isNaN(parseFloat(amount))) {
    return res.status(400).json({ error: "Valid amount is required" });
  }

  const [listing] = await db
    .select({ agentId: listingsTable.agentId, status: listingsTable.status, title: listingsTable.title })
    .from(listingsTable)
    .where(eq(listingsTable.id, listingId));

  if (!listing) return res.status(404).json({ error: "Listing not found" });
  if (!["active", "verified"].includes(listing.status)) {
    return res.status(400).json({ error: "Listing is not available for offers" });
  }

  const [inserted] = await db
    .insert(offersTable)
    .values({
      listingId,
      buyerId: req.session.userId!,
      amount: String(amount),
      message: message ?? null,
    })
    .returning({ id: offersTable.id });

  // Notify the agent
  const [buyer] = await db
    .select({ name: usersTable.name })
    .from(usersTable)
    .where(eq(usersTable.id, req.session.userId!));

  await createNotification({
    userId: listing.agentId,
    type: "offer_received",
    title: "New offer received",
    body: `${buyer?.name ?? "A buyer"} made an offer of ${amount} on "${listing.title}".`,
    relatedId: inserted.id,
  });

  const [offer] = await db
    .select(offerSelect())
    .from(offersTable)
    .innerJoin(listingsTable, eq(offersTable.listingId, listingsTable.id))
    .innerJoin(usersTable, eq(offersTable.buyerId, usersTable.id))
    .where(eq(offersTable.id, inserted.id));

  return res.status(201).json(formatOffer(offer as Record<string, unknown>));
});

// GET /api/offers (buyer's own offers)
router.get("/offers", requireAuth, async (req, res) => {
  const userId = req.session.userId!;
  const role = req.session.userRole!;

  const conditions =
    role === "buyer"
      ? [eq(offersTable.buyerId, userId)]
      : role === "agent"
        ? [eq(listingsTable.agentId, userId)]
        : [];

  const rows = await db
    .select(offerSelect())
    .from(offersTable)
    .innerJoin(listingsTable, eq(offersTable.listingId, listingsTable.id))
    .innerJoin(usersTable, eq(offersTable.buyerId, usersTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(sql`${offersTable.createdAt} DESC`);

  return res.json(rows.map(formatOffer));
});

// PATCH /api/offers/:id/accept
router.patch("/offers/:id/accept", requireRole("agent"), async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const [offer] = await db
    .select({
      id: offersTable.id,
      listingId: offersTable.listingId,
      buyerId: offersTable.buyerId,
      amount: offersTable.amount,
      status: offersTable.status,
    })
    .from(offersTable)
    .where(eq(offersTable.id, id));

  if (!offer) return res.status(404).json({ error: "Offer not found" });
  if (offer.status !== "pending") return res.status(400).json({ error: "Offer is not pending" });

  const [listing] = await db
    .select({ agentId: listingsTable.agentId, title: listingsTable.title })
    .from(listingsTable)
    .where(eq(listingsTable.id, offer.listingId));

  if (!listing || listing.agentId !== req.session.userId) {
    return res.status(403).json({ error: "Not your listing" });
  }

  // All mutations are atomic: if transaction insert fails the offer/listing
  // changes are rolled back and no partial state is saved.
  const escrowRef = `ESC-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

  await db.transaction(async (tx) => {
    // Accept the offer
    await tx
      .update(offersTable)
      .set({ status: "accepted" })
      .where(eq(offersTable.id, id));

    // Reject all other pending offers on the same listing
    await tx
      .update(offersTable)
      .set({ status: "rejected" })
      .where(
        and(
          eq(offersTable.listingId, offer.listingId),
          eq(offersTable.status, "pending"),
        ),
      );

    // Update listing status
    await tx
      .update(listingsTable)
      .set({ status: "under_offer", updatedAt: new Date() })
      .where(eq(listingsTable.id, offer.listingId));

    // Create the escrow transaction record
    await tx.insert(transactionsTable).values({
      listingId: offer.listingId,
      buyerId: offer.buyerId,
      agentId: req.session.userId!,
      offerId: offer.id,
      offerAmount: offer.amount,
      agreedAmount: offer.amount,
      status: "accepted",
      escrowReference: escrowRef,
    });
  });

  // Notify the buyer (best-effort, outside the transaction)
  await createNotification({
    userId: offer.buyerId,
    type: "offer_accepted",
    title: "Your offer was accepted!",
    body: `Your offer on "${listing.title}" has been accepted. Escrow ref: ${escrowRef}`,
    relatedId: offer.listingId,
  });

  const [updated] = await db
    .select(offerSelect())
    .from(offersTable)
    .innerJoin(listingsTable, eq(offersTable.listingId, listingsTable.id))
    .innerJoin(usersTable, eq(offersTable.buyerId, usersTable.id))
    .where(eq(offersTable.id, id));

  return res.json(formatOffer(updated as Record<string, unknown>));
});

// PATCH /api/offers/:id/reject
router.patch("/offers/:id/reject", requireRole("agent"), async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const [offer] = await db
    .select({
      id: offersTable.id,
      listingId: offersTable.listingId,
      buyerId: offersTable.buyerId,
      status: offersTable.status,
    })
    .from(offersTable)
    .where(eq(offersTable.id, id));

  if (!offer) return res.status(404).json({ error: "Offer not found" });
  if (offer.status !== "pending") return res.status(400).json({ error: "Offer is not pending" });

  const [listing] = await db
    .select({ agentId: listingsTable.agentId, title: listingsTable.title })
    .from(listingsTable)
    .where(eq(listingsTable.id, offer.listingId));

  if (!listing || listing.agentId !== req.session.userId) {
    return res.status(403).json({ error: "Not your listing" });
  }

  await db.update(offersTable).set({ status: "rejected" }).where(eq(offersTable.id, id));

  await createNotification({
    userId: offer.buyerId,
    type: "offer_rejected",
    title: "Offer not accepted",
    body: `Your offer on "${listing.title}" was not accepted.`,
    relatedId: offer.listingId,
  });

  const [updated] = await db
    .select(offerSelect())
    .from(offersTable)
    .innerJoin(listingsTable, eq(offersTable.listingId, listingsTable.id))
    .innerJoin(usersTable, eq(offersTable.buyerId, usersTable.id))
    .where(eq(offersTable.id, id));

  return res.json(formatOffer(updated as Record<string, unknown>));
});

// PATCH /api/offers/:id/withdraw
router.patch("/offers/:id/withdraw", requireRole("buyer"), async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const [offer] = await db
    .select({
      id: offersTable.id,
      listingId: offersTable.listingId,
      buyerId: offersTable.buyerId,
      status: offersTable.status,
    })
    .from(offersTable)
    .where(and(eq(offersTable.id, id), eq(offersTable.buyerId, req.session.userId!)));

  if (!offer) return res.status(404).json({ error: "Offer not found" });
  if (offer.status !== "pending") return res.status(400).json({ error: "Only pending offers can be withdrawn" });

  await db.update(offersTable).set({ status: "withdrawn" }).where(eq(offersTable.id, id));

  const [updated] = await db
    .select(offerSelect())
    .from(offersTable)
    .innerJoin(listingsTable, eq(offersTable.listingId, listingsTable.id))
    .innerJoin(usersTable, eq(offersTable.buyerId, usersTable.id))
    .where(eq(offersTable.id, id));

  return res.json(formatOffer(updated as Record<string, unknown>));
});

export default router;

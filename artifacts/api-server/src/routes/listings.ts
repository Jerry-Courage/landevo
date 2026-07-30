import { Router } from "express";
import { db, listingsTable, usersTable, verificationsTable } from "@workspace/db";
import { eq, and, gte, lte, ilike, or, sql } from "drizzle-orm";
import { requireAuth, requireRole } from "../middleware/require-auth";
import { createNotification, notifyCommissionAdmins } from "../lib/notify";

const router = Router();

/** Build a select shape that includes agentName */
function listingSelect() {
  return {
    id: listingsTable.id,
    agentId: listingsTable.agentId,
    agentName: usersTable.name,
    title: listingsTable.title,
    description: listingsTable.description,
    price: listingsTable.price,
    location: listingsTable.location,
    address: listingsTable.address,
    city: listingsTable.city,
    state: listingsTable.state,
    areaSqm: listingsTable.areaSqm,
    bedrooms: listingsTable.bedrooms,
    bathrooms: listingsTable.bathrooms,
    propertyType: listingsTable.propertyType,
    status: listingsTable.status,
    images: listingsTable.images,
    verificationId: sql<number | null>`(
      SELECT id FROM verifications WHERE listing_id = ${listingsTable.id}
      ORDER BY created_at DESC LIMIT 1
    )`,
    createdAt: listingsTable.createdAt,
    updatedAt: listingsTable.updatedAt,
  };
}

function formatListing(raw: Record<string, unknown>) {
  return {
    ...raw,
    price: raw.price != null ? parseFloat(raw.price as string) : null,
    areaSqm: raw.areaSqm != null ? parseFloat(raw.areaSqm as string) : null,
  };
}

// GET /api/listings
router.get("/", requireAuth, async (req, res) => {
  const { status, propertyType, agentId, minPrice, maxPrice, search } = req.query as Record<string, string>;
  const userId = req.session.userId!;
  const role = req.session.userRole!;

  const conditions = [];

  // Agents only see their own listings when filtering by agent
  if (role === "agent") {
    conditions.push(eq(listingsTable.agentId, userId));
  } else if (agentId) {
    conditions.push(eq(listingsTable.agentId, parseInt(agentId)));
  }

  // Buyers only see active/verified/under_offer listings
  if (role === "buyer") {
    conditions.push(
      or(
        eq(listingsTable.status, "active"),
        eq(listingsTable.status, "verified"),
        eq(listingsTable.status, "under_offer"),
      )!,
    );
  }

  if (status && role !== "buyer") {
    conditions.push(eq(listingsTable.status, status as typeof listingsTable.status._.data));
  }
  if (status && role === "buyer") {
    conditions.push(eq(listingsTable.status, status as typeof listingsTable.status._.data));
  }
  if (propertyType) {
    conditions.push(eq(listingsTable.propertyType, propertyType as typeof listingsTable.propertyType._.data));
  }
  if (minPrice) {
    conditions.push(gte(listingsTable.price, minPrice));
  }
  if (maxPrice) {
    conditions.push(lte(listingsTable.price, maxPrice));
  }
  if (search) {
    conditions.push(
      or(
        ilike(listingsTable.title, `%${search}%`),
        ilike(listingsTable.city, `%${search}%`),
        ilike(listingsTable.location, `%${search}%`),
      )!,
    );
  }

  const rows = await db
    .select(listingSelect())
    .from(listingsTable)
    .innerJoin(usersTable, eq(listingsTable.agentId, usersTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(sql`${listingsTable.createdAt} DESC`);

  return res.json(rows.map(formatListing));
});

// POST /api/listings
router.post("/", requireRole("agent"), async (req, res) => {
  const { title, description, price, location, address, city, state, areaSqm, bedrooms, bathrooms, propertyType, images } = req.body;

  if (!title || !description || !price || !location || !address || !city || !state || !areaSqm || !propertyType) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const [inserted] = await db
    .insert(listingsTable)
    .values({
      agentId: req.session.userId!,
      title,
      description,
      price: String(price),
      location,
      address,
      city,
      state,
      areaSqm: String(areaSqm),
      bedrooms: bedrooms ?? null,
      bathrooms: bathrooms ?? null,
      propertyType,
      images: images ?? [],
    })
    .returning({ id: listingsTable.id });

  const [listing] = await db
    .select(listingSelect())
    .from(listingsTable)
    .innerJoin(usersTable, eq(listingsTable.agentId, usersTable.id))
    .where(eq(listingsTable.id, inserted.id));

  return res.status(201).json(formatListing(listing as Record<string, unknown>));
});

// GET /api/listings/:id
router.get("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const [listing] = await db
    .select(listingSelect())
    .from(listingsTable)
    .innerJoin(usersTable, eq(listingsTable.agentId, usersTable.id))
    .where(eq(listingsTable.id, id));

  if (!listing) return res.status(404).json({ error: "Listing not found" });

  return res.json(formatListing(listing as Record<string, unknown>));
});

// PATCH /api/listings/:id
router.patch("/:id", requireRole("agent"), async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const [existing] = await db
    .select({ agentId: listingsTable.agentId, status: listingsTable.status })
    .from(listingsTable)
    .where(eq(listingsTable.id, id));

  if (!existing) return res.status(404).json({ error: "Listing not found" });
  if (existing.agentId !== req.session.userId) return res.status(403).json({ error: "Not your listing" });

  const { title, description, price, location, address, city, state, areaSqm, bedrooms, bathrooms, propertyType, images } = req.body;

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (price !== undefined) updates.price = String(price);
  if (location !== undefined) updates.location = location;
  if (address !== undefined) updates.address = address;
  if (city !== undefined) updates.city = city;
  if (state !== undefined) updates.state = state;
  if (areaSqm !== undefined) updates.areaSqm = String(areaSqm);
  if (bedrooms !== undefined) updates.bedrooms = bedrooms;
  if (bathrooms !== undefined) updates.bathrooms = bathrooms;
  if (propertyType !== undefined) updates.propertyType = propertyType;
  if (images !== undefined) updates.images = images;

  await db.update(listingsTable).set(updates).where(eq(listingsTable.id, id));

  const [listing] = await db
    .select(listingSelect())
    .from(listingsTable)
    .innerJoin(usersTable, eq(listingsTable.agentId, usersTable.id))
    .where(eq(listingsTable.id, id));

  return res.json(formatListing(listing as Record<string, unknown>));
});

// DELETE /api/listings/:id
router.delete("/:id", requireRole("agent"), async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const [existing] = await db
    .select({ agentId: listingsTable.agentId, status: listingsTable.status })
    .from(listingsTable)
    .where(eq(listingsTable.id, id));

  if (!existing) return res.status(404).json({ error: "Listing not found" });
  if (existing.agentId !== req.session.userId) return res.status(403).json({ error: "Not your listing" });
  if (existing.status !== "draft") return res.status(400).json({ error: "Only draft listings can be deleted" });

  await db.delete(listingsTable).where(eq(listingsTable.id, id));
  return res.json({ ok: true });
});

// POST /api/listings/:id/submit
router.post("/:id/submit", requireRole("agent"), async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const [existing] = await db
    .select({ agentId: listingsTable.agentId, status: listingsTable.status, title: listingsTable.title })
    .from(listingsTable)
    .where(eq(listingsTable.id, id));

  if (!existing) return res.status(404).json({ error: "Listing not found" });
  if (existing.agentId !== req.session.userId) return res.status(403).json({ error: "Not your listing" });
  if (!["draft", "rejected"].includes(existing.status)) {
    return res.status(400).json({ error: "Only draft listings can be submitted for verification" });
  }

  await db
    .update(listingsTable)
    .set({ status: "pending_verification", updatedAt: new Date() })
    .where(eq(listingsTable.id, id));

  await db.insert(verificationsTable).values({ listingId: id });

  await notifyCommissionAdmins({
    type: "system",
    title: "New verification request",
    body: `Listing "${existing.title}" has been submitted for verification.`,
    relatedId: id,
  });

  const [listing] = await db
    .select(listingSelect())
    .from(listingsTable)
    .innerJoin(usersTable, eq(listingsTable.agentId, usersTable.id))
    .where(eq(listingsTable.id, id));

  return res.json(formatListing(listing as Record<string, unknown>));
});

export default router;

/**
 * Development seed script — populates the database with demo data.
 * Run: pnpm --filter @workspace/db run seed
 */
import { db } from "./index";
import {
  usersTable,
  listingsTable,
  offersTable,
  transactionsTable,
  verificationsTable,
  notificationsTable,
  messageThreadsTable,
  threadParticipantsTable,
  messagesTable,
} from "./schema/index";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database…");

  // ── 1. Users ─────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("password123", 10);

  // Check if already seeded
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, "agent@landevo.ng")).limit(1);
  if (existing.length > 0) {
    console.log("ℹ️  Database already seeded. Drop the tables and re-run to re-seed.");
    return;
  }

  const [agent1] = await db
    .insert(usersTable)
    .values({ email: "agent@landevo.ng", name: "Chidi Okafor", passwordHash, role: "agent", isActive: true })
    .returning();

  const [buyer1] = await db
    .insert(usersTable)
    .values({ email: "buyer@landevo.ng", name: "Babatunde Makanjuola", passwordHash, role: "buyer", isActive: true })
    .returning();

  const [commAdmin] = await db
    .insert(usersTable)
    .values({ email: "commission@landevo.ng", name: "Ngozi Eze", passwordHash, role: "commission_admin", isActive: true })
    .returning();

  await db
    .insert(usersTable)
    .values({ email: "admin@landevo.ng", name: "System Admin", passwordHash, role: "system_admin", isActive: true });

  console.log("✅ Users created");

  // ── 2. Listings ───────────────────────────────────────────────────────────
  const createdListings = await db.insert(listingsTable).values([
    {
      agentId: agent1.id,
      title: "Emerald Valley Phase II",
      description: "Premium 600 sqm residential plot in Lekki. Fully dry, levelled, and ready for immediate development. Valid C of O and Lagos Land Bureau approval.",
      price: "25000000",
      location: "Lekki, Lagos",
      address: "Block 12, Plot 4, Lekki Phase 2",
      city: "Lekki",
      state: "Lagos State",
      areaSqm: "600",
      propertyType: "residential" as const,
      status: "active" as const,
      images: [] as string[],
    },
    {
      agentId: agent1.id,
      title: "Sunset Heights Estate",
      description: "Prestigious 1,200 sqm plot in Ikoyi with lagoon views.",
      price: "48000000",
      location: "Ikoyi, Lagos",
      address: "5 Sunset Avenue, Ikoyi",
      city: "Ikoyi",
      state: "Lagos State",
      areaSqm: "1200",
      propertyType: "residential" as const,
      status: "verified" as const,
      images: [] as string[],
    },
    {
      agentId: agent1.id,
      title: "Prime Industrial Zone",
      description: "5,000 sqm industrial-zoned plot in Agbara with direct road access.",
      price: "120000000",
      location: "Agbara, Ogun",
      address: "Plot 7, Agbara Industrial Estate",
      city: "Agbara",
      state: "Ogun State",
      areaSqm: "5000",
      propertyType: "commercial" as const,
      status: "active" as const,
      images: [] as string[],
    },
    {
      agentId: agent1.id,
      title: "Riverside Garden Plots",
      description: "450 sqm plot in Ikorodu with riverfront access.",
      price: "8500000",
      location: "Ikorodu, Lagos",
      address: "Riverside Estate, Ikorodu",
      city: "Ikorodu",
      state: "Lagos State",
      areaSqm: "450",
      propertyType: "land" as const,
      status: "pending_verification" as const,
      images: [] as string[],
    },
    {
      agentId: agent1.id,
      title: "Oakwood Residential Plot",
      description: "900 sqm plot in Epe with title deed and gazette.",
      price: "15000000",
      location: "Epe, Lagos",
      address: "Oakwood Estate, Epe",
      city: "Epe",
      state: "Lagos State",
      areaSqm: "900",
      propertyType: "residential" as const,
      status: "verified" as const,
      images: [] as string[],
    },
    {
      agentId: agent1.id,
      title: "Prime Waterfront Commercial Plot",
      description: "2,400 sqm prime commercial land on Victoria Island waterfront.",
      price: "245000000",
      location: "Victoria Island, Lagos",
      address: "10 Marine Road, Victoria Island",
      city: "Victoria Island",
      state: "Lagos State",
      areaSqm: "2400",
      propertyType: "commercial" as const,
      status: "active" as const,
      images: [] as string[],
    },
  ]).returning();

  console.log(`✅ ${createdListings.length} listings created`);

  // ── 3. Verifications ──────────────────────────────────────────────────────
  const listingToVerify = createdListings[1]; // Sunset Heights
  const listingToVerify2 = createdListings[4]; // Oakwood

  await db.insert(verificationsTable).values([
    {
      listingId: listingToVerify.id,
      officerId: commAdmin.id,
      status: "approved" as const,
      notes: "All title documents verified. C of O confirmed authentic.",
      submittedAt: new Date(),
      reviewedAt: new Date(),
    },
    {
      listingId: listingToVerify2.id,
      officerId: commAdmin.id,
      status: "approved" as const,
      notes: "Survey plan and gazette verified.",
      submittedAt: new Date(),
      reviewedAt: new Date(),
    },
    {
      listingId: createdListings[3].id, // Riverside - pending
      status: "pending" as const,
      notes: null,
      submittedAt: new Date(),
    },
  ]);

  console.log("✅ Verifications created");

  // ── 4. Offers ─────────────────────────────────────────────────────────────
  const [offer1] = await db.insert(offersTable).values({
    listingId: createdListings[0].id, // Emerald Valley
    buyerId: buyer1.id,
    amount: "23000000",
    message: "I am very interested in this property. Is there room for negotiation?",
    status: "pending",
  }).returning();

  const [offer2] = await db.insert(offersTable).values({
    listingId: createdListings[4].id, // Oakwood
    buyerId: buyer1.id,
    amount: "14500000",
    message: "Great plot. Ready to proceed immediately.",
    status: "accepted",
  }).returning();

  const [offer3] = await db.insert(offersTable).values({
    listingId: createdListings[2].id, // Industrial
    buyerId: buyer1.id,
    amount: "115000000",
    message: "Industrial expansion for our manufacturing facility.",
    status: "rejected",
  }).returning();

  console.log("✅ Offers created");

  // ── 5. Transaction ────────────────────────────────────────────────────────
  await db.insert(transactionsTable).values({
    listingId: createdListings[4].id, // Oakwood
    buyerId: buyer1.id,
    agentId: agent1.id,
    offerId: offer2.id,
    offerAmount: offer2.amount,
    agreedAmount: "14500000",
    status: "escrow_opened",
    escrowReference: "ESC-294821-X",
  });

  console.log("✅ Transaction created");

  // ── 6. Notifications ──────────────────────────────────────────────────────
  await db.insert(notificationsTable).values([
    {
      userId: buyer1.id,
      type: "offer_accepted" as const,
      title: "Offer Accepted",
      body: `Your offer of ₦14,500,000 for ${createdListings[4].title} has been accepted. Proceed to escrow.`,
    },
    {
      userId: buyer1.id,
      type: "transaction_update" as const,
      title: "Escrow Opened",
      body: "Escrow reference ESC-294821-X has been created. Funds are now held securely.",
    },
    {
      userId: buyer1.id,
      type: "offer_rejected" as const,
      title: "Offer Rejected",
      body: `Your offer for ${createdListings[2].title} was not accepted by the agent.`,
    },
    {
      userId: agent1.id,
      type: "offer_received" as const,
      title: "New Offer Received",
      body: `${buyer1.name} submitted an offer of ₦23,000,000 for ${createdListings[0].title}.`,
    },
    {
      userId: agent1.id,
      type: "listing_verified" as const,
      title: "Listing Verified",
      body: `${listingToVerify2.title} has been verified by the Land Commission.`,
    },
    {
      userId: commAdmin.id,
      type: "system" as const,
      title: "New Verification Request",
      body: `${createdListings[3].title} has been submitted for verification.`,
    },
  ]);

  console.log("✅ Notifications created");

  // ── 7. Message thread ─────────────────────────────────────────────────────
  const [thread] = await db.insert(messageThreadsTable).values({
    listingId: createdListings[0].id,
    lastMessageAt: new Date(),
  }).returning();

  await db.insert(threadParticipantsTable).values([
    { threadId: thread.id, userId: buyer1.id },
    { threadId: thread.id, userId: agent1.id },
  ]);

  await db.insert(messagesTable).values([
    {
      threadId: thread.id,
      senderId: buyer1.id,
      content: "Hello! I saw your listing for Emerald Valley Phase II. Is the price negotiable?",
    },
    {
      threadId: thread.id,
      senderId: agent1.id,
      content: "Hi! Yes, it's one of our most premium listings. There is some flexibility. Would you like to schedule a site visit?",
    },
    {
      threadId: thread.id,
      senderId: buyer1.id,
      content: "I'm very interested. Can we do a Thursday morning visit? Also, is the C of O fully processed?",
    },
  ]);

  console.log("✅ Messages created");

  console.log("\n✅ Seed complete! Database is ready for testing.");
  console.log("\n📋 Test accounts (password: password123):");
  console.log("  Agent:      agent@landevo.ng");
  console.log("  Buyer:      buyer@landevo.ng");
  console.log("  Commission: commission@landevo.ng");
  console.log("  Admin:      admin@landevo.ng");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });

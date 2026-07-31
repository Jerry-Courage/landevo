import { Router } from "express";
import {
  db,
  listingsTable,
  transactionsTable,
  verificationsTable,
  offersTable,
  usersTable,
} from "@workspace/db";
import { eq, and, gte, sql, count } from "drizzle-orm";
import { requireAuth, requireRole } from "../middleware/require-auth";

const router = Router();

// GET /api/dashboard/agent
router.get("/agent", requireRole("agent"), async (req, res) => {
  const agentId = req.session.userId!;

  const listings = await db
    .select({ status: listingsTable.status, count: count() })
    .from(listingsTable)
    .where(eq(listingsTable.agentId, agentId))
    .groupBy(listingsTable.status);

  const listingsByStatus: Record<string, number> = {};
  let totalListings = 0, activeListings = 0, pendingVerifications = 0;

  for (const row of listings) {
    listingsByStatus[row.status] = row.count;
    totalListings += row.count;
    if (row.status === "active") activeListings = row.count;
    if (row.status === "pending_verification") pendingVerifications = row.count;
  }

  const recentOffers = await db
    .select({
      id: offersTable.id,
      listingId: offersTable.listingId,
      listingTitle: listingsTable.title,
      buyerId: offersTable.buyerId,
      buyerName: usersTable.name,
      amount: offersTable.amount,
      message: offersTable.message,
      status: offersTable.status,
      createdAt: offersTable.createdAt,
    })
    .from(offersTable)
    .innerJoin(listingsTable, eq(offersTable.listingId, listingsTable.id))
    .innerJoin(usersTable, eq(offersTable.buyerId, usersTable.id))
    .where(eq(listingsTable.agentId, agentId))
    .orderBy(sql`${offersTable.createdAt} DESC`)
    .limit(10);

  const recentTransactions = await db
    .select({
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
    })
    .from(transactionsTable)
    .innerJoin(listingsTable, eq(transactionsTable.listingId, listingsTable.id))
    .innerJoin(sql`users buyer`, sql`buyer.id = ${transactionsTable.buyerId}`)
    .innerJoin(sql`users agent`, sql`agent.id = ${transactionsTable.agentId}`)
    .where(eq(transactionsTable.agentId, agentId))
    .orderBy(sql`${transactionsTable.createdAt} DESC`)
    .limit(5);

  const totalOfferValueResult = await db
    .select({ total: sql<string>`COALESCE(SUM(${offersTable.amount}), 0)` })
    .from(offersTable)
    .innerJoin(listingsTable, eq(offersTable.listingId, listingsTable.id))
    .where(and(eq(listingsTable.agentId, agentId), eq(offersTable.status, "pending")));

  return res.json({
    totalListings,
    activeListings,
    pendingVerifications,
    totalOfferValue: parseFloat(totalOfferValueResult[0]?.total ?? "0"),
    listingsByStatus,
    recentOffers: recentOffers.map((o) => ({ ...o, amount: parseFloat(o.amount as string) })),
    recentTransactions: recentTransactions.map((t) => ({
      ...t,
      offerAmount: parseFloat(t.offerAmount as string),
      agreedAmount: parseFloat(t.agreedAmount as string),
    })),
  });
});

// GET /api/dashboard/buyer
router.get("/buyer", requireRole("buyer"), async (req, res) => {
  const buyerId = req.session.userId!;

  const offerCounts = await db
    .select({ status: offersTable.status, count: count() })
    .from(offersTable)
    .where(eq(offersTable.buyerId, buyerId))
    .groupBy(offersTable.status);

  let activeOffers = 0, acceptedOffers = 0;
  for (const row of offerCounts) {
    if (row.status === "pending") activeOffers = row.count;
    if (row.status === "accepted") acceptedOffers = row.count;
  }

  const [{ activeTransactions }] = await db
    .select({ activeTransactions: count() })
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.buyerId, buyerId),
        sql`${transactionsTable.status} NOT IN ('completed', 'cancelled')`,
      ),
    );

  const recentListings = await db
    .select({
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
    })
    .from(listingsTable)
    .innerJoin(usersTable, eq(listingsTable.agentId, usersTable.id))
    .where(sql`${listingsTable.status} IN ('active', 'verified')`)
    .orderBy(sql`${listingsTable.createdAt} DESC`)
    .limit(6);

  const recentOffers = await db
    .select({
      id: offersTable.id,
      listingId: offersTable.listingId,
      listingTitle: listingsTable.title,
      buyerId: offersTable.buyerId,
      buyerName: usersTable.name,
      amount: offersTable.amount,
      message: offersTable.message,
      status: offersTable.status,
      createdAt: offersTable.createdAt,
    })
    .from(offersTable)
    .innerJoin(listingsTable, eq(offersTable.listingId, listingsTable.id))
    .innerJoin(usersTable, eq(offersTable.buyerId, usersTable.id))
    .where(eq(offersTable.buyerId, buyerId))
    .orderBy(sql`${offersTable.createdAt} DESC`)
    .limit(5);

  return res.json({
    activeOffers,
    acceptedOffers,
    activeTransactions,
    recentListings: recentListings.map((l) => ({
      ...l, price: parseFloat(l.price as string), areaSqm: parseFloat(l.areaSqm as string),
    })),
    recentOffers: recentOffers.map((o) => ({ ...o, amount: parseFloat(o.amount as string) })),
  });
});

// ─── Helpers for monthly breakdowns ───────────────────────────────────────────

function last6MonthLabels(): Array<{ label: string; year: number; month: number }> {
  const result = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({
      label: d.toLocaleString("en-NG", { month: "short" }),
      year: d.getFullYear(),
      month: d.getMonth() + 1, // 1-based
    });
  }
  return result;
}

// GET /api/dashboard/commission
router.get("/commission", requireRole("commission_admin"), async (req, res) => {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const allVerifications = await db
    .select({ status: verificationsTable.status, count: count() })
    .from(verificationsTable)
    .groupBy(verificationsTable.status);

  let pendingVerifications = 0, inReviewVerifications = 0;
  for (const row of allVerifications) {
    if (row.status === "pending") pendingVerifications = row.count;
    if (row.status === "in_review") inReviewVerifications = row.count;
  }

  const thisMonthVerifications = await db
    .select({ status: verificationsTable.status, count: count() })
    .from(verificationsTable)
    .where(gte(verificationsTable.reviewedAt, monthStart))
    .groupBy(verificationsTable.status);

  let approvedThisMonth = 0, rejectedThisMonth = 0;
  for (const row of thisMonthVerifications) {
    if (row.status === "approved") approvedThisMonth = row.count;
    if (row.status === "rejected") rejectedThisMonth = row.count;
  }

  const recentVerifications = await db
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
    .orderBy(sql`${verificationsTable.createdAt} DESC`)
    .limit(10);

  // Monthly chart: last 6 months
  const months = last6MonthLabels();
  const monthlyRows = await db.execute(sql`
    SELECT
      EXTRACT(YEAR FROM reviewed_at)::int  AS yr,
      EXTRACT(MONTH FROM reviewed_at)::int AS mo,
      status,
      COUNT(*)::int                        AS cnt
    FROM verifications
    WHERE reviewed_at IS NOT NULL
      AND reviewed_at >= NOW() - INTERVAL '6 months'
    GROUP BY yr, mo, status
  `);

  const monthlyMap: Record<string, { approved: number; rejected: number }> = {};
  for (const row of monthlyRows.rows as any[]) {
    const key = `${row.yr}-${row.mo}`;
    if (!monthlyMap[key]) monthlyMap[key] = { approved: 0, rejected: 0 };
    if (row.status === "approved") monthlyMap[key].approved = row.cnt;
    if (row.status === "rejected") monthlyMap[key].rejected = row.cnt;
  }

  const monthlyActivity = months.map(({ label, year, month }) => ({
    month: label,
    approved: monthlyMap[`${year}-${month}`]?.approved ?? 0,
    rejected:  monthlyMap[`${year}-${month}`]?.rejected ?? 0,
  }));

  return res.json({
    pendingVerifications,
    inReviewVerifications,
    approvedThisMonth,
    rejectedThisMonth,
    recentVerifications,
    monthlyActivity,
  });
});

// GET /api/dashboard/admin
router.get("/admin", requireRole("system_admin"), async (req, res) => {
  const userCounts = await db
    .select({ role: usersTable.role, count: count() })
    .from(usersTable)
    .groupBy(usersTable.role);

  let totalUsers = 0, totalAgents = 0, totalBuyers = 0;
  for (const row of userCounts) {
    totalUsers += row.count;
    if (row.role === "agent") totalAgents = row.count;
    if (row.role === "buyer") totalBuyers = row.count;
  }

  const listingCounts = await db
    .select({ status: listingsTable.status, count: count() })
    .from(listingsTable)
    .groupBy(listingsTable.status);

  let totalListings = 0, activeListings = 0;
  for (const row of listingCounts) {
    totalListings += row.count;
    if (row.status === "active") activeListings = row.count;
  }

  const txCounts = await db
    .select({ status: transactionsTable.status, count: count() })
    .from(transactionsTable)
    .groupBy(transactionsTable.status);

  let totalTransactions = 0, completedTransactions = 0;
  for (const row of txCounts) {
    totalTransactions += row.count;
    if (row.status === "completed") completedTransactions = row.count;
  }

  const [{ pendingVerifications }] = await db
    .select({ pendingVerifications: count() })
    .from(verificationsTable)
    .where(sql`${verificationsTable.status} IN ('pending', 'in_review')`);

  // Monthly volume chart: last 6 months
  const months = last6MonthLabels();
  const monthlyRows = await db.execute(sql`
    SELECT
      EXTRACT(YEAR FROM created_at)::int   AS yr,
      EXTRACT(MONTH FROM created_at)::int  AS mo,
      COUNT(*)::int                        AS cnt,
      COALESCE(SUM(agreed_amount), 0)::float AS vol
    FROM transactions
    WHERE created_at >= NOW() - INTERVAL '6 months'
      AND status NOT IN ('offer_made', 'accepted', 'cancelled')
    GROUP BY yr, mo
  `);

  const volumeMap: Record<string, { transactions: number; escrow: number }> = {};
  for (const row of monthlyRows.rows as any[]) {
    volumeMap[`${row.yr}-${row.mo}`] = {
      transactions: row.cnt,
      escrow: row.vol / 1_000_000_000, // convert to billions
    };
  }

  const volumeData = months.map(({ label, year, month }) => ({
    m: label,
    transactions: volumeMap[`${year}-${month}`]?.transactions ?? 0,
    escrow: parseFloat((volumeMap[`${year}-${month}`]?.escrow ?? 0).toFixed(2)),
  }));

  // Total escrow value currently held
  const [escrowValue] = await db
    .select({ total: sql<string>`COALESCE(SUM(agreed_amount), 0)` })
    .from(transactionsTable)
    .where(sql`status IN ('escrow_opened','funds_deposited','verification_complete','disputed')`);

  const totalEscrowValue = parseFloat(escrowValue?.total ?? "0");

  return res.json({
    totalUsers,
    totalAgents,
    totalBuyers,
    totalListings,
    activeListings,
    totalTransactions,
    completedTransactions,
    pendingVerifications,
    totalEscrowValue,
    volumeData,
  });
});

export default router;

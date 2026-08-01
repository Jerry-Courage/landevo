import { Router } from "express";
import {
  db,
  verificationsTable,
  listingsTable,
  usersTable,
  transactionsTable,
  activityLogsTable,
} from "@workspace/db";
import { eq, sql, count, desc } from "drizzle-orm";
import { requireRole } from "../middleware/require-auth";

const router = Router();

// Status mapping helpers
function auditStatus(s: string): string {
  switch (s) {
    case "pending":   return "Awaiting Audit";
    case "in_review": return "Under Review";
    case "approved":  return "Approved";
    case "rejected":  return "Correction Required";
    default:          return s;
  }
}

// GET /api/commission/listings — verifications as listing audit view
router.get("/listings", requireRole("commission_admin"), async (req, res) => {
  const rows = await db
    .select({
      verificationId: verificationsTable.id,
      listingId:      listingsTable.id,
      name:           listingsTable.title,
      location:       sql<string>`COALESCE(NULLIF(${listingsTable.city} || ', ' || ${listingsTable.state}, ', '), ${listingsTable.location})`,
      agentId:        listingsTable.agentId,
      agentName:      sql<string>`agent.name`,
      propertyType:   listingsTable.propertyType,
      areaSqm:        listingsTable.areaSqm,
      price:          listingsTable.price,
      status:         verificationsTable.status,
      notes:          verificationsTable.notes,
      submittedAt:    verificationsTable.submittedAt,
      reviewedAt:     verificationsTable.reviewedAt,
      documents:      listingsTable.documents,
    })
    .from(verificationsTable)
    .innerJoin(listingsTable, eq(verificationsTable.listingId, listingsTable.id))
    .innerJoin(sql`users agent`, sql`agent.id = ${listingsTable.agentId}`)
    .orderBy(desc(verificationsTable.createdAt));

  const mapped = rows.map((r) => ({
    id: `LND-${r.listingId}`,
    verificationId: r.verificationId,
    listingId: r.listingId,
    name: r.name,
    location: r.location || "—",
    agent: r.agentName,
    agentId: `AGT-${r.agentId}`,
    type: r.propertyType ?? "Residential",
    size: r.areaSqm ? `${Number(r.areaSqm).toLocaleString()} sqm` : "—",
    value: parseFloat(r.price as string),
    submitted: r.submittedAt ? new Date(r.submittedAt).toLocaleDateString("en-GH", { month: "short", day: "numeric", year: "numeric" }) : "—",
    status: auditStatus(r.status),
    notes: r.notes ?? "",
    documents: (r.documents as { name: string; url: string; contentType: string }[] | null) ?? [],
  }));

  return res.json(mapped);
});

// GET /api/commission/audit — activity log filtered to commission-relevant actions
router.get("/audit", requireRole("commission_admin"), async (req, res) => {
  const rows = await db
    .select()
    .from(activityLogsTable)
    .orderBy(desc(activityLogsTable.createdAt))
    .limit(100);

  // Map kind → frontend type for commission audit
  const kindToType: Record<string, string> = {
    approve: "Approve",
    reject:  "Reject",
    flag:    "Flag",
    review:  "Review",
    system:  "System",
    release: "System",
    hold:    "System",
  };

  const mapped = rows.map((r) => ({
    id:        `ACT-${r.id}`,
    officer:   r.actorName,
    role:      r.actorRole,
    action:    r.action,
    target:    r.targetLabel,
    targetType: "listing",
    timestamp: new Date(r.createdAt).toLocaleDateString("en-GH", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    }),
    type:      kindToType[r.kind] ?? "System",
    ref:       r.note ?? "",
  }));

  return res.json(mapped);
});

export default router;

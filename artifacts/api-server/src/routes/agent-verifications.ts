import { Router } from "express";
import { db, agentVerificationsTable, usersTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth, requireRole } from "../middleware/require-auth";
import { createNotification, notifyCommissionAdmins } from "../lib/notify";
import { sseManager } from "../lib/sse";

const router = Router();

type Doc = { name: string; url: string; contentType: string };

function parseDocs(raw: string): Doc[] {
  try { return JSON.parse(raw) as Doc[]; } catch { return []; }
}

async function fetchAgentVerification(id: number) {
  const [row] = await db
    .select({
      id:                  agentVerificationsTable.id,
      agentId:             agentVerificationsTable.agentId,
      agentName:           sql<string>`agent.name`,
      agentEmail:          sql<string>`agent.email`,
      officerId:           agentVerificationsTable.officerId,
      officerName:         sql<string | null>`officer.name`,
      status:              agentVerificationsTable.status,
      governmentIdType:    agentVerificationsTable.governmentIdType,
      governmentIdNumber:  agentVerificationsTable.governmentIdNumber,
      licenseNumber:       agentVerificationsTable.licenseNumber,
      documents:           agentVerificationsTable.documents,
      notes:               agentVerificationsTable.notes,
      submittedAt:         agentVerificationsTable.submittedAt,
      reviewedAt:          agentVerificationsTable.reviewedAt,
      createdAt:           agentVerificationsTable.createdAt,
      agentIsVerified:     sql<boolean>`agent.is_verified`,
      agentJoinedAt:       sql<string>`agent.created_at`,
    })
    .from(agentVerificationsTable)
    .innerJoin(sql`users agent`, sql`agent.id = ${agentVerificationsTable.agentId}`)
    .leftJoin(sql`users officer`, sql`officer.id = ${agentVerificationsTable.officerId}`)
    .where(eq(agentVerificationsTable.id, id));

  if (!row) return null;
  return { ...row, documents: parseDocs(row.documents as unknown as string) };
}

// POST /api/agent-verifications — agent submits KYC
router.post("/", requireAuth, async (req, res) => {
  const role = req.session.userRole!;
  if (role !== "agent") {
    return res.status(403).json({ error: "Only agents can submit agent verifications" });
  }

  const { governmentIdType, governmentIdNumber, licenseNumber, documents } = req.body as {
    governmentIdType?: string;
    governmentIdNumber?: string;
    licenseNumber?: string;
    documents?: Doc[];
  };

  if (!governmentIdType || !governmentIdNumber) {
    return res.status(400).json({ error: "governmentIdType and governmentIdNumber are required" });
  }

  const agentId = req.session.userId!;

  // Check for an existing pending or in_review submission
  const [existing] = await db
    .select({ id: agentVerificationsTable.id, status: agentVerificationsTable.status })
    .from(agentVerificationsTable)
    .where(
      and(
        eq(agentVerificationsTable.agentId, agentId),
        sql`${agentVerificationsTable.status} IN ('pending','in_review')`,
      ),
    );

  if (existing) {
    return res.status(409).json({ error: "You already have a pending verification submission" });
  }

  const [inserted] = await db
    .insert(agentVerificationsTable)
    .values({
      agentId,
      governmentIdType,
      governmentIdNumber,
      licenseNumber: licenseNumber ?? null,
      documents: JSON.stringify(documents ?? []),
      status: "pending",
    })
    .returning({ id: agentVerificationsTable.id });

  await notifyCommissionAdmins({
    type: "system",
    title: "New agent verification submitted",
    body: "An agent has submitted identity documents for review.",
    relatedId: inserted.id,
  });

  return res.status(201).json({ id: inserted.id });
});

// GET /api/agent-verifications — commission sees all; agent sees own
router.get("/", requireAuth, async (req, res) => {
  const role = req.session.userRole!;
  const userId = req.session.userId!;

  if (role === "buyer") return res.json([]);

  const rows = await db
    .select({
      id:               agentVerificationsTable.id,
      agentId:          agentVerificationsTable.agentId,
      agentName:        sql<string>`agent.name`,
      agentEmail:       sql<string>`agent.email`,
      officerId:        agentVerificationsTable.officerId,
      officerName:      sql<string | null>`officer.name`,
      status:           agentVerificationsTable.status,
      governmentIdType: agentVerificationsTable.governmentIdType,
      notes:            agentVerificationsTable.notes,
      submittedAt:      agentVerificationsTable.submittedAt,
      reviewedAt:       agentVerificationsTable.reviewedAt,
      agentIsVerified:  sql<boolean>`agent.is_verified`,
    })
    .from(agentVerificationsTable)
    .innerJoin(sql`users agent`, sql`agent.id = ${agentVerificationsTable.agentId}`)
    .leftJoin(sql`users officer`, sql`officer.id = ${agentVerificationsTable.officerId}`)
    .where(role === "agent" ? eq(agentVerificationsTable.agentId, userId) : undefined)
    .orderBy(sql`${agentVerificationsTable.createdAt} DESC`);

  return res.json(rows);
});

// GET /api/agent-verifications/:id
router.get("/:id", requireAuth, async (req, res) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const role = req.session.userRole!;
  if (role === "buyer") return res.status(403).json({ error: "Access denied" });

  const v = await fetchAgentVerification(id);
  if (!v) return res.status(404).json({ error: "Agent verification not found" });

  if (role === "agent" && v.agentId !== req.session.userId!) {
    return res.status(403).json({ error: "Access denied" });
  }

  return res.json(v);
});

// PATCH /api/agent-verifications/:id/assign
router.patch("/:id/assign", requireRole("commission_admin"), async (req, res) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const [v] = await db
    .select({ id: agentVerificationsTable.id, status: agentVerificationsTable.status })
    .from(agentVerificationsTable)
    .where(eq(agentVerificationsTable.id, id));

  if (!v) return res.status(404).json({ error: "Not found" });
  if (!["pending", "in_review"].includes(v.status)) {
    return res.status(400).json({ error: "Verification already resolved" });
  }

  await db
    .update(agentVerificationsTable)
    .set({ status: "in_review", officerId: req.session.userId! })
    .where(eq(agentVerificationsTable.id, id));

  return res.json(await fetchAgentVerification(id));
});

// PATCH /api/agent-verifications/:id/approve
router.patch("/:id/approve", requireRole("commission_admin"), async (req, res) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const { notes } = req.body as { notes?: string };

  const [v] = await db
    .select({
      id:      agentVerificationsTable.id,
      agentId: agentVerificationsTable.agentId,
      status:  agentVerificationsTable.status,
    })
    .from(agentVerificationsTable)
    .where(eq(agentVerificationsTable.id, id));

  if (!v) return res.status(404).json({ error: "Not found" });
  if (!["pending", "in_review"].includes(v.status)) {
    return res.status(400).json({ error: "Verification already resolved" });
  }

  await db
    .update(agentVerificationsTable)
    .set({
      status:     "approved",
      officerId:  req.session.userId!,
      notes:      notes ?? null,
      reviewedAt: new Date(),
    })
    .where(eq(agentVerificationsTable.id, id));

  // Mark the agent as verified
  await db
    .update(usersTable)
    .set({ isVerified: true })
    .where(eq(usersTable.id, v.agentId));

  await createNotification({
    userId: v.agentId,
    type:   "system",
    title:  "Identity verified!",
    body:   "Your agent identity has been verified. A verified badge will now appear on your listings.",
    relatedId: id,
  });
  sseManager.sendToUser(v.agentId, { type: "notification", payload: null });

  return res.json(await fetchAgentVerification(id));
});

// PATCH /api/agent-verifications/:id/reject
router.patch("/:id/reject", requireRole("commission_admin"), async (req, res) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const { notes } = req.body as { notes?: string };
  if (!notes?.trim()) {
    return res.status(400).json({ error: "Rejection notes are required" });
  }

  const [v] = await db
    .select({
      id:      agentVerificationsTable.id,
      agentId: agentVerificationsTable.agentId,
      status:  agentVerificationsTable.status,
    })
    .from(agentVerificationsTable)
    .where(eq(agentVerificationsTable.id, id));

  if (!v) return res.status(404).json({ error: "Not found" });
  if (!["pending", "in_review"].includes(v.status)) {
    return res.status(400).json({ error: "Verification already resolved" });
  }

  await db
    .update(agentVerificationsTable)
    .set({
      status:     "rejected",
      officerId:  req.session.userId!,
      notes,
      reviewedAt: new Date(),
    })
    .where(eq(agentVerificationsTable.id, id));

  await createNotification({
    userId: v.agentId,
    type:   "system",
    title:  "Identity verification rejected",
    body:   `Your verification was not approved. Reason: ${notes}`,
    relatedId: id,
  });
  sseManager.sendToUser(v.agentId, { type: "notification", payload: null });

  return res.json(await fetchAgentVerification(id));
});

export default router;

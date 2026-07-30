import { Router } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, and, isNull, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/require-auth";

const router = Router();

// GET /api/notifications
router.get("/", requireAuth, async (req, res) => {
  const userId = req.session.userId!;
  const { unreadOnly } = req.query as { unreadOnly?: string };

  const conditions = [eq(notificationsTable.userId, userId)];
  if (unreadOnly === "true") {
    conditions.push(isNull(notificationsTable.readAt));
  }

  const rows = await db
    .select()
    .from(notificationsTable)
    .where(and(...conditions))
    .orderBy(sql`${notificationsTable.createdAt} DESC`);

  return res.json(rows);
});

// PATCH /api/notifications/:id/read
router.patch("/:id/read", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const [existing] = await db
    .select({ id: notificationsTable.id, userId: notificationsTable.userId })
    .from(notificationsTable)
    .where(
      and(
        eq(notificationsTable.id, id),
        eq(notificationsTable.userId, req.session.userId!),
      ),
    );

  if (!existing) return res.status(404).json({ error: "Notification not found" });

  await db
    .update(notificationsTable)
    .set({ readAt: new Date() })
    .where(eq(notificationsTable.id, id));

  const [updated] = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.id, id));

  return res.json(updated);
});

// POST /api/notifications/read-all
router.post("/read-all", requireAuth, async (req, res) => {
  await db
    .update(notificationsTable)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notificationsTable.userId, req.session.userId!),
        isNull(notificationsTable.readAt),
      ),
    );

  return res.json({ ok: true });
});

export default router;

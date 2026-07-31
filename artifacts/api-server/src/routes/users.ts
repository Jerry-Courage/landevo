import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, and, ne } from "drizzle-orm";
import { requireAuth } from "../middleware/require-auth";
import { logger } from "../lib/logger";

const router = Router();

// GET /api/users/me — full profile including notification preferences
router.get("/me", requireAuth, async (req, res) => {
  const [user] = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      name: usersTable.name,
      role: usersTable.role,
      isActive: usersTable.isActive,
      notificationPreferences: usersTable.notificationPreferences,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .where(eq(usersTable.id, req.session.userId!));

  if (!user) return res.status(404).json({ error: "User not found" });

  return res.json({ user });
});

// PATCH /api/users/me — update name and/or email
router.patch("/me", requireAuth, async (req, res) => {
  const { name, email } = req.body as { name?: string; email?: string };

  if (!name && !email) {
    return res.status(400).json({ error: "At least one field (name or email) is required" });
  }

  const updates: Partial<{ name: string; email: string }> = {};

  if (name !== undefined) {
    if (name.trim().length < 2) {
      return res.status(400).json({ error: "Name must be at least 2 characters" });
    }
    updates.name = name.trim();
  }

  if (email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    // Check email uniqueness (exclude current user)
    const [existing] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(and(eq(usersTable.email, email.toLowerCase()), ne(usersTable.id, req.session.userId!)));

    if (existing) {
      return res.status(409).json({ error: "This email is already in use" });
    }

    updates.email = email.toLowerCase();
  }

  const [updated] = await db
    .update(usersTable)
    .set(updates)
    .where(eq(usersTable.id, req.session.userId!))
    .returning({
      id: usersTable.id,
      email: usersTable.email,
      name: usersTable.name,
      role: usersTable.role,
      createdAt: usersTable.createdAt,
    });

  logger.info({ userId: req.session.userId }, "User profile updated");
  return res.json({ user: updated });
});

// PATCH /api/users/me/preferences — save notification preferences
router.patch("/me/preferences", requireAuth, async (req, res) => {
  const { preferences } = req.body as { preferences?: Record<string, boolean> };

  if (!preferences || typeof preferences !== "object" || Array.isArray(preferences)) {
    return res.status(400).json({ error: "preferences must be an object" });
  }

  // Only allow known keys
  const allowed = [
    "offer_received",
    "offer_accepted",
    "offer_rejected",
    "listing_verified",
    "listing_rejected",
    "transaction_update",
    "new_message",
    "system",
  ];
  const sanitized: Record<string, boolean> = {};
  for (const key of allowed) {
    if (key in preferences) {
      sanitized[key] = Boolean(preferences[key]);
    }
  }

  await db
    .update(usersTable)
    .set({ notificationPreferences: sanitized })
    .where(eq(usersTable.id, req.session.userId!));

  logger.info({ userId: req.session.userId }, "Notification preferences updated");
  return res.json({ ok: true, preferences: sanitized });
});

// PATCH /api/users/me/deactivate — deactivate account and end session
router.patch("/me/deactivate", requireAuth, async (req, res) => {
  await db
    .update(usersTable)
    .set({ isActive: false })
    .where(eq(usersTable.id, req.session.userId!));

  logger.info({ userId: req.session.userId }, "Account deactivated");

  req.session.destroy((err) => {
    if (err) logger.error({ err }, "Session destroy error on deactivation");
    res.clearCookie("sid");
    return res.json({ ok: true });
  });
});

export default router;

import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

// Session type augmentation
declare module "express-session" {
  interface SessionData {
    userId: number;
    userRole: "agent" | "buyer" | "commission_admin" | "system_admin";
    userName: string;
  }
}

const router = Router();

// GET /api/auth/me
router.get("/me", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const [user] = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      name: usersTable.name,
      role: usersTable.role,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .where(eq(usersTable.id, req.session.userId));

  if (!user) {
    req.session.destroy(() => {});
    return res.status(401).json({ error: "User not found" });
  }

  return res.json({ user });
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  };

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }
  if (!["agent", "buyer"].includes(role)) {
    return res.status(400).json({ error: "Role must be agent or buyer" });
  }

  const existing = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()));

  if (existing.length > 0) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [user] = await db
    .insert(usersTable)
    .values({ name, email: email.toLowerCase(), passwordHash, role: role as "agent" | "buyer" })
    .returning({
      id: usersTable.id,
      email: usersTable.email,
      name: usersTable.name,
      role: usersTable.role,
      createdAt: usersTable.createdAt,
    });

  req.session.userId = user.id;
  req.session.userRole = user.role;

  logger.info({ userId: user.id, role: user.role }, "User registered");
  return res.status(201).json({ user });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()));

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  if (!user.isActive) {
    return res.status(403).json({ error: "Your account has been suspended. Please contact support." });
  }

  req.session.userId = user.id;
  req.session.userRole = user.role;

  const { passwordHash: _pw, ...safeUser } = user;
  logger.info({ userId: user.id, role: user.role }, "User logged in");
  return res.json({ user: safeUser });
});

// POST /api/auth/change-password
router.post("/change-password", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { currentPassword, newPassword } = req.body as {
    currentPassword?: string;
    newPassword?: string;
  };

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "currentPassword and newPassword are required" });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 characters" });
  }

  const [user] = await db
    .select({ id: usersTable.id, passwordHash: usersTable.passwordHash })
    .from(usersTable)
    .where(eq(usersTable.id, req.session.userId));

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Current password is incorrect" });
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  await db
    .update(usersTable)
    .set({ passwordHash: newHash })
    .where(eq(usersTable.id, user.id));

  logger.info({ userId: user.id }, "Password changed");
  return res.json({ ok: true });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      logger.error({ err }, "Session destroy error");
      return res.status(500).json({ error: "Logout failed" });
    }
    res.clearCookie("sid");
    return res.json({ ok: true });
  });
});

export default router;

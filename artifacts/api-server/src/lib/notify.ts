import { db, notificationsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

type NotifType = typeof notificationsTable.$inferInsert["type"];

/** Create a notification for a single user. */
export async function createNotification({
  userId,
  type,
  title,
  body,
  relatedId,
}: {
  userId: number;
  type: NotifType;
  title: string;
  body: string;
  relatedId?: number;
}) {
  try {
    await db
      .insert(notificationsTable)
      .values({ userId, type, title, body, relatedId });
  } catch {
    // notifications are best-effort — never fail the main operation
  }
}

/** Notify all users with commission_admin role. */
export async function notifyCommissionAdmins({
  type,
  title,
  body,
  relatedId,
}: {
  type: NotifType;
  title: string;
  body: string;
  relatedId?: number;
}) {
  const admins = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.role, "commission_admin"));

  await Promise.all(
    admins.map((a) =>
      createNotification({ userId: a.id, type, title, body, relatedId }),
    ),
  );
}

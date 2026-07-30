import { Router } from "express";
import {
  db,
  messageThreadsTable,
  threadParticipantsTable,
  messagesTable,
  usersTable,
  listingsTable,
} from "@workspace/db";
import { eq, and, sql, inArray } from "drizzle-orm";
import { requireAuth } from "../middleware/require-auth";
import { createNotification } from "../lib/notify";

const router = Router();

async function buildThreadResponse(threadId: number, currentUserId: number) {
  const thread = await db
    .select({
      id: messageThreadsTable.id,
      listingId: messageThreadsTable.listingId,
      listingTitle: listingsTable.title,
      lastMessageAt: messageThreadsTable.lastMessageAt,
      createdAt: messageThreadsTable.createdAt,
    })
    .from(messageThreadsTable)
    .leftJoin(listingsTable, eq(messageThreadsTable.listingId, listingsTable.id))
    .where(eq(messageThreadsTable.id, threadId));

  if (!thread[0]) return null;

  const participantRows = await db
    .select({
      userId: threadParticipantsTable.userId,
      name: usersTable.name,
      role: usersTable.role,
      unreadCount: threadParticipantsTable.unreadCount,
    })
    .from(threadParticipantsTable)
    .innerJoin(usersTable, eq(threadParticipantsTable.userId, usersTable.id))
    .where(eq(threadParticipantsTable.threadId, threadId));

  const lastMessage = await db
    .select({ content: messagesTable.content })
    .from(messagesTable)
    .where(eq(messagesTable.threadId, threadId))
    .orderBy(sql`${messagesTable.createdAt} DESC`)
    .limit(1);

  const myParticipant = participantRows.find((p) => p.userId === currentUserId);

  return {
    id: thread[0].id,
    listingId: thread[0].listingId,
    listingTitle: thread[0].listingTitle ?? null,
    participants: participantRows.map((p) => ({
      id: p.userId,
      name: p.name,
      role: p.role,
    })),
    lastMessage: lastMessage[0]?.content ?? null,
    lastMessageAt: thread[0].lastMessageAt?.toISOString() ?? null,
    unreadCount: myParticipant?.unreadCount ?? 0,
    createdAt: thread[0].createdAt,
  };
}

// GET /api/threads
router.get("/threads", requireAuth, async (req, res) => {
  const userId = req.session.userId!;

  const myThreadIds = await db
    .select({ threadId: threadParticipantsTable.threadId })
    .from(threadParticipantsTable)
    .where(eq(threadParticipantsTable.userId, userId));

  if (myThreadIds.length === 0) return res.json([]);

  const ids = myThreadIds.map((r) => r.threadId);
  const threads = await Promise.all(ids.map((id) => buildThreadResponse(id, userId)));

  return res.json(threads.filter(Boolean).sort((a, b) => {
    const ta = a!.lastMessageAt ?? a!.createdAt.toISOString();
    const tb = b!.lastMessageAt ?? b!.createdAt.toISOString();
    return tb.localeCompare(ta);
  }));
});

// POST /api/threads
router.post("/threads", requireAuth, async (req, res) => {
  const { recipientId, listingId, initialMessage } = req.body as {
    recipientId?: number;
    listingId?: number;
    initialMessage?: string;
  };

  if (!recipientId || !initialMessage) {
    return res.status(400).json({ error: "recipientId and initialMessage are required" });
  }

  const senderId = req.session.userId!;
  if (senderId === recipientId) {
    return res.status(400).json({ error: "Cannot message yourself" });
  }

  const [thread] = await db
    .insert(messageThreadsTable)
    .values({ listingId: listingId ?? null, lastMessageAt: new Date() })
    .returning({ id: messageThreadsTable.id });

  await db.insert(threadParticipantsTable).values([
    { threadId: thread.id, userId: senderId, unreadCount: 0 },
    { threadId: thread.id, userId: recipientId, unreadCount: 1 },
  ]);

  await db.insert(messagesTable).values({
    threadId: thread.id,
    senderId,
    content: initialMessage,
  });

  await createNotification({
    userId: recipientId,
    type: "new_message",
    title: "New message",
    body: initialMessage.slice(0, 100),
    relatedId: thread.id,
  });

  const result = await buildThreadResponse(thread.id, senderId);
  return res.status(201).json(result);
});

// GET /api/threads/:id/messages
router.get("/threads/:threadId/messages", requireAuth, async (req, res) => {
  const threadId = parseInt(req.params.threadId);
  if (isNaN(threadId)) return res.status(400).json({ error: "Invalid ID" });
  const userId = req.session.userId!;

  // Verify participant
  const [participant] = await db
    .select()
    .from(threadParticipantsTable)
    .where(
      and(
        eq(threadParticipantsTable.threadId, threadId),
        eq(threadParticipantsTable.userId, userId),
      ),
    );
  if (!participant) return res.status(403).json({ error: "Not a participant" });

  const msgs = await db
    .select({
      id: messagesTable.id,
      threadId: messagesTable.threadId,
      senderId: messagesTable.senderId,
      senderName: usersTable.name,
      content: messagesTable.content,
      createdAt: messagesTable.createdAt,
      readAt: messagesTable.readAt,
    })
    .from(messagesTable)
    .innerJoin(usersTable, eq(messagesTable.senderId, usersTable.id))
    .where(eq(messagesTable.threadId, threadId))
    .orderBy(messagesTable.createdAt);

  // Reset unread count for this user
  await db
    .update(threadParticipantsTable)
    .set({ unreadCount: 0 })
    .where(
      and(
        eq(threadParticipantsTable.threadId, threadId),
        eq(threadParticipantsTable.userId, userId),
      ),
    );

  return res.json(msgs);
});

// POST /api/threads/:id/messages
router.post("/threads/:threadId/messages", requireAuth, async (req, res) => {
  const threadId = parseInt(req.params.threadId);
  if (isNaN(threadId)) return res.status(400).json({ error: "Invalid ID" });
  const userId = req.session.userId!;

  const [participant] = await db
    .select()
    .from(threadParticipantsTable)
    .where(
      and(
        eq(threadParticipantsTable.threadId, threadId),
        eq(threadParticipantsTable.userId, userId),
      ),
    );
  if (!participant) return res.status(403).json({ error: "Not a participant" });

  const { content } = req.body as { content?: string };
  if (!content?.trim()) return res.status(400).json({ error: "content is required" });

  const [msg] = await db
    .insert(messagesTable)
    .values({ threadId, senderId: userId, content })
    .returning({ id: messagesTable.id });

  await db
    .update(messageThreadsTable)
    .set({ lastMessageAt: new Date() })
    .where(eq(messageThreadsTable.id, threadId));

  // Increment unread for other participants
  const others = await db
    .select({ userId: threadParticipantsTable.userId })
    .from(threadParticipantsTable)
    .where(
      and(
        eq(threadParticipantsTable.threadId, threadId),
        sql`${threadParticipantsTable.userId} != ${userId}`,
      ),
    );

  for (const other of others) {
    await db
      .update(threadParticipantsTable)
      .set({ unreadCount: sql`${threadParticipantsTable.unreadCount} + 1` })
      .where(
        and(
          eq(threadParticipantsTable.threadId, threadId),
          eq(threadParticipantsTable.userId, other.userId),
        ),
      );

    await createNotification({
      userId: other.userId,
      type: "new_message",
      title: "New message",
      body: content.slice(0, 100),
      relatedId: threadId,
    });
  }

  const [full] = await db
    .select({
      id: messagesTable.id,
      threadId: messagesTable.threadId,
      senderId: messagesTable.senderId,
      senderName: usersTable.name,
      content: messagesTable.content,
      createdAt: messagesTable.createdAt,
      readAt: messagesTable.readAt,
    })
    .from(messagesTable)
    .innerJoin(usersTable, eq(messagesTable.senderId, usersTable.id))
    .where(eq(messagesTable.id, msg.id));

  return res.status(201).json(full);
});

export default router;

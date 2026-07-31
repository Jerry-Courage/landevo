import { Router } from "express";
import { sseManager } from "../lib/sse";
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

/** Build a single thread response (used after create/message operations). */
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
// Fetches all threads in 4 batched queries instead of 3 queries × N threads.
router.get("/threads", requireAuth, async (req, res) => {
  const userId = req.session.userId!;

  const myParticipations = await db
    .select({ threadId: threadParticipantsTable.threadId, unreadCount: threadParticipantsTable.unreadCount })
    .from(threadParticipantsTable)
    .where(eq(threadParticipantsTable.userId, userId));

  if (myParticipations.length === 0) return res.json([]);

  const ids = myParticipations.map((r) => r.threadId);
  const unreadByThread = new Map(myParticipations.map((r) => [r.threadId, r.unreadCount]));

  // Batch 1: thread metadata + listing titles
  const threads = await db
    .select({
      id: messageThreadsTable.id,
      listingId: messageThreadsTable.listingId,
      listingTitle: listingsTable.title,
      lastMessageAt: messageThreadsTable.lastMessageAt,
      createdAt: messageThreadsTable.createdAt,
    })
    .from(messageThreadsTable)
    .leftJoin(listingsTable, eq(messageThreadsTable.listingId, listingsTable.id))
    .where(inArray(messageThreadsTable.id, ids));

  // Batch 2: all participants for all threads
  const allParticipants = await db
    .select({
      threadId: threadParticipantsTable.threadId,
      userId: threadParticipantsTable.userId,
      name: usersTable.name,
      role: usersTable.role,
    })
    .from(threadParticipantsTable)
    .innerJoin(usersTable, eq(threadParticipantsTable.userId, usersTable.id))
    .where(inArray(threadParticipantsTable.threadId, ids));

  // Batch 3: last message per thread via a single query
  const lastMessages = await db
    .select({
      threadId: messagesTable.threadId,
      content: messagesTable.content,
      createdAt: messagesTable.createdAt,
    })
    .from(messagesTable)
    .where(
      sql`(${messagesTable.threadId}, ${messagesTable.createdAt}) IN (
        SELECT thread_id, MAX(created_at) FROM messages
        WHERE thread_id = ANY(${sql.raw(`ARRAY[${ids.join(",")}]`)})
        GROUP BY thread_id
      )`,
    );

  // Build lookup maps
  const participantsByThread = new Map<number, typeof allParticipants>();
  for (const p of allParticipants) {
    if (!participantsByThread.has(p.threadId)) participantsByThread.set(p.threadId, []);
    participantsByThread.get(p.threadId)!.push(p);
  }
  const lastMessageByThread = new Map(lastMessages.map((m) => [m.threadId, m.content]));

  const result = threads.map((t) => ({
    id: t.id,
    listingId: t.listingId,
    listingTitle: t.listingTitle ?? null,
    participants: (participantsByThread.get(t.id) ?? []).map((p) => ({
      id: p.userId,
      name: p.name,
      role: p.role,
    })),
    lastMessage: lastMessageByThread.get(t.id) ?? null,
    lastMessageAt: t.lastMessageAt?.toISOString() ?? null,
    unreadCount: unreadByThread.get(t.id) ?? 0,
    createdAt: t.createdAt,
  }));

  result.sort((a, b) => {
    const ta = a.lastMessageAt ?? a.createdAt.toISOString();
    const tb = b.lastMessageAt ?? b.createdAt.toISOString();
    return tb.localeCompare(ta);
  });

  return res.json(result);
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

  // Return the existing thread if one already exists between these two users
  // for the same listing (or both without a listing), to prevent duplicates.
  const existing = await db
    .select({ threadId: threadParticipantsTable.threadId })
    .from(threadParticipantsTable)
    .innerJoin(
      messageThreadsTable,
      eq(threadParticipantsTable.threadId, messageThreadsTable.id),
    )
    .where(
      and(
        eq(threadParticipantsTable.userId, senderId),
        listingId
          ? eq(messageThreadsTable.listingId, listingId)
          : sql`${messageThreadsTable.listingId} IS NULL`,
        sql`EXISTS (
          SELECT 1 FROM thread_participants tp2
          WHERE tp2.thread_id = ${threadParticipantsTable.threadId}
            AND tp2.user_id = ${recipientId}
        )`,
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    const result = await buildThreadResponse(existing[0].threadId, senderId);
    return res.status(200).json(result);
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
  const threadId = parseInt(String(req.params.threadId));
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
  const threadId = parseInt(String(req.params.threadId));
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
    sseManager.sendToUser(other.userId, { type: "message_sent", payload: { threadId, senderId: userId } });
    sseManager.sendToUser(other.userId, { type: "notification", payload: null });
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

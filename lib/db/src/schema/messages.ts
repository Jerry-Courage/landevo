import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { listingsTable } from "./listings";

export const messageThreadsTable = pgTable("message_threads", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").references(() => listingsTable.id),
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const threadParticipantsTable = pgTable(
  "thread_participants",
  {
    threadId: integer("thread_id")
      .notNull()
      .references(() => messageThreadsTable.id),
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id),
    unreadCount: integer("unread_count").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.threadId, t.userId] })],
);

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  threadId: integer("thread_id")
    .notNull()
    .references(() => messageThreadsTable.id),
  senderId: integer("sender_id")
    .notNull()
    .references(() => usersTable.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  readAt: timestamp("read_at"),
});

export type MessageThread = typeof messageThreadsTable.$inferSelect;
export type Message = typeof messagesTable.$inferSelect;

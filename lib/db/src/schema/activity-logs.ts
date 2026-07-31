import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const activityLogsTable = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  actorId: integer("actor_id").references(() => usersTable.id),
  actorName: text("actor_name").notNull().default("System"),
  actorRole: text("actor_role").notNull().default("Automated"),
  action: text("action").notNull(),
  // 'Escrow' | 'Agent' | 'Listing' | 'User' | 'System'
  targetType: text("target_type").notNull(),
  targetLabel: text("target_label").notNull(),
  // 'release' | 'approve' | 'reject' | 'flag' | 'hold' | 'system'
  kind: text("kind").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type ActivityLog = typeof activityLogsTable.$inferSelect;
export type InsertActivityLog = typeof activityLogsTable.$inferInsert;

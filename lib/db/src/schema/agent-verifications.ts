import { pgTable, serial, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const agentVerificationStatusEnum = pgEnum("agent_verification_status", [
  "pending",
  "in_review",
  "approved",
  "rejected",
]);

export const agentVerificationsTable = pgTable("agent_verifications", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id")
    .notNull()
    .references(() => usersTable.id),
  officerId: integer("officer_id").references(() => usersTable.id),
  status: agentVerificationStatusEnum("status").notNull().default("pending"),
  governmentIdType: text("government_id_type").notNull(),
  governmentIdNumber: text("government_id_number").notNull(),
  licenseNumber: text("license_number"),
  /** JSON array of { name, url, contentType } */
  documents: text("documents").notNull().default("[]"),
  notes: text("notes"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type AgentVerification = typeof agentVerificationsTable.$inferSelect;
export type InsertAgentVerification = typeof agentVerificationsTable.$inferInsert;

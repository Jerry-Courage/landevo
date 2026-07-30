import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { listingsTable } from "./listings";

export const verificationStatusEnum = pgEnum("verification_status", [
  "pending",
  "in_review",
  "approved",
  "rejected",
]);

export const verificationsTable = pgTable("verifications", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id")
    .notNull()
    .references(() => listingsTable.id),
  officerId: integer("officer_id").references(() => usersTable.id),
  status: verificationStatusEnum("status").notNull().default("pending"),
  notes: text("notes"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Verification = typeof verificationsTable.$inferSelect;
export type InsertVerification = typeof verificationsTable.$inferInsert;

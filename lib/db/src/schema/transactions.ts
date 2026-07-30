import {
  pgTable,
  serial,
  integer,
  text,
  numeric,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { listingsTable } from "./listings";
import { offersTable } from "./offers";

export const transactionStatusEnum = pgEnum("transaction_status", [
  "offer_made",
  "accepted",
  "escrow_opened",
  "funds_deposited",
  "verification_complete",
  "completed",
  "cancelled",
]);

export const transactionsTable = pgTable("transactions", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id")
    .notNull()
    .references(() => listingsTable.id),
  buyerId: integer("buyer_id")
    .notNull()
    .references(() => usersTable.id),
  agentId: integer("agent_id")
    .notNull()
    .references(() => usersTable.id),
  offerId: integer("offer_id")
    .notNull()
    .references(() => offersTable.id),
  offerAmount: numeric("offer_amount", { precision: 14, scale: 2 }).notNull(),
  agreedAmount: numeric("agreed_amount", { precision: 14, scale: 2 }).notNull(),
  status: transactionStatusEnum("status").notNull().default("offer_made"),
  escrowReference: text("escrow_reference"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Transaction = typeof transactionsTable.$inferSelect;
export type InsertTransaction = typeof transactionsTable.$inferInsert;

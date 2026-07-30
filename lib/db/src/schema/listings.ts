import {
  pgTable,
  serial,
  integer,
  text,
  numeric,
  timestamp,
  json,
  pgEnum,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const propertyTypeEnum = pgEnum("property_type", [
  "land",
  "residential",
  "commercial",
  "apartment",
]);

export const listingStatusEnum = pgEnum("listing_status", [
  "draft",
  "pending_verification",
  "verified",
  "active",
  "under_offer",
  "sold",
]);

export const listingsTable = pgTable("listings", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id")
    .notNull()
    .references(() => usersTable.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 14, scale: 2 }).notNull(),
  location: text("location").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  areaSqm: numeric("area_sqm", { precision: 10, scale: 2 }).notNull(),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  propertyType: propertyTypeEnum("property_type").notNull(),
  status: listingStatusEnum("status").notNull().default("draft"),
  images: json("images").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Listing = typeof listingsTable.$inferSelect;
export type InsertListing = typeof listingsTable.$inferInsert;

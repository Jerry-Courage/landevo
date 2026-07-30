import { pgTable, varchar, json, timestamp, index } from "drizzle-orm/pg-core";

// Session table managed by connect-pg-simple.
// Defining it here lets drizzle-kit track it so `db push` stays idempotent.
export const sessionTable = pgTable(
  "session",
  {
    sid: varchar("sid").primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire", { precision: 6 }).notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

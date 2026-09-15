import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  real,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { pgTable } from "@/db/utils";

import { generateId } from "@/lib/id";

export const clients = pgTable(
  "clients",
  {
    id: varchar("id", { length: 30 })
      .$defaultFn(() => generateId())
      .primaryKey(),
    userId: varchar("user_id", { length: 128 }).notNull(),
    dogName: varchar("dog_name", { length: 128 }).notNull(),
    ownerName: varchar("owner_name", { length: 128 }),
    contactEmail: varchar("contact_email", { length: 256 }),
    contactPhone: varchar("contact_phone", { length: 32 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .default(sql`current_timestamp`)
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdIdx: index("clients_user_id_idx").on(table.userId),
  }),
);

export const bookings = pgTable(
  "bookings",
  {
    id: varchar("id", { length: 30 })
      .$defaultFn(() => generateId())
      .primaryKey(),
    userId: varchar("user_id", { length: 128 }).notNull(),
    clientId: varchar("client_id", { length: 30 })
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    serviceType: varchar("service_type", {
      length: 30,
      enum: ["daycare", "overnight"],
    }).notNull(),
    startAt: timestamp("start_at").notNull(),
    endAt: timestamp("end_at").notNull(),
    nights: integer("nights"),
    calendarDays: integer("calendar_days"),
    careHours: real("care_hours"),
    revenue: real("revenue").notNull(),
    notes: text("notes"),
    status: varchar("status", {
      length: 30,
      enum: ["scheduled", "completed", "cancelled"],
    })
      .notNull()
      .default("completed"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .default(sql`current_timestamp`)
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    clientIdIdx: index("bookings_client_id_idx").on(table.clientId),
    startAtIdx: index("bookings_start_at_idx").on(table.startAt),
    userIdIdx: index("bookings_user_id_idx").on(table.userId),
    userIdClientIdIdx: index("bookings_user_id_client_id_idx").on(
      table.userId,
      table.clientId,
    ),
  }),
);

export const settings = pgTable("settings", {
  userId: varchar("user_id", { length: 128 }).primaryKey(),
  monthlyIncomeGoal: real("monthly_income_goal").notNull().default(0),
  monthlyExpenses: real("monthly_expenses").notNull().default(0),
  moveOutSavingsTarget: real("move_out_savings_target").notNull().default(0),
  updatedAt: timestamp("updated_at")
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date()),
});

export const clientsRelations = relations(clients, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  client: one(clients, {
    fields: [bookings.clientId],
    references: [clients.id],
  }),
}));

export const tasks = pgTable("tasks", {
  id: varchar("id", { length: 30 })
    .$defaultFn(() => generateId())
    .primaryKey(),
  code: varchar("code", { length: 128 }).notNull().unique(),
  title: varchar("title", { length: 128 }),
  status: varchar("status", {
    length: 30,
    enum: ["todo", "in-progress", "done", "canceled"],
  })
    .notNull()
    .default("todo"),
  label: varchar("label", {
    length: 30,
    enum: ["bug", "feature", "enhancement", "documentation"],
  })
    .notNull()
    .default("bug"),
  priority: varchar("priority", {
    length: 30,
    enum: ["low", "medium", "high"],
  })
    .notNull()
    .default("low"),
  estimatedHours: real("estimated_hours").notNull().default(0),
  archived: boolean("archived").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date()),
});

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type Settings = typeof settings.$inferSelect;
export type NewSettings = typeof settings.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

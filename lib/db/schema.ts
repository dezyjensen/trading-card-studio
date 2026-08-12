import { relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type { CardState } from "@/lib/themes";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    username: text("username").notNull(),
    displayName: text("display_name").notNull(),
    passwordHash: text("password_hash").notNull(),
    activeCardId: uuid("active_card_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("users_username_idx").on(table.username)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("sessions_user_id_idx").on(table.userId)],
);

export const cards = pgTable(
  "cards",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    /** Stable collection number per user (001, 002, …). Never reused. */
    collectorNumber: integer("collector_number").notNull(),
    state: jsonb("state").$type<CardState>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("cards_user_id_idx").on(table.userId),
    index("cards_user_updated_idx").on(table.userId, table.updatedAt),
    uniqueIndex("cards_user_collector_number_idx").on(
      table.userId,
      table.collectorNumber,
    ),
  ],
);

export const binderItems = pgTable(
  "binder_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    cardId: uuid("card_id")
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
  },
  (table) => [
    uniqueIndex("binder_user_card_idx").on(table.userId, table.cardId),
    index("binder_user_position_idx").on(table.userId, table.position),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  cards: many(cards),
  binderItems: many(binderItems),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const cardsRelations = relations(cards, ({ one }) => ({
  user: one(users, {
    fields: [cards.userId],
    references: [users.id],
  }),
}));

export const binderItemsRelations = relations(binderItems, ({ one }) => ({
  user: one(users, {
    fields: [binderItems.userId],
    references: [users.id],
  }),
  card: one(cards, {
    fields: [binderItems.cardId],
    references: [cards.id],
  }),
}));

export type DbUser = typeof users.$inferSelect;
export type DbCard = typeof cards.$inferSelect;

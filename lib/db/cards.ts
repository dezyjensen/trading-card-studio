import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { binderItems, cards, users } from "@/lib/db/schema";
import type { CardState } from "@/lib/themes";

export type SavedCardRow = {
  id: string;
  name: string;
  collectorNumber: number;
  updatedAt: string;
  state: CardState;
};

async function nextCollectorNumber(userId: string): Promise<number> {
  const rows = await db
    .select({
      max: sql<number>`coalesce(max(${cards.collectorNumber}), 0)`,
    })
    .from(cards)
    .where(eq(cards.userId, userId));
  return Number(rows[0]?.max ?? 0) + 1;
}

function toSavedCard(row: typeof cards.$inferSelect): SavedCardRow {
  const collectorNumber = row.collectorNumber;
  return {
    id: row.id,
    name: row.name,
    collectorNumber,
    updatedAt: row.updatedAt.toISOString(),
    state: {
      ...row.state,
      collectorNumber,
    },
  };
}

export async function listCardsForUser(userId: string): Promise<SavedCardRow[]> {
  const rows = await db
    .select()
    .from(cards)
    .where(eq(cards.userId, userId))
    .orderBy(asc(cards.collectorNumber));
  return rows.map(toSavedCard);
}

export async function getCardForUser(userId: string, cardId: string) {
  const row = await db.query.cards.findFirst({
    where: and(eq(cards.id, cardId), eq(cards.userId, userId)),
  });
  return row ? toSavedCard(row) : null;
}

export async function getActiveCardForUser(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  if (!user?.activeCardId) return null;
  return getCardForUser(userId, user.activeCardId);
}

export async function upsertCard(input: {
  userId: string;
  state: CardState;
  existingId?: string | null;
}) {
  const name = input.state.name.trim() || "Untitled card";
  const now = new Date();

  if (input.existingId) {
    const existing = await db.query.cards.findFirst({
      where: and(
        eq(cards.id, input.existingId),
        eq(cards.userId, input.userId),
      ),
    });
    if (existing) {
      const collectorNumber = existing.collectorNumber;
      const state: CardState = {
        ...input.state,
        collectorNumber,
      };
      const [row] = await db
        .update(cards)
        .set({
          name,
          state,
          updatedAt: now,
        })
        .where(
          and(eq(cards.id, input.existingId), eq(cards.userId, input.userId)),
        )
        .returning();

      await db
        .update(users)
        .set({ activeCardId: row.id, updatedAt: now })
        .where(eq(users.id, input.userId));

      return toSavedCard(row);
    }
  }

  const collectorNumber = await nextCollectorNumber(input.userId);
  const state: CardState = {
    ...input.state,
    collectorNumber,
  };

  const [row] = await db
    .insert(cards)
    .values({
      userId: input.userId,
      name,
      collectorNumber,
      state,
    })
    .returning();

  const maxPos = await db
    .select({
      max: sql<number>`coalesce(max(${binderItems.position}), -1)`,
    })
    .from(binderItems)
    .where(eq(binderItems.userId, input.userId));

  await db.insert(binderItems).values({
    userId: input.userId,
    cardId: row.id,
    position: (maxPos[0]?.max ?? -1) + 1,
  });

  await db
    .update(users)
    .set({ activeCardId: row.id, updatedAt: now })
    .where(eq(users.id, input.userId));

  return toSavedCard(row);
}

export async function deleteCardForUser(userId: string, cardId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  await db
    .delete(cards)
    .where(and(eq(cards.id, cardId), eq(cards.userId, userId)));

  if (user?.activeCardId === cardId) {
    const next = await db
      .select({ id: cards.id })
      .from(cards)
      .where(eq(cards.userId, userId))
      .orderBy(desc(cards.updatedAt))
      .limit(1);

    await db
      .update(users)
      .set({ activeCardId: next[0]?.id ?? null, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }
}

export async function setActiveCardForUser(userId: string, cardId: string) {
  const card = await getCardForUser(userId, cardId);
  if (!card) return false;
  await db
    .update(users)
    .set({ activeCardId: cardId, updatedAt: new Date() })
    .where(eq(users.id, userId));
  return true;
}

export async function getBinderOrder(userId: string): Promise<string[]> {
  const rows = await db
    .select({ cardId: binderItems.cardId })
    .from(binderItems)
    .where(eq(binderItems.userId, userId))
    .orderBy(asc(binderItems.position));
  return rows.map((r) => r.cardId);
}

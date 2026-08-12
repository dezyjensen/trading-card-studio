import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getBinderOrder } from "@/lib/db/cards";
import { binderItems, cards } from "@/lib/db/schema";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const order = await getBinderOrder(user.id);
  return NextResponse.json({ order });
}

export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { order?: string[] };
    const order = Array.isArray(body.order) ? body.order : null;
    if (!order) {
      return NextResponse.json({ error: "order array is required" }, { status: 400 });
    }

    const owned = await db
      .select({ id: cards.id })
      .from(cards)
      .where(eq(cards.userId, user.id));
    const ownedIds = new Set(owned.map((c) => c.id));
    const cleaned = order.filter((id) => ownedIds.has(id));
    for (const id of ownedIds) {
      if (!cleaned.includes(id)) cleaned.push(id);
    }

    await db.delete(binderItems).where(eq(binderItems.userId, user.id));

    if (cleaned.length > 0) {
      await db.insert(binderItems).values(
        cleaned.map((cardId, position) => ({
          userId: user.id,
          cardId,
          position,
        })),
      );
    }

    return NextResponse.json({ order: cleaned });
  } catch (error) {
    console.error("binder update failed", error);
    return NextResponse.json(
      { error: "Could not update binder" },
      { status: 500 },
    );
  }
}

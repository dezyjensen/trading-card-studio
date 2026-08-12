import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import {
  listCardsForUser,
  upsertCard,
} from "@/lib/db/cards";
import type { CardState } from "@/lib/themes";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const cards = await listCardsForUser(user.id);
  return NextResponse.json({ cards });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      state?: CardState;
      id?: string | null;
    };

    if (!body.state || typeof body.state !== "object") {
      return NextResponse.json({ error: "Card state is required" }, { status: 400 });
    }

    const card = await upsertCard({
      userId: user.id,
      state: body.state,
      existingId: body.id,
    });

    return NextResponse.json({ card });
  } catch (error) {
    console.error("save card failed", error);
    return NextResponse.json({ error: "Could not save card" }, { status: 500 });
  }
}

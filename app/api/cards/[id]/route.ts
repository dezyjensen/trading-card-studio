import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import {
  deleteCardForUser,
  getActiveCardForUser,
  getCardForUser,
  setActiveCardForUser,
} from "@/lib/db/cards";

type Params = { params: Promise<{ id: string }> };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(id: string) {
  return UUID_RE.test(id);
}

export async function GET(_request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { id } = await params;

  // Turbopack can route /api/cards/active into [id]; handle it here too.
  if (id === "active") {
    try {
      const card = await getActiveCardForUser(user.id);
      return NextResponse.json({ card });
    } catch (error) {
      console.error("active card failed", error);
      return NextResponse.json(
        { error: "Could not load active card" },
        { status: 500 },
      );
    }
  }

  if (!isUuid(id)) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const card = await getCardForUser(user.id, id);
  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }
  return NextResponse.json({ card });
}

export async function DELETE(_request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { id } = await params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  await deleteCardForUser(user.id, id);
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { id } = await params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const body = (await request.json()) as { active?: boolean };

  if (body.active) {
    const ok = await setActiveCardForUser(user.id, id);
    if (!ok) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }
  }

  return NextResponse.json({ ok: true });
}

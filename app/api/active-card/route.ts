import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getActiveCardForUser } from "@/lib/db/cards";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

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

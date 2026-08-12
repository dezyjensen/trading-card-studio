import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth/session";

export async function POST() {
  try {
    await destroySession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("logout failed", error);
    return NextResponse.json({ error: "Could not sign out" }, { status: 500 });
  }
}

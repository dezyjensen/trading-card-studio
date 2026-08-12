import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import {
  hashPassword,
  normalizeUsername,
  validatePassword,
} from "@/lib/auth/password";
import { createSession, toSessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      username?: string;
      displayName?: string;
      password?: string;
    };

    const username = normalizeUsername(body.username ?? "");
    const displayName = (body.displayName ?? "").trim();
    const password = body.password ?? "";

    if (username.length < 3) {
      return NextResponse.json(
        { error: "Username needs at least 3 letters or numbers" },
        { status: 400 },
      );
    }
    if (displayName.length < 2) {
      return NextResponse.json(
        { error: "Display name needs at least 2 characters" },
        { status: 400 },
      );
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const existing = await db.query.users.findFirst({
      where: eq(users.username, username),
    });
    if (existing) {
      return NextResponse.json(
        { error: "That username is already taken" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const [user] = await db
      .insert(users)
      .values({ username, displayName, passwordHash })
      .returning();

    await createSession(user.id);

    return NextResponse.json({ user: toSessionUser(user) });
  } catch (error) {
    console.error("register failed", error);
    return NextResponse.json(
      { error: "Could not create account. Is the database running?" },
      { status: 500 },
    );
  }
}

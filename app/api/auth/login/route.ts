import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { normalizeUsername, verifyPassword } from "@/lib/auth/password";
import { createSession, toSessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      username?: string;
      password?: string;
    };

    const username = normalizeUsername(body.username ?? "");
    const password = body.password ?? "";

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 },
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 },
      );
    }

    await createSession(user.id);
    return NextResponse.json({ user: toSessionUser(user) });
  } catch (error) {
    console.error("login failed", error);
    return NextResponse.json(
      { error: "Could not sign in. Is the database running?" },
      { status: 500 },
    );
  }
}

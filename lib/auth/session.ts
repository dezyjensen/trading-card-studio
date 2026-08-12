import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { sessions, users, type DbUser } from "@/lib/db/schema";

const SESSION_COOKIE = "tcs_session";
const SESSION_DAYS = 30;

function authSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "AUTH_SECRET must be set to a long random string (see .env.example).",
    );
  }
  return secret;
}

function newSessionId() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Buffer.from(bytes).toString("base64url");
}

export type SessionUser = {
  id: string;
  username: string;
  displayName: string;
};

export function toSessionUser(user: DbUser): SessionUser {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
  };
}

export async function createSession(userId: string) {
  authSecret();
  const id = newSessionId();
  const expiresAt = new Date(
    Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
  );

  await db.insert(sessions).values({ id, userId, expiresAt });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });

  return id;
}

export async function destroySession() {
  const jar = await cookies();
  const id = jar.get(SESSION_COOKIE)?.value;
  if (id) {
    await db.delete(sessions).where(eq(sessions.id, id));
    jar.delete(SESSION_COOKIE);
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const id = jar.get(SESSION_COOKIE)?.value;
  if (!id) return null;

  const row = await db.query.sessions.findFirst({
    where: eq(sessions.id, id),
    with: { user: true },
  });

  if (!row) {
    jar.delete(SESSION_COOKIE);
    return null;
  }

  if (row.expiresAt.getTime() < Date.now()) {
    await db.delete(sessions).where(eq(sessions.id, id));
    jar.delete(SESSION_COOKIE);
    return null;
  }

  return toSessionUser(row.user);
}

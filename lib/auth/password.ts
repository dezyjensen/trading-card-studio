import bcrypt from "bcryptjs";

const ROUNDS = 12;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, ROUNDS);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "Password needs at least 8 characters";
  }
  if (password.length > 128) {
    return "Password is too long";
  }
  return null;
}

export function normalizeUsername(raw: string) {
  return raw.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
}

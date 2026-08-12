export type UserProfile = {
  id: string;
  username: string;
  displayName: string;
  createdAt: string;
};

const USERS_KEY = "tcs-users";
const CURRENT_USER_KEY = "tcs-current-user";

function readUsers(): UserProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UserProfile[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeUsers(users: UserProfile[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function listUsers(): UserProfile[] {
  return readUsers().sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export function getCurrentUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const id = localStorage.getItem(CURRENT_USER_KEY);
  if (!id) return null;
  return readUsers().find((u) => u.id === id) ?? null;
}

export function setCurrentUser(id: string | null) {
  if (id) localStorage.setItem(CURRENT_USER_KEY, id);
  else localStorage.removeItem(CURRENT_USER_KEY);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("tcs-user-changed"));
  }
}

export function createUser(input: {
  username: string;
  displayName: string;
}): { ok: true; user: UserProfile } | { ok: false; error: string } {
  const username = input.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
  const displayName = input.displayName.trim();

  if (username.length < 3) {
    return { ok: false, error: "Username needs at least 3 letters or numbers" };
  }
  if (displayName.length < 2) {
    return { ok: false, error: "Display name needs at least 2 characters" };
  }

  const users = readUsers();
  if (users.some((u) => u.username === username)) {
    return { ok: false, error: "That username is already taken on this device" };
  }

  const user: UserProfile = {
    id: crypto.randomUUID(),
    username,
    displayName,
    createdAt: new Date().toISOString(),
  };
  writeUsers([...users, user]);
  setCurrentUser(user.id);
  return { ok: true, user };
}

export function deleteUser(id: string) {
  const users = readUsers().filter((u) => u.id !== id);
  writeUsers(users);
  if (localStorage.getItem(CURRENT_USER_KEY) === id) {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

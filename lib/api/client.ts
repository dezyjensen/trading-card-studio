import type { CardState } from "@/lib/themes";

export type ApiUser = {
  id: string;
  username: string;
  displayName: string;
};

export type ApiSavedCard = {
  id: string;
  name: string;
  collectorNumber: number;
  updatedAt: string;
  state: CardState;
};

async function parseJson<T>(res: Response): Promise<T> {
  let data: T & { error?: string };
  try {
    data = (await res.json()) as T & { error?: string };
  } catch {
    throw new Error(
      res.status === 401
        ? "Sign in required"
        : `Request failed (${res.status})`,
    );
  }
  if (!res.ok) {
    throw new Error(
      data.error ||
        (res.status === 401
          ? "Sign in required"
          : `Request failed (${res.status})`),
    );
  }
  return data;
}

export async function fetchMe(): Promise<ApiUser | null> {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  const data = await parseJson<{ user: ApiUser | null }>(res);
  return data.user;
}

export async function registerAccount(input: {
  username: string;
  displayName: string;
  password: string;
}): Promise<ApiUser> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await parseJson<{ user: ApiUser }>(res);
  return data.user;
}

export async function loginAccount(input: {
  username: string;
  password: string;
}): Promise<ApiUser> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await parseJson<{ user: ApiUser }>(res);
  return data.user;
}

export async function logoutAccount(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}

export async function listRemoteCards(): Promise<ApiSavedCard[]> {
  const res = await fetch("/api/cards", { credentials: "include" });
  const data = await parseJson<{ cards: ApiSavedCard[] }>(res);
  return data.cards;
}

export async function fetchActiveCard(): Promise<ApiSavedCard | null> {
  // Dedicated path — avoids Next/Turbopack routing /api/cards/active into [id]
  const res = await fetch("/api/active-card", { credentials: "include" });
  const data = await parseJson<{ card: ApiSavedCard | null }>(res);
  return data.card;
}

export async function saveRemoteCard(
  state: CardState,
  id?: string | null,
): Promise<ApiSavedCard> {
  const res = await fetch("/api/cards", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state, id: id ?? null }),
  });
  const data = await parseJson<{ card: ApiSavedCard }>(res);
  return data.card;
}

export async function deleteRemoteCard(id: string): Promise<void> {
  const res = await fetch(`/api/cards/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  await parseJson<{ ok: boolean }>(res);
}

export async function setActiveRemoteCard(id: string): Promise<void> {
  const res = await fetch(`/api/cards/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ active: true }),
  });
  await parseJson<{ ok: boolean }>(res);
}

export async function fetchRemoteCard(id: string): Promise<ApiSavedCard> {
  const res = await fetch(`/api/cards/${id}`, { credentials: "include" });
  const data = await parseJson<{ card: ApiSavedCard }>(res);
  return data.card;
}

export async function fetchBinderOrder(): Promise<string[]> {
  const res = await fetch("/api/binder", { credentials: "include" });
  const data = await parseJson<{ order: string[] }>(res);
  return data.order;
}

export async function saveBinderOrder(order: string[]): Promise<string[]> {
  const res = await fetch("/api/binder", {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order }),
  });
  const data = await parseJson<{ order: string[] }>(res);
  return data.order;
}

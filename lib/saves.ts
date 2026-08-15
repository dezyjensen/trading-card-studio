import {
  DEFAULT_CARD_STATE,
  type CardState,
} from "@/lib/themes";

export type SavedCard = {
  id: string;
  name: string;
  updatedAt: string;
  state: CardState;
};

const SAVES_PREFIX = "tcs-saves:";
const ACTIVE_SAVE_PREFIX = "tcs-active-save:";

function savesKey(userId: string) {
  return `${SAVES_PREFIX}${userId}`;
}

function activeKey(userId: string) {
  return `${ACTIVE_SAVE_PREFIX}${userId}`;
}

function readSaves(userId: string): SavedCard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(savesKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedCard[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSaves(userId: string, saves: SavedCard[]) {
  localStorage.setItem(savesKey(userId), JSON.stringify(saves));
}

export function listSavedCards(userId: string): SavedCard[] {
  return readSaves(userId).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

/** Unsorted raw saves (for binder resolution). */
export function getAllSaves(userId: string): SavedCard[] {
  return readSaves(userId);
}

const BINDER_PREFIX = "tcs-binder:";

function binderKey(userId: string) {
  return `${BINDER_PREFIX}${userId}`;
}

/** Ordered save IDs for binder pages. Missing IDs are appended; deleted IDs removed. */
export function getBinderOrder(userId: string): string[] {
  if (typeof window === "undefined") return [];
  const saves = readSaves(userId);
  const saveIds = new Set(saves.map((s) => s.id));
  let order: string[] = [];
  try {
    const raw = localStorage.getItem(binderKey(userId));
    if (raw) {
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed)) {
        order = parsed.filter((id) => saveIds.has(id));
      }
    }
  } catch {
    order = [];
  }
  for (const s of saves) {
    if (!order.includes(s.id)) order.push(s.id);
  }
  return order;
}

export function setBinderOrder(userId: string, order: string[]) {
  const saveIds = new Set(readSaves(userId).map((s) => s.id));
  const cleaned = order.filter((id) => saveIds.has(id));
  localStorage.setItem(binderKey(userId), JSON.stringify(cleaned));
  notifySavesChanged();
}

export function moveBinderCard(
  userId: string,
  fromIndex: number,
  toIndex: number,
) {
  const order = getBinderOrder(userId);
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= order.length ||
    toIndex >= order.length ||
    fromIndex === toIndex
  ) {
    return;
  }
  const next = [...order];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  setBinderOrder(userId, next);
}

export function getActiveSaveId(userId: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(activeKey(userId));
}

export function setActiveSaveId(userId: string, saveId: string | null) {
  if (saveId) localStorage.setItem(activeKey(userId), saveId);
  else localStorage.removeItem(activeKey(userId));
}

export function loadSavedCard(
  userId: string,
  saveId: string,
): SavedCard | null {
  return readSaves(userId).find((s) => s.id === saveId) ?? null;
}

export function loadActiveCard(userId: string): SavedCard | null {
  const id = getActiveSaveId(userId);
  if (!id) return null;
  return loadSavedCard(userId, id);
}

/** Approximate localStorage budget check (photos dominate size). */
function roughlyFits(payload: string): boolean {
  // Keep under ~4MB to leave room for other keys
  return payload.length < 4_000_000;
}

export function saveCard(
  userId: string,
  state: CardState,
  existingId?: string | null,
):
  | { ok: true; save: SavedCard; warning?: string }
  | { ok: false; error: string } {
  const saves = readSaves(userId);
  const id = existingId && saves.some((s) => s.id === existingId)
    ? existingId
    : crypto.randomUUID();

  const save: SavedCard = {
    id,
    name: state.name.trim() || "Untitled card",
    updatedAt: new Date().toISOString(),
    state: { ...state },
  };

  const next = [...saves.filter((s) => s.id !== id), save];
  const serialized = JSON.stringify(next);

  if (!roughlyFits(serialized)) {
    // Retry without photo if over budget
    const slim: SavedCard = {
      ...save,
      state: { ...state, photoUrl: null },
    };
    const slimNext = [...saves.filter((s) => s.id !== id), slim];
    const slimSerialized = JSON.stringify(slimNext);
    if (!roughlyFits(slimSerialized)) {
      return {
        ok: false,
        error: "Save is too large for this device. Try a smaller photo.",
      };
    }
    try {
      writeSaves(userId, slimNext);
      setActiveSaveId(userId, id);
      return {
        ok: true,
        save: slim,
        warning: "Saved without photo — image was too large for local storage.",
      };
    } catch {
      return { ok: false, error: "Could not save. Storage may be full." };
    }
  }

  try {
    writeSaves(userId, next);
    setActiveSaveId(userId, id);
    return { ok: true, save };
  } catch {
    return { ok: false, error: "Could not save. Storage may be full." };
  }
}

export function deleteSavedCard(userId: string, saveId: string) {
  const next = readSaves(userId).filter((s) => s.id !== saveId);
  writeSaves(userId, next);
  if (getActiveSaveId(userId) === saveId) {
    setActiveSaveId(userId, next[0]?.id ?? null);
  }
  try {
    const raw = localStorage.getItem(binderKey(userId));
    if (raw) {
      const order = JSON.parse(raw) as string[];
      if (Array.isArray(order)) {
        localStorage.setItem(
          binderKey(userId),
          JSON.stringify(order.filter((id) => id !== saveId)),
        );
      }
    }
  } catch {
    /* ignore */
  }
  notifySavesChanged();
}

export function newBlankCard(illustrator?: string): CardState {
  return {
    ...DEFAULT_CARD_STATE,
    illustrator: illustrator || DEFAULT_CARD_STATE.illustrator,
    photoUrl: null,
  };
}

export const USER_CHANGED_EVENT = "tcs-user-changed";
export const SAVES_CHANGED_EVENT = "tcs-saves-changed";

export function notifyUserChanged() {
  window.dispatchEvent(new Event(USER_CHANGED_EVENT));
}

export function notifySavesChanged() {
  window.dispatchEvent(new Event(SAVES_CHANGED_EVENT));
}

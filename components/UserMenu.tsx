"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  deleteRemoteCard,
  fetchMe,
  fetchRemoteCard,
  listRemoteCards,
  logoutAccount,
  setActiveRemoteCard,
  type ApiSavedCard,
  type ApiUser,
} from "@/lib/api/client";
import {
  notifySavesChanged,
  notifyUserChanged,
  SAVES_CHANGED_EVENT,
  USER_CHANGED_EVENT,
} from "@/lib/saves";

type UserMenuProps = {
  onLoadSave?: (save: ApiSavedCard) => void;
  onNewCard?: () => void;
};

export function UserMenu({ onLoadSave, onNewCard }: UserMenuProps) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [saves, setSaves] = useState<ApiSavedCard[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  async function refresh() {
    try {
      const current = await fetchMe();
      setUser(current);
      if (current) {
        setSaves(await listRemoteCards());
      } else {
        setSaves([]);
      }
    } catch {
      setUser(null);
      setSaves([]);
    } finally {
      setReady(true);
    }
  }

  useEffect(() => {
    void refresh();
    function onChange() {
      void refresh();
    }
    window.addEventListener(USER_CHANGED_EVENT, onChange);
    window.addEventListener(SAVES_CHANGED_EVENT, onChange);
    return () => {
      window.removeEventListener(USER_CHANGED_EVENT, onChange);
      window.removeEventListener(SAVES_CHANGED_EVENT, onChange);
    };
  }, []);

  async function handleLogout() {
    setBusy(true);
    try {
      await logoutAccount();
      await refresh();
      notifyUserChanged();
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <div className="min-h-10 min-w-20 rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-sm text-[var(--ink-muted)]">
        …
      </div>
    );
  }

  if (!user) {
    return (
      <Link
        href={`/auth?mode=login&next=${encodeURIComponent("/#studio")}`}
        className="inline-flex min-h-10 items-center rounded-full bg-[var(--brass)] px-3.5 py-1.5 text-sm font-semibold text-[#1a140c] transition hover:brightness-110 sm:px-4"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-10 max-w-[9.5rem] items-center truncate rounded-full border border-[var(--line)] bg-[var(--panel)] px-3.5 py-1.5 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--brass)] sm:max-w-none"
      >
        {user.displayName}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close account menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 max-h-[80vh] w-[min(92vw,20rem)] overflow-y-auto rounded-xl border border-[var(--line)] bg-[var(--background)] p-3 shadow-xl">
            <div className="space-y-3">
              <div>
                <p className="font-[family-name:var(--font-brand)] text-[var(--ink)]">
                  {user.displayName}
                </p>
                <p className="text-xs text-[var(--ink-muted)]">@{user.username}</p>
              </div>

              <div className="space-y-2 border-t border-[var(--line)] pt-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
                    Saved cards
                  </p>
                  {onNewCard && (
                    <button
                      type="button"
                      onClick={() => {
                        onNewCard?.();
                        window.dispatchEvent(new Event("tcs-new-card"));
                        setOpen(false);
                      }}
                      className="text-xs text-[var(--brass)] underline-offset-2 hover:underline"
                    >
                      New card
                    </button>
                  )}
                </div>
                {saves.length === 0 ? (
                  <p className="text-xs text-[var(--ink-muted)]">
                    No saves yet — hit Save in the studio.
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {saves.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center gap-1 rounded-lg bg-[var(--panel)] px-2 py-1.5"
                      >
                        <button
                          type="button"
                          className="min-w-0 flex-1 text-left"
                          onClick={() => {
                            void (async () => {
                              const full = await fetchRemoteCard(s.id);
                              await setActiveRemoteCard(s.id);
                              onLoadSave?.(full);
                              window.dispatchEvent(
                                new CustomEvent("tcs-load-save", {
                                  detail: full,
                                }),
                              );
                              setOpen(false);
                            })();
                          }}
                        >
                          <span className="block truncate text-sm text-[var(--ink)]">
                            {s.name}
                          </span>
                          <span className="text-[10px] text-[var(--ink-muted)]">
                            {new Date(s.updatedAt).toLocaleString()}
                          </span>
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${s.name}`}
                          onClick={() => {
                            void (async () => {
                              await deleteRemoteCard(s.id);
                              notifySavesChanged();
                              await refresh();
                            })();
                          }}
                          className="shrink-0 px-2 text-xs text-[var(--ink-muted)] hover:text-red-400"
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button
                type="button"
                disabled={busy}
                onClick={() => void handleLogout()}
                className="min-h-11 w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm text-[var(--ink)] disabled:opacity-60"
              >
                {busy ? "Signing out…" : "Sign out"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

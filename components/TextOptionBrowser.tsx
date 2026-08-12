"use client";

import { useEffect, useMemo, useState } from "react";
import {
  TEXT_OPTION_CATEGORIES,
  TEXT_OPTION_KIND_LABELS,
  filterTextOptions,
  type TextOption,
  type TextOptionCategory,
  type TextOptionKind,
  type TextOptionSort,
} from "@/lib/textPresets";

type TextOptionBrowserProps = {
  open: boolean;
  /** Lock to one kind, or allow switching when "all" */
  initialKind?: TextOptionKind | "all";
  lockKind?: boolean;
  title?: string;
  onClose: () => void;
  onPick: (option: TextOption) => void;
};

const kindTabs: Array<TextOptionKind | "all"> = [
  "all",
  "ability",
  "attack",
  "flavor",
];

export function TextOptionBrowser({
  open,
  initialKind = "all",
  lockKind = false,
  title = "Card text library",
  onClose,
  onPick,
}: TextOptionBrowserProps) {
  const [kind, setKind] = useState<TextOptionKind | "all">(initialKind);
  const [category, setCategory] = useState<TextOptionCategory | "all">("all");
  const [sort, setSort] = useState<TextOptionSort>("name");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    setKind(initialKind);
    setCategory("all");
    setSort("name");
    setQuery("");
  }, [open, initialKind]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const results = useMemo(
    () =>
      filterTextOptions({
        kind,
        category,
        query,
        sort,
      }),
    [kind, category, query, sort],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
        aria-label="Close text browser"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-[var(--line)] bg-[var(--background)] shadow-2xl sm:rounded-2xl"
      >
        <div className="border-b border-[var(--line)] px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-[family-name:var(--font-brand)] text-lg font-semibold text-[var(--ink)]">
                {title}
              </h2>
              <p className="mt-0.5 text-xs text-[var(--ink-muted)]">
                Search by subject or keyword, then tap a line to use it on your
                card.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="min-h-10 shrink-0 rounded-lg border border-[var(--line)] px-3 text-sm font-semibold text-[var(--ink)]"
            >
              Close
            </button>
          </div>

          <label className="mt-3 block">
            <span className="sr-only">Search text options</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search names, effects, cats, kids…"
              className="min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 text-base text-[var(--ink)] outline-none focus:border-[var(--brass)]"
              // Don't autoFocus — on iPhone that immediately opens the keyboard
              enterKeyHint="search"
              autoCorrect="off"
              autoCapitalize="none"
            />
          </label>

          {!lockKind && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {kindTabs.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={`min-h-9 rounded-full px-3 text-xs font-semibold transition ${
                    kind === k
                      ? "bg-[var(--brass)] text-[#1a140c]"
                      : "border border-[var(--line)] text-[var(--ink-muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  {k === "all" ? "All types" : TEXT_OPTION_KIND_LABELS[k]}
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setCategory("all")}
              className={`min-h-9 rounded-full px-3 text-xs font-semibold transition ${
                category === "all"
                  ? "bg-[var(--ink)] text-[var(--background)]"
                  : "border border-[var(--line)] text-[var(--ink-muted)]"
              }`}
            >
              All subjects
            </button>
            {TEXT_OPTION_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`min-h-9 rounded-full px-3 text-xs font-semibold transition ${
                  category === cat.id
                    ? "bg-[var(--ink)] text-[var(--background)]"
                    : "border border-[var(--line)] text-[var(--ink-muted)]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-xs text-[var(--ink-muted)]">
              Sort
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as TextOptionSort)}
                className="min-h-9 rounded-lg border border-[var(--line)] bg-[var(--panel)] px-2 text-sm text-[var(--ink)]"
              >
                <option value="name">A–Z</option>
                <option value="category">Subject</option>
                <option value="kind">Type</option>
              </select>
            </label>
            <p className="text-xs text-[var(--ink-muted)]">
              {results.length} option{results.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
          {results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-[var(--ink-muted)]">
              No matches — try a different search or subject.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {results.map((opt) => (
                <li key={opt.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onPick(opt);
                      onClose();
                    }}
                    className="w-full rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 py-2.5 text-left transition hover:border-[var(--brass)]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-[var(--ink)]">
                        {opt.title}
                      </span>
                      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
                        {opt.kind}
                        {opt.kind === "attack" && opt.damage
                          ? ` · ${opt.damage}`
                          : ""}
                      </span>
                    </div>
                    {opt.body ? (
                      <p className="mt-1 text-xs leading-snug text-[var(--ink-muted)]">
                        {opt.body}
                      </p>
                    ) : null}
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-[var(--brass)]">
                      {TEXT_OPTION_CATEGORIES.find((c) => c.id === opt.category)
                        ?.label ?? opt.category}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

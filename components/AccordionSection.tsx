"use client";

import type { ReactNode } from "react";

type AccordionSectionProps = {
  id: string;
  title: string;
  summary?: string;
  open: boolean;
  onOpen: (id: string) => void;
  children: ReactNode;
  step?: number;
};

export function AccordionSection({
  id,
  title,
  summary,
  open,
  onOpen,
  children,
  step,
}: AccordionSectionProps) {
  return (
    <section
      className={`overflow-hidden rounded-xl border transition ${
        open
          ? "border-[var(--brass)]/50 bg-[var(--panel)] shadow-[0_0_0_1px_rgba(196,120,40,0.12)]"
          : "border-[var(--line)] bg-[var(--panel)]/60"
      }`}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`accordion-${id}`}
        onClick={() => onOpen(open ? "" : id)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-[var(--brass)]/5"
      >
        {step != null && (
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-[family-name:var(--font-mono)] text-[11px] font-bold ${
              open
                ? "bg-[var(--brass)] text-[#1a140c]"
                : "bg-[var(--line)] text-[var(--ink-muted)]"
            }`}
          >
            {step}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block font-[family-name:var(--font-brand)] text-sm uppercase tracking-[0.14em] text-[var(--brass)]">
            {title}
          </span>
          {!open && summary && (
            <span className="mt-0.5 block truncate text-sm text-[var(--ink-muted)]">
              {summary}
            </span>
          )}
        </span>
        <span
          className={`shrink-0 text-[var(--ink-muted)] transition ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        >
          ▾
        </span>
      </button>
      {open && (
        <div id={`accordion-${id}`} className="space-y-4 border-t border-[var(--line)] px-4 py-4">
          {children}
        </div>
      )}
    </section>
  );
}

export function AccordionContinue({
  onClick,
  label = "Continue",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl bg-[var(--brass)] px-4 py-2.5 font-[family-name:var(--font-brand)] text-sm font-semibold text-[#1a140c] transition hover:brightness-110"
    >
      {label}
    </button>
  );
}

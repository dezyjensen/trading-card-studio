"use client";

import { useState, type RefObject } from "react";
import { exportCardPng, shareCardPng } from "@/lib/exportCard";

type ExportActionsProps = {
  cardRef: RefObject<HTMLDivElement | null>;
  cardName: string;
};

export function ExportActions({ cardRef, cardName }: ExportActionsProps) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleDownload() {
    if (!cardRef.current || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const slug =
        cardName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
          .slice(0, 40) || "trading-card";
      await exportCardPng(cardRef.current, `${slug}.png`);
      setMessage("Downloaded");
    } catch {
      setMessage("Export failed — try again");
    } finally {
      setBusy(false);
    }
  }

  async function handleShare() {
    if (!cardRef.current || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const result = await shareCardPng(cardRef.current, cardName || "Trading Card");
      setMessage(result === "shared" ? "Shared" : "Downloaded (share unavailable)");
    } catch {
      setMessage("Share cancelled or failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handleDownload}
          disabled={busy}
          className="flex-1 rounded-xl bg-[var(--brass)] px-4 py-3 font-[family-name:var(--font-brand)] font-semibold text-[#1a140c] transition hover:brightness-110 disabled:opacity-60"
        >
          {busy ? "Working…" : "Download PNG"}
        </button>
        <button
          type="button"
          onClick={handleShare}
          disabled={busy}
          className="flex-1 rounded-xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3 font-[family-name:var(--font-brand)] font-semibold text-[var(--ink)] transition hover:border-[var(--brass)] disabled:opacity-60"
        >
          Share
        </button>
      </div>
      {message && (
        <p className="text-center text-sm text-[var(--ink-muted)]" role="status">
          {message}
        </p>
      )}
    </div>
  );
}

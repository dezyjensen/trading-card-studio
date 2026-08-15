"use client";

import { useEffect, useState, type PointerEvent, type RefObject } from "react";
import { canShareFiles, exportCardPng, shareCardPng } from "@/lib/exportCard";

/** Reliable press styling on touch devices (CSS :active is flaky on iOS). */
const pressProps = {
  onPointerDown: (e: PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.dataset.pressed = "true";
  },
  onPointerUp: (e: PointerEvent<HTMLButtonElement>) => {
    delete e.currentTarget.dataset.pressed;
  },
  onPointerLeave: (e: PointerEvent<HTMLButtonElement>) => {
    delete e.currentTarget.dataset.pressed;
  },
  onPointerCancel: (e: PointerEvent<HTMLButtonElement>) => {
    delete e.currentTarget.dataset.pressed;
  },
};

const pressClass =
  "transition duration-150 active:scale-[0.95] active:brightness-90 active:shadow-inner data-[pressed]:scale-[0.95] data-[pressed]:brightness-90 data-[pressed]:shadow-inner";

type ExportActionsProps = {
  cardRef: RefObject<HTMLDivElement | null>;
  cardName: string;
  onExportStart?: () => void;
  onExportEnd?: () => void;
  /** Primary photo button only (pair with Save in a shared row). */
  photoButtonOnly?: boolean;
  className?: string;
};

export function ExportActions({
  cardRef,
  cardName,
  onExportStart,
  onExportEnd,
  photoButtonOnly = false,
  className = "",
}: ExportActionsProps) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [preferShare, setPreferShare] = useState(false);

  useEffect(() => {
    setPreferShare(canShareFiles());
  }, []);

  async function withExportMode(action: () => Promise<void>) {
    if (!cardRef.current || busy) return;
    setBusy(true);
    setMessage(null);
    onExportStart?.();
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(r)),
    );
    try {
      await action();
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setMessage(null);
        return;
      }
      console.error(err);
      setMessage(err instanceof Error ? err.message : "Export failed — try again");
    } finally {
      onExportEnd?.();
      setBusy(false);
    }
  }

  async function handleSavePhoto() {
    await withExportMode(async () => {
      const slug =
        cardName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
          .slice(0, 40) || "trading-card";
      const result = await exportCardPng(cardRef.current!, `${slug}.png`);
      if (result === "shared") {
        setMessage("In the share sheet, tap Save Image / Add to Photos");
      } else if (result === "manual") {
        setMessage("Touch and hold the image → Add to Photos");
      } else {
        setMessage("Photo downloaded");
      }
    });
  }

  async function handleShare() {
    await withExportMode(async () => {
      const result = await shareCardPng(
        cardRef.current!,
        cardName || "Trading Card",
      );
      if (result === "shared") {
        setMessage("Shared");
      } else if (result === "copied") {
        setMessage("Card copied — paste it into Messages, Mail, or Notes");
      } else if (result === "manual") {
        setMessage("Touch and hold the image → Add to Photos");
      } else {
        setMessage("Photo downloaded");
      }
    });
  }

  const primaryLabel = preferShare
    ? busy
      ? "Preparing…"
      : "Save photo"
    : busy
      ? "Preparing…"
      : "Download Image";

  const photoButton = (
    <button
      type="button"
      onClick={() => void handleSavePhoto()}
      disabled={busy}
      {...pressProps}
      className={`min-h-12 rounded-xl border border-[var(--line)] bg-[var(--background)] px-4 py-3 font-[family-name:var(--font-brand)] font-semibold text-[var(--ink)] shadow-sm transition duration-150 hover:border-[var(--brass)] hover:brightness-[0.98] disabled:opacity-60 ${pressClass} ${photoButtonOnly ? "w-full" : "flex-1"} ${className}`}
    >
      {primaryLabel}
    </button>
  );

  if (photoButtonOnly) {
    return (
      <div className="space-y-1.5">
        {photoButton}
        {message && (
          <p className="text-center text-[11px] text-[var(--ink-muted)]" role="status">
            {message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        {photoButton}
        <button
          type="button"
          onClick={() => void handleShare()}
          disabled={busy}
          {...pressProps}
          className={`min-h-12 flex-1 rounded-xl border border-[var(--line)] px-4 py-3 text-sm font-semibold text-[var(--ink-muted)] hover:border-[var(--brass)] hover:text-[var(--ink)] disabled:opacity-60 ${pressClass}`}
        >
          {busy ? "Working…" : "Share"}
        </button>
      </div>
      {message && (
        <p className="text-center text-xs text-[var(--ink-muted)]" role="status">
          {message}
        </p>
      )}
      {preferShare && !message && (
        <p className="text-center text-[11px] text-[var(--ink-muted)]">
          In the share sheet, choose Save Image / Add to Photos
        </p>
      )}
    </div>
  );
}

export function ShareCardButton({
  cardRef,
  cardName,
  onExportStart,
  onExportEnd,
  disabled,
  className = "",
  onStatus,
}: {
  cardRef: RefObject<HTMLDivElement | null>;
  cardName: string;
  onExportStart?: () => void;
  onExportEnd?: () => void;
  disabled?: boolean;
  className?: string;
  onStatus?: (message: string | null) => void;
}) {
  const [busy, setBusy] = useState(false);

  async function handleShare() {
    if (!cardRef.current || busy || disabled) return;
    setBusy(true);
    onStatus?.(null);
    onExportStart?.();
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(r)),
    );
    try {
      const result = await shareCardPng(
        cardRef.current,
        cardName || "Trading Card",
      );
      if (result === "shared") {
        onStatus?.("Shared");
      } else if (result === "copied") {
        onStatus?.("Card copied — paste it into Messages, Mail, or Notes");
      } else if (result === "manual") {
        onStatus?.("Touch and hold the image → Add to Photos");
      } else {
        onStatus?.("Card downloaded");
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        onStatus?.(null);
        return;
      }
      console.error(err);
      onStatus?.(
        err instanceof Error ? err.message : "Share failed — try Download Image",
      );
    } finally {
      onExportEnd?.();
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleShare()}
      disabled={busy || disabled}
      {...pressProps}
      className={
        className ||
        `min-h-10 w-full rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-semibold text-[var(--ink-muted)] hover:border-[var(--brass)] hover:text-[var(--ink)] data-[pressed]:bg-[var(--background)] active:bg-[var(--background)] disabled:opacity-60 ${pressClass}`
      }
    >
      {busy ? "Sharing…" : "Share"}
    </button>
  );
}

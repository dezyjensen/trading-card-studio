"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { TradingCard } from "@/components/TradingCard";
import type { CardState } from "@/lib/themes";

type CardFullscreenProps = {
  state: CardState;
  open: boolean;
  onClose: () => void;
};

export function CardFullscreen({ state, open, onClose }: CardFullscreenProps) {
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="Full screen card preview"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        aria-label="Close full screen preview"
        onClick={onClose}
      />

      <div className="card-fullscreen-panel relative z-10 flex w-full max-w-[min(92vw,calc((100vh-8rem)*5/7),420px)] flex-col items-center gap-5 animate-fade-up">
        <div className="w-full overflow-visible drop-shadow-2xl">
          <TradingCard state={state} interactive className="!max-w-none" />
        </div>

        <div className="flex items-center gap-3">
          <p className="text-sm text-white/60">Click outside or press Esc</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

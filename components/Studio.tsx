"use client";

import { useRef, useState } from "react";
import { CardCustomizer } from "@/components/CardCustomizer";
import { ExportActions } from "@/components/ExportActions";
import { PhotoUpload } from "@/components/PhotoUpload";
import { StylePicker } from "@/components/StylePicker";
import { TradingCard } from "@/components/TradingCard";
import {
  DEFAULT_CARD_STATE,
  getTheme,
  type CardState,
  type ThemeId,
} from "@/lib/themes";

export function Studio() {
  const [state, setState] = useState<CardState>(DEFAULT_CARD_STATE);
  const cardRef = useRef<HTMLDivElement>(null);

  function patch(next: Partial<CardState>) {
    setState((prev) => ({ ...prev, ...next }));
  }

  function onThemeChange(themeId: ThemeId) {
    const theme = getTheme(themeId);
    patch({
      themeId,
      accent: theme.defaultAccent,
      secondary: theme.defaultSecondary,
    });
  }

  return (
    <section
      id="studio"
      className="relative scroll-mt-8 border-t border-[var(--line)] bg-[var(--studio-bg)]"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-[1fr_340px] lg:gap-14 lg:px-8 lg:py-20">
        <div className="space-y-8">
          <div>
            <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.22em] text-[var(--brass)]">
              Studio
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-brand)] text-3xl text-[var(--ink)] sm:text-4xl">
              Build your card
            </h2>
            <p className="mt-2 max-w-lg text-[var(--ink-muted)]">
              Upload a photo, pick a style, tune the colors — then download a
              crisp PNG ready to share.
            </p>
          </div>

          <PhotoUpload
            photoUrl={state.photoUrl}
            onPhotoChange={(photoUrl) => patch({ photoUrl })}
          />
          <StylePicker themeId={state.themeId} onThemeChange={onThemeChange} />
          <CardCustomizer state={state} onChange={patch} />
          <ExportActions cardRef={cardRef} cardName={state.name} />
        </div>

        <div className="lg:sticky lg:top-8 lg:self-start">
          <div className="flex justify-center">
            <div ref={cardRef} className="w-full max-w-[320px]">
              <TradingCard state={state} />
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-[var(--ink-muted)]">
            Live preview · exports at 2× resolution
          </p>
        </div>
      </div>
    </section>
  );
}

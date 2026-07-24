"use client";

import type { CardState } from "@/lib/themes";

type CardCustomizerProps = {
  state: CardState;
  onChange: (patch: Partial<CardState>) => void;
};

export function CardCustomizer({ state, onChange }: CardCustomizerProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="card-name" className="block text-sm font-medium text-[var(--ink-muted)]">
          Name
        </label>
        <input
          id="card-name"
          type="text"
          maxLength={28}
          value={state.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 py-2.5 text-[var(--ink)] outline-none transition focus:border-[var(--brass)]"
          placeholder="Card title"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="card-subtitle" className="block text-sm font-medium text-[var(--ink-muted)]">
          Flavor text
        </label>
        <textarea
          id="card-subtitle"
          maxLength={120}
          rows={3}
          value={state.subtitle}
          onChange={(e) => onChange({ subtitle: e.target.value })}
          className="w-full resize-none rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 py-2.5 text-[var(--ink)] outline-none transition focus:border-[var(--brass)]"
          placeholder="A short description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="accent" className="block text-sm font-medium text-[var(--ink-muted)]">
            Accent
          </label>
          <div className="flex items-center gap-2">
            <input
              id="accent"
              type="color"
              value={state.accent}
              onChange={(e) => onChange({ accent: e.target.value })}
              className="h-10 w-12 cursor-pointer rounded-lg border border-[var(--line)] bg-transparent p-1"
            />
            <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--ink-muted)]">
              {state.accent}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="secondary" className="block text-sm font-medium text-[var(--ink-muted)]">
            Secondary
          </label>
          <div className="flex items-center gap-2">
            <input
              id="secondary"
              type="color"
              value={state.secondary}
              onChange={(e) => onChange({ secondary: e.target.value })}
              className="h-10 w-12 cursor-pointer rounded-lg border border-[var(--line)] bg-transparent p-1"
            />
            <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--ink-muted)]">
              {state.secondary}
            </span>
          </div>
        </div>
      </div>

      {state.photoUrl && (
        <div className="space-y-2">
          <label htmlFor="crop" className="block text-sm font-medium text-[var(--ink-muted)]">
            Photo position
          </label>
          <input
            id="crop"
            type="range"
            min={0}
            max={100}
            value={state.cropY}
            onChange={(e) => onChange({ cropY: Number(e.target.value) })}
            className="w-full accent-[var(--brass)]"
          />
        </div>
      )}
    </div>
  );
}

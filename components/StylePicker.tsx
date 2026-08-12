"use client";

import {
  CLASSIC_ENERGY_TYPES,
  CLASSIC_TYPE_COLORS,
  CLASSIC_TYPE_FACES,
  THEMES,
  usesClassicEnergy,
  usesThemeStyles,
  type CardFormat,
  type ThemeId,
} from "@/lib/themes";

type StylePickerProps = {
  format: CardFormat;
  themeId: ThemeId;
  typeLabel: string;
  embedded?: boolean;
  onThemeChange: (id: ThemeId) => void;
  onClassicTypeChange: (typeLabel: string) => void;
};

export function StylePicker({
  format,
  themeId,
  typeLabel,
  embedded = false,
  onThemeChange,
  onClassicTypeChange,
}: StylePickerProps) {
  if (format === "prism") {
    return (
      <div className="space-y-3">
        {!embedded && (
          <label className="block text-sm font-medium text-[var(--ink-muted)]">
            Card style
          </label>
        )}
        <div className="rounded-xl border border-[var(--line)] bg-[var(--background)] px-4 py-3">
          <div
            className="mb-2 h-12 overflow-hidden rounded-md"
            style={{
              background:
                "linear-gradient(135deg, #ff6b9d, #ffc93c, #6bffb8, #6bc5ff, #b388ff, #ff6b9d)",
            }}
          />
          <div className="font-[family-name:var(--font-brand)] text-[var(--ink)]">
            Spectrum crystal
          </div>
          <p className="mt-0.5 text-xs text-[var(--ink-muted)]">
            Fixed rainbow finish — Spectrum doesn&apos;t use theme or energy
            styles.
          </p>
        </div>
      </div>
    );
  }

  if (usesClassicEnergy(format)) {
    return (
      <div className="space-y-3">
        {!embedded && (
          <label className="block text-sm font-medium text-[var(--ink-muted)]">
            Energy type
          </label>
        )}
        <p className="text-xs text-[var(--ink-muted)]">
          Classic cards tint the face from the energy type — Fire, Water, Grass,
          and the rest.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CLASSIC_ENERGY_TYPES.map((energy) => {
            const selected = typeLabel === energy;
            const color = CLASSIC_TYPE_COLORS[energy];
            const face = CLASSIC_TYPE_FACES[energy];
            return (
              <button
                key={energy}
                type="button"
                onClick={() => onClassicTypeChange(energy)}
                className={`rounded-xl border px-3 py-2.5 text-left transition ${
                  selected
                    ? "border-[var(--brass)] bg-[var(--brass)]/12 shadow-[0_0_0_1px_var(--brass)]"
                    : "border-[var(--line)] bg-[var(--background)] hover:border-[var(--brass)]/50"
                }`}
              >
                <div
                  className="mb-2 flex h-10 items-stretch overflow-hidden rounded-md"
                  style={{
                    background:
                      "linear-gradient(180deg, #f2d84a 0%, #e8c820 50%, #c9a010 100%)",
                    padding: 3,
                  }}
                >
                  <div
                    className="flex-1 rounded-sm"
                    style={{ background: face }}
                  />
                  <div
                    className="ml-1 w-2.5 self-center rounded-full"
                    style={{
                      aspectRatio: "1",
                      background: color,
                      boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.25)",
                    }}
                  />
                </div>
                <div className="font-[family-name:var(--font-brand)] text-sm text-[var(--ink)]">
                  {energy}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (!usesThemeStyles(format)) return null;

  return (
    <div className="space-y-3">
      {!embedded && (
        <label className="block text-sm font-medium text-[var(--ink-muted)]">
          Theme style
        </label>
      )}
      <p className="text-xs text-[var(--ink-muted)]">
        Decorative colourways for Modern and Full Art cards.
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {THEMES.map((theme) => {
          const selected = theme.id === themeId;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onThemeChange(theme.id)}
              className={`rounded-xl border px-3 py-3 text-left transition ${
                selected
                  ? "border-[var(--brass)] bg-[var(--brass)]/12 shadow-[0_0_0_1px_var(--brass)]"
                  : "border-[var(--line)] bg-[var(--background)] hover:border-[var(--brass)]/50"
              }`}
            >
              <div
                className="mb-2 flex h-12 items-stretch overflow-hidden rounded-md"
                style={{ background: theme.frameOuter }}
              >
                <div
                  className="m-1.5 flex-1 rounded-sm"
                  style={{ background: theme.frameInner }}
                />
                <div
                  className="w-3"
                  style={{ background: theme.defaultAccent }}
                />
              </div>
              <div className="font-[family-name:var(--font-brand)] text-[var(--ink)]">
                {theme.name}
              </div>
              <div className="mt-0.5 text-xs text-[var(--ink-muted)]">
                {theme.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

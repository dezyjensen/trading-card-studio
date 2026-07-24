"use client";

import { THEMES, type ThemeId } from "@/lib/themes";

type StylePickerProps = {
  themeId: ThemeId;
  onThemeChange: (id: ThemeId) => void;
};

export function StylePicker({ themeId, onThemeChange }: StylePickerProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-[var(--ink-muted)]">
        Card style
      </label>
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
                  : "border-[var(--line)] bg-[var(--panel)] hover:border-[var(--brass)]/50"
              }`}
            >
              <div className="mb-2 flex h-10 overflow-hidden rounded-md">
                <span
                  className="flex-1"
                  style={{ background: theme.frame }}
                />
                <span
                  className="w-8"
                  style={{ background: theme.defaultAccent }}
                />
                <span
                  className="w-6"
                  style={{ background: theme.defaultSecondary }}
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

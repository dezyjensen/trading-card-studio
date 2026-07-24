"use client";

import type { CardState, CardTheme } from "@/lib/themes";
import { getTheme } from "@/lib/themes";

type TradingCardProps = {
  state: CardState;
  className?: string;
  shine?: boolean;
};

export function TradingCard({
  state,
  className = "",
  shine = true,
}: TradingCardProps) {
  const theme = getTheme(state.themeId);

  return (
    <div
      className={`trading-card relative aspect-[5/7] w-full max-w-[320px] select-none ${className}`}
      style={{ borderRadius: theme.radius }}
      data-theme={theme.id}
    >
      <div
        className="absolute inset-0 overflow-hidden shadow-2xl"
        style={{
          borderRadius: theme.radius,
          background: theme.frame,
          boxShadow: `0 24px 48px rgba(0,0,0,0.45), 0 0 0 1px ${state.accent}44, inset 0 1px 0 rgba(255,255,255,0.12)`,
        }}
      >
        <FrameOrnaments theme={theme} accent={state.accent} secondary={state.secondary} />

        <div
          className="absolute inset-[10px] flex flex-col"
          style={{
            borderRadius: `calc(${theme.radius} - 4px)`,
            background: theme.panel,
            boxShadow: `inset 0 0 0 1.5px ${state.accent}66`,
          }}
        >
          <div
            className="relative mx-auto mt-3 w-[88%] overflow-hidden"
            style={{
              aspectRatio: "1 / 1.05",
              borderRadius: theme.id === "arcade" ? "2px" : "10px",
              boxShadow: `0 0 0 2px ${state.accent}, 0 0 0 4px ${state.secondary}55`,
            }}
          >
            {state.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={state.photoUrl}
                alt=""
                className="h-full w-full object-cover"
                style={{ objectPosition: `center ${state.cropY}%` }}
                draggable={false}
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center text-center text-sm tracking-wide"
                style={{
                  background: `linear-gradient(160deg, ${state.accent}33, ${state.secondary}22)`,
                  color: theme.subtitleColor,
                }}
              >
                Upload a photo
              </div>
            )}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `linear-gradient(180deg, transparent 55%, ${theme.panel}aa 100%)`,
              }}
            />
          </div>

          <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
            <div
              className="mb-2 inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em]"
              style={{
                background: theme.badgeBg,
                color: theme.badgeText,
                border: `1px solid ${state.accent}55`,
              }}
            >
              Collectible
            </div>

            <h2
              className={`leading-tight ${titleClass(theme)}`}
              style={{ color: theme.titleColor }}
            >
              {state.name || "Untitled"}
            </h2>

            <p
              className="mt-1.5 line-clamp-3 text-[11px] leading-relaxed"
              style={{ color: theme.subtitleColor }}
            >
              {state.subtitle || "Add a flavor text"}
            </p>

            <div className="mt-auto flex items-center justify-between pt-3">
              <div className="flex gap-1.5">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{
                    background: state.accent,
                    boxShadow: `0 0 8px ${state.accent}`,
                  }}
                />
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ background: state.secondary }}
                />
              </div>
              <span
                className="font-[family-name:var(--font-mono)] text-[9px] tracking-[0.2em] uppercase opacity-70"
                style={{ color: theme.subtitleColor }}
              >
                TCS · 001
              </span>
            </div>
          </div>
        </div>

        {shine && <div className="card-shine pointer-events-none absolute inset-0" />}
      </div>
    </div>
  );
}

function titleClass(theme: CardTheme): string {
  if (theme.fontTitle === "serif") {
    return "font-[family-name:var(--font-display)] text-[1.35rem] font-semibold tracking-tight";
  }
  if (theme.fontTitle === "mono") {
    return "font-[family-name:var(--font-mono)] text-[1.15rem] font-bold uppercase tracking-wide";
  }
  return "font-[family-name:var(--font-brand)] text-[1.4rem] font-bold tracking-tight";
}

function FrameOrnaments({
  theme,
  accent,
  secondary,
}: {
  theme: CardTheme;
  accent: string;
  secondary: string;
}) {
  if (theme.id === "aurora") {
    return (
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 300 420" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="aurora-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.55" />
            <stop offset="100%" stopColor={secondary} stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <rect x="6" y="6" width="288" height="408" rx="16" fill="none" stroke="url(#aurora-g)" strokeWidth="2.5" />
        <circle cx="150" cy="14" r="4" fill={accent} opacity="0.8" />
        <circle cx="150" cy="406" r="4" fill={secondary} opacity="0.7" />
      </svg>
    );
  }

  if (theme.id === "ember") {
    return (
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 300 420" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="ember-g" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.9" />
            <stop offset="100%" stopColor={secondary} stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <rect x="8" y="8" width="284" height="404" rx="8" fill="none" stroke="url(#ember-g)" strokeWidth="3" />
        <path d="M20 30 L40 20 L60 30" fill="none" stroke={accent} strokeWidth="1.5" opacity="0.7" />
        <path d="M240 390 L260 400 L280 390" fill="none" stroke={accent} strokeWidth="1.5" opacity="0.7" />
      </svg>
    );
  }

  if (theme.id === "noir") {
    return (
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 300 420" preserveAspectRatio="none" aria-hidden>
        <rect x="10" y="10" width="280" height="400" fill="none" stroke={accent} strokeWidth="1" opacity="0.85" />
        <rect x="14" y="14" width="272" height="392" fill="none" stroke={accent} strokeWidth="0.5" opacity="0.4" />
        <line x1="24" y1="24" x2="48" y2="24" stroke={accent} strokeWidth="1" />
        <line x1="252" y1="396" x2="276" y2="396" stroke={accent} strokeWidth="1" />
      </svg>
    );
  }

  if (theme.id === "arcade") {
    return (
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 300 420" preserveAspectRatio="none" aria-hidden>
        <rect x="6" y="6" width="288" height="408" fill="none" stroke={accent} strokeWidth="4" />
        <rect x="12" y="12" width="276" height="396" fill="none" stroke={secondary} strokeWidth="2" />
        <rect x="0" y="40" width="14" height="14" fill={accent} />
        <rect x="286" y="40" width="14" height="14" fill={secondary} />
        <rect x="0" y="366" width="14" height="14" fill={secondary} />
        <rect x="286" y="366" width="14" height="14" fill={accent} />
      </svg>
    );
  }

  // garden
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 300 420" preserveAspectRatio="none" aria-hidden>
      <rect x="10" y="10" width="280" height="400" rx="20" fill="none" stroke={accent} strokeWidth="1.5" opacity="0.7" />
      <path
        d="M40 28 C55 12, 80 18, 90 32 C78 28, 55 34, 40 28 Z"
        fill={secondary}
        opacity="0.55"
      />
      <path
        d="M210 392 C225 376, 250 382, 260 396 C248 392, 225 398, 210 392 Z"
        fill={accent}
        opacity="0.45"
      />
      <circle cx="150" cy="22" r="3" fill={secondary} opacity="0.8" />
    </svg>
  );
}

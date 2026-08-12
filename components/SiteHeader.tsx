"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/BrandMark";
import { UserMenu } from "@/components/UserMenu";
import { useColorMode } from "@/lib/color-mode";
import { STATIC_DEMO } from "@/lib/features";

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3a7 7 0 1 0 11.5 11.5Z" />
    </svg>
  );
}

export function SiteHeader() {
  const { mode, toggle } = useColorMode();

  return (
    <nav className="relative z-20 flex items-center justify-between gap-2 px-4 py-2.5 sm:gap-3 sm:px-8 sm:py-4">
      <Link
        href="/"
        className="min-w-0 rounded-lg outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[var(--brass)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        aria-label="Keepsleeve home"
      >
        <BrandLogo
          markClassName="h-8 w-8 shrink-0 shadow-[0_2px_10px_rgba(0,0,0,0.25)] sm:h-9 sm:w-9"
          wordmarkClassName="truncate font-[family-name:var(--font-brand)] text-sm font-extrabold tracking-tight text-[var(--ink)] sm:text-base"
        />
      </Link>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <a
          href="#gallery"
          className="hidden min-h-10 items-center px-2 text-sm text-[var(--ink-muted)] transition hover:text-[var(--brass)] sm:inline-flex"
        >
          Binder
        </a>
        <a
          href="#studio"
          className="hidden min-h-10 items-center px-2 text-sm text-[var(--ink-muted)] transition hover:text-[var(--brass)] sm:inline-flex"
        >
          Studio
        </a>

        <button
          type="button"
          onClick={toggle}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--ink-muted)] transition hover:bg-[var(--panel)] hover:text-[var(--ink)]"
          aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
          title={mode === "dark" ? "Light mode" : "Dark mode"}
        >
          {mode === "dark" ? (
            <SunIcon className="h-5 w-5" />
          ) : (
            <MoonIcon className="h-5 w-5" />
          )}
        </button>

        {!STATIC_DEMO && (
          <>
            <div
              className="mx-0.5 h-5 w-px bg-[var(--line)] sm:mx-1"
              aria-hidden
            />
            <UserMenu />
          </>
        )}
      </div>
    </nav>
  );
}

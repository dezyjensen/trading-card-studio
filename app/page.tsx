"use client";

import { BrandMark } from "@/components/BrandMark";
import { Gallery } from "@/components/Gallery";
import { HeroCarousel } from "@/components/HeroCarousel";
import { SiteHeader } from "@/components/SiteHeader";
import { Studio } from "@/components/Studio";
import { APP_NAME, APP_SLOGAN, APP_TAGLINE } from "@/lib/brand";

export default function Home() {
  return (
    <>
      <header className="hero-surface relative flex flex-col overflow-x-clip">
        <SiteHeader />

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 pb-10 pt-1 sm:gap-8 sm:pb-12 sm:pt-2 lg:gap-10 lg:px-8 lg:pb-16 lg:pt-4">
          <div className="relative z-20 mx-auto w-full max-w-2xl text-center">
            <h1 className="animate-fade-up text-balance font-[family-name:var(--font-display)] text-[1.75rem] font-semibold leading-snug tracking-normal text-[var(--ink)] sm:text-4xl sm:leading-snug md:text-[2.75rem]">
              {APP_SLOGAN}
            </h1>

            <p className="animate-fade-up-delay mx-auto mt-3 max-w-md text-base leading-relaxed text-[var(--ink-muted)] sm:text-lg">
              {APP_TAGLINE}
            </p>

            <div className="animate-fade-up-delay-2 mt-5 flex flex-col items-stretch gap-2 sm:mt-6 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3">
              <a
                href="#studio"
                className="min-h-12 rounded-xl bg-[var(--brass)] px-6 py-3.5 text-center font-[family-name:var(--font-brand)] font-semibold text-[#1a140c] transition hover:brightness-110"
              >
                Start creating
              </a>
              <a
                href="#gallery"
                className="min-h-12 rounded-xl border border-[var(--line)] px-6 py-3.5 text-center font-[family-name:var(--font-brand)] font-semibold text-[var(--ink)] transition hover:border-[var(--brass)]"
              >
                Open binder
              </a>
            </div>
          </div>

          {/* Full-bleed carousel on phones so peeks feel intentional */}
          <div className="relative z-10 -mx-5 min-w-0 sm:mx-0">
            <HeroCarousel />
          </div>
        </div>
      </header>

      <Studio />

      <Gallery />

      <footer className="border-t border-[var(--line)] px-5 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 text-center text-sm text-[var(--ink-muted)]">
          <BrandMark className="h-8 w-8 rounded-lg opacity-90" />
          <p>
            {APP_NAME} · {APP_SLOGAN}
          </p>
        </div>
      </footer>
    </>
  );
}

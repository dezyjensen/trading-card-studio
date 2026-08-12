"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TradingCard } from "@/components/TradingCard";
import { HERO_SAMPLES } from "@/lib/heroSamples";

const AUTO_MS = 2800;

export function HeroCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const userScrolling = useRef(false);
  const scrollTimeout = useRef<number | null>(null);

  const scrollToIndex = useCallback((index: number, smooth = true) => {
    const scroller = scrollerRef.current;
    const item = itemRefs.current[index];
    if (!scroller || !item) return;
    const left =
      item.offsetLeft - (scroller.clientWidth - item.clientWidth) / 2;
    scroller.scrollTo({ left, behavior: smooth ? "smooth" : "auto" });
  }, []);

  const goTo = useCallback(
    (index: number) => {
      const next = (index + HERO_SAMPLES.length) % HERO_SAMPLES.length;
      setActive(next);
      scrollToIndex(next);
    },
    [scrollToIndex],
  );

  useEffect(() => {
    scrollToIndex(0, false);
  }, [scrollToIndex]);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (userScrolling.current) return;
      setActive((prev) => {
        const next = (prev + 1) % HERO_SAMPLES.length;
        scrollToIndex(next);
        return next;
      });
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [paused, scrollToIndex]);

  function onScroll() {
    userScrolling.current = true;
    if (scrollTimeout.current) window.clearTimeout(scrollTimeout.current);
    scrollTimeout.current = window.setTimeout(() => {
      userScrolling.current = false;
      const scroller = scrollerRef.current;
      if (!scroller) return;
      const center = scroller.scrollLeft + scroller.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        const mid = el.offsetLeft + el.clientWidth / 2;
        const dist = Math.abs(mid - center);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      setActive(best);
    }, 120);
  }

  const sample = HERO_SAMPLES[active];

  return (
    <div
      className="relative w-full min-w-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setPaused(false);
        }
      }}
    >
      <div
        className="pointer-events-none absolute left-1/2 top-[40%] h-[55%] w-[75%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(196,120,40,0.35), transparent 65%)",
        }}
        aria-hidden
      />

      <div className="relative">
        <div
          ref={scrollerRef}
          onScroll={onScroll}
          className="hero-carousel flex snap-x snap-mandatory gap-4 overflow-x-auto py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-5 sm:py-4"
          style={{
            paddingInline: "max(1.25rem, calc(50% - 7.25rem))",
            scrollPaddingInline: "max(1.25rem, calc(50% - 7.25rem))",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)",
            maskImage:
              "linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)",
          }}
          aria-label="Sample trading cards"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") {
              e.preventDefault();
              goTo(active + 1);
            }
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              goTo(active - 1);
            }
          }}
        >
          {HERO_SAMPLES.map((item, i) => (
            <div
              key={item.id}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className={`hero-carousel-item w-[min(58vw,232px)] shrink-0 snap-center transition-opacity duration-300 sm:w-[248px] ${
                i === active ? "z-[1] opacity-100" : "opacity-35"
              }`}
            >
              <TradingCard
                state={item.state}
                interactive={i === active}
                className="!max-w-none"
              />
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-center gap-3 px-5">
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            className="hidden min-h-10 rounded-lg border border-[var(--line)] bg-[var(--panel)]/80 px-3 py-2 text-sm font-semibold text-[var(--ink)] backdrop-blur transition hover:border-[var(--brass)] sm:inline-flex"
            aria-label="Previous sample card"
          >
            ←
          </button>
          <div
            className="flex items-center gap-1.5"
            role="tablist"
            aria-label="Samples"
          >
            {HERO_SAMPLES.map((item, i) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={item.caption}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all ${
                  i === active
                    ? "w-6 bg-[var(--brass)]"
                    : "w-2 bg-[var(--ink-muted)]/40 hover:bg-[var(--ink-muted)]/70"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => goTo(active + 1)}
            className="hidden min-h-10 rounded-lg border border-[var(--line)] bg-[var(--panel)]/80 px-3 py-2 text-sm font-semibold text-[var(--ink)] backdrop-blur transition hover:border-[var(--brass)] sm:inline-flex"
            aria-label="Next sample card"
          >
            →
          </button>
        </div>

        <p className="mt-2 px-5 text-center font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-[var(--ink-muted)] sm:mt-3 sm:text-[11px] sm:tracking-[0.16em]">
          {sample.caption}
          <span className="mx-2 opacity-40">·</span>
          {sample.state.name}
        </p>
      </div>
    </div>
  );
}

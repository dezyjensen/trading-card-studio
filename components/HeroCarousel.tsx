"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TradingCard } from "@/components/TradingCard";
import { HERO_SAMPLES, type HeroSample } from "@/lib/heroSamples";
import type { CardState } from "@/lib/themes";

const AUTO_MS = 2800;
/** Render cards at studio size, then scale down so type/layout never clips. */
const CARD_NATIVE_W = 300;

function ScaledSampleCard({
  state,
  active,
}: {
  state: CardState;
  active: boolean;
}) {
  return (
    <div
      className="hero-sample-scale relative w-full overflow-visible"
      style={{ aspectRatio: "5 / 7" }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left will-change-transform"
        style={{
          width: CARD_NATIVE_W,
          transform: `scale(calc(100cqw / ${CARD_NATIVE_W}))`,
        }}
      >
        <TradingCard
          state={state}
          interactive={active}
          className="!max-w-none"
        />
      </div>
    </div>
  );
}

function applySampleTemplate(sample: HeroSample) {
  window.dispatchEvent(
    new CustomEvent("tcs-apply-template", { detail: sample.state }),
  );
  const studio = document.getElementById("studio");
  if (studio) {
    studio.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    window.location.hash = "studio";
  }
}

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
  /** Slot width — card is painted at 300px then scaled into this box. */
  const slotClass = "w-[min(62vw,248px)] sm:w-[260px]";

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
          className="hero-carousel flex snap-x snap-mandatory gap-5 overflow-x-auto overflow-y-visible py-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-6 sm:py-6"
          style={{
            paddingInline: "max(1.25rem, calc(50% - 7.75rem))",
            scrollPaddingInline: "max(1.25rem, calc(50% - 7.75rem))",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent 0%, #000 6%, #000 94%, transparent 100%)",
            maskImage:
              "linear-gradient(90deg, transparent 0%, #000 6%, #000 94%, transparent 100%)",
          }}
          aria-label="Sample trading cards — click one to use as a template"
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
              className={`hero-carousel-item shrink-0 snap-center transition-opacity duration-300 ${slotClass} ${
                i === active ? "z-[1] opacity-100" : "opacity-40"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setActive(i);
                  scrollToIndex(i);
                  applySampleTemplate(item);
                }}
                className="group w-full rounded-xl text-left outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--brass)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                aria-label={`Use “${item.state.name}” as a template`}
              >
                <ScaledSampleCard state={item.state} active={i === active} />
                <span
                  className={`mt-2 block text-center text-[11px] font-semibold text-[var(--brass)] transition sm:text-xs ${
                    i === active
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                  }`}
                >
                  Use as template
                </span>
              </button>
            </div>
          ))}
        </div>

        <div className="mt-1 flex items-center justify-center gap-3 px-5 sm:mt-2">
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
          <span className="mt-1 block normal-case tracking-normal opacity-80 sm:mt-1.5">
            Tap a card to edit it in the studio
          </span>
        </p>
      </div>
    </div>
  );
}

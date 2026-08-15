"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HERO_SAMPLES, type HeroSample } from "@/lib/heroSamples";
import { withBasePath } from "@/lib/features";

const AUTO_MS = 2800;
const COPIES = 3; // middle copy is the “real” track

function sampleImageSrc(id: string) {
  return withBasePath(`/hero-samples/${id}.png`);
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

function logicalIndex(slideIndex: number) {
  const n = HERO_SAMPLES.length;
  return ((slideIndex % n) + n) % n;
}

export function HeroCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeLogical, setActiveLogical] = useState(0);
  const [paused, setPaused] = useState(false);
  const userScrolling = useRef(false);
  const scrollTimeout = useRef<number | null>(null);
  const jumping = useRef(false);
  const ready = useRef(false);

  const slides = useMemo(
    () =>
      Array.from({ length: COPIES }, (_, copy) =>
        HERO_SAMPLES.map((sample, i) => ({
          sample,
          key: `${copy}-${sample.id}`,
          slideIndex: copy * HERO_SAMPLES.length + i,
          logical: i,
        })),
      ).flat(),
    [],
  );

  const middleStart = HERO_SAMPLES.length;

  const scrollToSlide = useCallback((slideIndex: number, smooth = true) => {
    const scroller = scrollerRef.current;
    const item = itemRefs.current[slideIndex];
    if (!scroller || !item) return;
    const left =
      item.offsetLeft - (scroller.clientWidth - item.clientWidth) / 2;
    scroller.scrollTo({
      left,
      behavior: smooth && !jumping.current ? "smooth" : "auto",
    });
  }, []);

  const normalizeLoop = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller || jumping.current) return;

    const center = scroller.scrollLeft + scroller.clientWidth / 2;
    let best = middleStart;
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

    const n = HERO_SAMPLES.length;
    let next = best;
    // Keep the viewport in the middle copy so left/right always have peeks
    if (best < n) next = best + n;
    else if (best >= n * 2) next = best - n;

    setActiveLogical(logicalIndex(best));

    if (next !== best) {
      jumping.current = true;
      scrollToSlide(next, false);
      requestAnimationFrame(() => {
        jumping.current = false;
      });
    }
  }, [middleStart, scrollToSlide]);

  const goLogical = useCallback(
    (logical: number, smooth = true) => {
      const n = HERO_SAMPLES.length;
      const target = ((logical % n) + n) % n;
      setActiveLogical(target);
      // Prefer middle copy for navigation
      scrollToSlide(middleStart + target, smooth);
    },
    [middleStart, scrollToSlide],
  );

  useEffect(() => {
    // Start centered on the first sample in the middle copy
    const id = window.requestAnimationFrame(() => {
      scrollToSlide(middleStart, false);
      ready.current = true;
    });
    return () => window.cancelAnimationFrame(id);
  }, [middleStart, scrollToSlide]);

  function onScroll() {
    if (jumping.current || !ready.current) return;
    userScrolling.current = true;
    if (scrollTimeout.current) window.clearTimeout(scrollTimeout.current);
    scrollTimeout.current = window.setTimeout(() => {
      userScrolling.current = false;
      normalizeLoop();
    }, 140);
  }

  const sample = HERO_SAMPLES[activeLogical];
  const slotClass = "w-[min(42vw,168px)] sm:w-[200px]";
  const activeRef = useRef(activeLogical);
  activeRef.current = activeLogical;

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (userScrolling.current || jumping.current || !ready.current) return;
      goLogical(activeRef.current + 1, true);
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [paused, goLogical]);

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
          className="hero-carousel flex snap-x snap-mandatory gap-5 overflow-x-auto py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-8 sm:py-5 px-[max(1rem,calc((100%-min(42vw,168px))/2))] sm:px-[max(1.25rem,calc((100%-200px)/2))] [scroll-padding-inline:max(1rem,calc((100%-min(42vw,168px))/2))] sm:[scroll-padding-inline:max(1.25rem,calc((100%-200px)/2))]"
          aria-label="Sample trading cards — tap one to use as a template"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") {
              e.preventDefault();
              goLogical(activeLogical + 1);
            }
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              goLogical(activeLogical - 1);
            }
          }}
        >
          {slides.map((slide, i) => (
            <div
              key={slide.key}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className={`hero-carousel-item shrink-0 snap-center transition-opacity duration-300 ${slotClass} ${
                slide.logical === activeLogical
                  ? "z-[1] opacity-100"
                  : "opacity-45"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  goLogical(slide.logical);
                  applySampleTemplate(slide.sample);
                }}
                className="group w-full rounded-xl text-left outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--brass)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                aria-label={`Use “${slide.sample.state.name}” as a template`}
              >
                <div
                  className="relative w-full overflow-hidden rounded-[clamp(8px,2.5vw,14px)]"
                  style={{ aspectRatio: "5 / 7" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sampleImageSrc(slide.sample.id)}
                    alt=""
                    width={720}
                    height={1008}
                    decoding="async"
                    fetchPriority={i < middleStart + 3 ? "high" : "low"}
                    draggable={false}
                    className="pointer-events-none h-full w-full object-cover drop-shadow-[0_14px_28px_rgba(0,0,0,0.28)]"
                  />
                </div>
                <span
                  className={`mt-1.5 block text-center text-[11px] font-semibold text-[var(--brass)] transition sm:mt-2 sm:text-xs ${
                    slide.logical === activeLogical
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
            onClick={() => goLogical(activeLogical - 1)}
            className="hidden min-h-10 rounded-lg border border-[var(--line)] bg-[var(--panel)]/80 px-3 py-2 text-sm font-semibold text-[var(--ink)] backdrop-blur transition hover:border-[var(--brass)] active:scale-95 sm:inline-flex"
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
                aria-selected={i === activeLogical}
                aria-label={item.caption}
                onClick={() => goLogical(i)}
                className={`h-2 rounded-full transition-all ${
                  i === activeLogical
                    ? "w-6 bg-[var(--brass)]"
                    : "w-2 bg-[var(--ink-muted)]/40 hover:bg-[var(--ink-muted)]/70"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => goLogical(activeLogical + 1)}
            className="hidden min-h-10 rounded-lg border border-[var(--line)] bg-[var(--panel)]/80 px-3 py-2 text-sm font-semibold text-[var(--ink)] backdrop-blur transition hover:border-[var(--brass)] active:scale-95 sm:inline-flex"
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

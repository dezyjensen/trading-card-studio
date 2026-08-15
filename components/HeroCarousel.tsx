"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type TransitionEvent as ReactTransitionEvent,
} from "react";
import { HERO_SAMPLES, type HeroSample } from "@/lib/heroSamples";
import { withBasePath } from "@/lib/features";

const AUTO_MS = 3200;
const COPIES = 3;
const N = HERO_SAMPLES.length;
/** Start on the middle copy so left/right always have neighbors */
const START = N;

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

/** After a slide animation, snap the index into the middle copy (same visual). */
function wrapIndex(i: number) {
  return ((i % N) + N) % N + N;
}

export function HeroCarousel() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [index, setIndex] = useState(START);
  const [tx, setTx] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const [drag, setDrag] = useState(0);
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    lastX: number;
    dragging: boolean;
  } | null>(null);
  const indexRef = useRef(index);
  indexRef.current = index;
  const suppressClick = useRef(false);

  const slides = useMemo(
    () =>
      Array.from({ length: COPIES }, (_, copy) =>
        HERO_SAMPLES.map((sample, i) => ({
          sample,
          key: `${copy}-${sample.id}`,
          logical: i,
        })),
      ).flat(),
    [],
  );

  const activeLogical = ((index % N) + N) % N;
  const sample = HERO_SAMPLES[activeLogical];
  const slotClass = "w-[min(42vw,168px)] sm:w-[200px]";

  const measureTx = useCallback((slideIndex: number) => {
    const viewport = viewportRef.current;
    const item = itemRefs.current[slideIndex];
    if (!viewport || !item) return 0;
    return (
      viewport.clientWidth / 2 - (item.offsetLeft + item.clientWidth / 2)
    );
  }, []);

  // Keep translate in sync with the active slide (animation flag is set by callers)
  useLayoutEffect(() => {
    setTx(measureTx(index));
    setReady(true);
  }, [index, measureTx]);

  useEffect(() => {
    const onResize = () => {
      setAnimate(false);
      setTx(measureTx(indexRef.current));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measureTx]);

  const goBy = useCallback((delta: number) => {
    setDrag(0);
    setAnimate(true);
    setIndex((i) => i + delta);
  }, []);

  const goToLogical = useCallback((logical: number) => {
    const target = ((logical % N) + N) % N;
    const current = indexRef.current;
    const base = Math.floor(current / N) * N;
    let next = base + target;
    const alt = next <= current ? next + N : next - N;
    if (Math.abs(alt - current) < Math.abs(next - current)) next = alt;
    if (next === current) return;
    setDrag(0);
    setAnimate(true);
    setIndex(next);
  }, []);

  function onTransitionEnd(e: ReactTransitionEvent<HTMLDivElement>) {
    if (e.target !== trackRef.current) return;
    if (e.propertyName !== "transform") return;
    const current = indexRef.current;
    const wrapped = wrapIndex(current);
    if (wrapped !== current) {
      setAnimate(false);
      setIndex(wrapped);
    }
  }

  useEffect(() => {
    if (paused || !ready) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (dragRef.current?.active) return;
      goBy(1);
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [paused, ready, goBy]);

  function onPointerDown(e: ReactPointerEvent) {
    if (e.button !== 0) return;
    dragRef.current = {
      active: true,
      startX: e.clientX,
      lastX: e.clientX,
      dragging: false,
    };
    setPaused(true);
    setAnimate(false);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: ReactPointerEvent) {
    const d = dragRef.current;
    if (!d?.active) return;
    const dx = e.clientX - d.startX;
    if (!d.dragging && Math.abs(dx) > 8) d.dragging = true;
    if (d.dragging) {
      d.lastX = e.clientX;
      setDrag(dx);
    }
  }

  function onPointerUp(e: ReactPointerEvent) {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    const dx = d.dragging ? e.clientX - d.startX : 0;
    const threshold = Math.min(
      64,
      (viewportRef.current?.clientWidth ?? 320) * 0.18,
    );
    setDrag(0);
    if (d.dragging) suppressClick.current = true;
    if (dx <= -threshold) goBy(1);
    else if (dx >= threshold) goBy(-1);
    else {
      setAnimate(true);
      setTx(measureTx(indexRef.current));
    }
    window.setTimeout(() => setPaused(false), 1200);
  }

  return (
    <div
      className="relative w-full min-w-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
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
          ref={viewportRef}
          className={`relative cursor-grab overflow-hidden py-2 touch-pan-y select-none active:cursor-grabbing sm:py-5 transition-opacity duration-150 ${
            ready ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Sample trading cards — tap one to use as a template"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") {
              e.preventDefault();
              goBy(1);
            }
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              goBy(-1);
            }
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div
            ref={trackRef}
            className="flex w-max gap-5 will-change-transform sm:gap-8"
            style={{
              transform: `translate3d(${tx + drag}px, 0, 0)`,
              transition:
                animate && drag === 0
                  ? "transform 420ms cubic-bezier(0.22, 1, 0.36, 1)"
                  : "none",
            }}
            onTransitionEnd={onTransitionEnd}
          >
            {slides.map((slide, i) => (
              <div
                key={slide.key}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                className={`hero-carousel-item shrink-0 transition-opacity duration-300 ${slotClass} ${
                  slide.logical === activeLogical
                    ? "z-[1] opacity-100"
                    : "opacity-45"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (suppressClick.current) {
                      suppressClick.current = false;
                      return;
                    }
                    if (slide.logical !== activeLogical) {
                      goToLogical(slide.logical);
                      return;
                    }
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
                      fetchPriority={i >= START && i < START + 3 ? "high" : "low"}
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
        </div>

        <div className="mt-1 flex items-center justify-center gap-3 px-5 sm:mt-2">
          <button
            type="button"
            onClick={() => goBy(-1)}
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
                onClick={() => goToLogical(i)}
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
            onClick={() => goBy(1)}
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

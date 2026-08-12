"use client";

import { domToPng } from "modern-screenshot";
import { useCallback, useEffect, useRef, useState } from "react";
import { TradingCard } from "@/components/TradingCard";
import { HERO_SAMPLES, type HeroSample } from "@/lib/heroSamples";

const AUTO_MS = 2800;
/** Smaller than studio — enough for ~200px slots at 1.25× capture. */
const CAPTURE_W = 240;
const CAPTURE_SCALE = 1.25;
/** Bump when sample art/layout changes so caches refresh. */
const CACHE_VERSION = "hero-samples-v3";
const IDB_NAME = "keepsleeve-hero";
const IDB_STORE = "previews";

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

async function waitForImages(root: HTMLElement) {
  const images = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }),
    ),
  );
}

function openHeroDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function readCachedPreviews(): Promise<Record<string, string>> {
  try {
    const db = await openHeroDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(CACHE_VERSION);
      req.onsuccess = () => {
        const value = req.result as Record<string, string> | undefined;
        resolve(value && typeof value === "object" ? value : {});
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return {};
  }
}

async function writeCachedPreviews(images: Record<string, string>) {
  try {
    const db = await openHeroDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put(images, CACHE_VERSION);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Quota / private mode — ignore
  }
}

function preloadHeroPhotos() {
  for (const sample of HERO_SAMPLES) {
    const url = sample.state.photoUrl;
    if (!url || !url.startsWith("http")) continue;
    const img = new Image();
    img.decoding = "async";
    img.crossOrigin = "anonymous";
    img.src = url;
  }
}

async function captureOne(el: HTMLElement): Promise<string | null> {
  await waitForImages(el);
  const dataUrl = await domToPng(el, {
    scale: CAPTURE_SCALE,
    backgroundColor: null,
    style: { transform: "none" },
    filter: (node) => {
      if (!(node instanceof Element)) return true;
      if (node.classList?.contains("cf-overlay")) return false;
      if (node.classList?.contains("cf-specular")) return false;
      return true;
    },
  });
  if (!dataUrl || dataUrl === "data:,") return null;
  return dataUrl;
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function run() {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => run()),
  );
  return results;
}

/**
 * Renders samples off-screen once, snapshots to PNG (cached in IndexedDB),
 * and shows plain images in the carousel for clean scaling.
 */
function useHeroSampleImages() {
  const [images, setImages] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);
  const [needCapture, setNeedCapture] = useState(false);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    let cancelled = false;
    preloadHeroPhotos();

    void (async () => {
      const cached = await readCachedPreviews();
      if (cancelled) return;
      const complete = HERO_SAMPLES.every((s) => Boolean(cached[s.id]));
      if (complete) {
        setImages(cached);
        setReady(true);
        setNeedCapture(false);
        return;
      }
      if (Object.keys(cached).length) {
        setImages(cached);
      }
      setNeedCapture(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!needCapture) return;
    let cancelled = false;

    async function captureMissing() {
      await new Promise((r) =>
        requestAnimationFrame(() => requestAnimationFrame(r)),
      );
      if (cancelled) return;

      const already = await readCachedPreviews();
      if (cancelled) return;

      // Capture center/early cards first so the carousel fills quickly
      const order = HERO_SAMPLES;
      const missing = order.filter((s) => !already[s.id]);

      if (Object.keys(already).length) {
        setImages((prev) => ({ ...already, ...prev }));
      }

      if (missing.length === 0) {
        setImages(already);
        setReady(true);
        setNeedCapture(false);
        return;
      }

      const captured: Record<string, string> = { ...already };

      await mapPool(missing, 3, async (sample) => {
        if (cancelled) return null;
        const el = cardRefs.current[sample.id];
        if (!el) return null;
        try {
          const dataUrl = await captureOne(el);
          if (!dataUrl || cancelled) return null;
          captured[sample.id] = dataUrl;
          setImages((prev) => ({ ...prev, [sample.id]: dataUrl }));
          return dataUrl;
        } catch (err) {
          console.warn("Hero sample capture failed", sample.id, err);
          return null;
        }
      });

      if (!cancelled) {
        setImages(captured);
        setReady(true);
        setNeedCapture(false);
        void writeCachedPreviews(captured);
      }
    }

    void captureMissing();
    return () => {
      cancelled = true;
    };
    // Only re-run when we decide capture is needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needCapture]);

  const captureHost = needCapture ? (
    <div
      aria-hidden
      className="pointer-events-none fixed top-0 -left-[10000px] z-[-1] flex flex-col gap-4"
    >
      {HERO_SAMPLES.map((sample) => (
        <div
          key={sample.id}
          ref={(el) => {
            cardRefs.current[sample.id] = el;
          }}
          style={{ width: CAPTURE_W }}
        >
          <TradingCard
            state={sample.state}
            interactive={false}
            forExport
            className="!max-w-none"
          />
        </div>
      ))}
    </div>
  ) : null;

  return { images, ready, captureHost };
}

export function HeroCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const userScrolling = useRef(false);
  const scrollTimeout = useRef<number | null>(null);
  const { images, ready, captureHost } = useHeroSampleImages();

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
  }, [scrollToIndex, ready]);

  useEffect(() => {
    if (paused || !ready) return;
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
  }, [paused, ready, scrollToIndex]);

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
  const slotClass = "w-[min(48vw,190px)] sm:w-[200px]";

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
      {captureHost}

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
          className="hero-carousel flex snap-x snap-mandatory gap-6 overflow-x-auto py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-8 sm:py-5"
          style={{
            paddingInline: "max(1.25rem, calc(50% - 6.25rem))",
            scrollPaddingInline: "max(1.25rem, calc(50% - 6.25rem))",
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
          {HERO_SAMPLES.map((item, i) => {
            const src = images[item.id];
            return (
              <div
                key={item.id}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                className={`hero-carousel-item shrink-0 snap-center transition-opacity duration-300 ${slotClass} ${
                  i === active ? "z-[1] opacity-100" : "opacity-45"
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
                  <div
                    className="relative w-full overflow-hidden rounded-[clamp(8px,2.5vw,14px)] shadow-[0_16px_36px_rgba(0,0,0,0.28)]"
                    style={{ aspectRatio: "5 / 7" }}
                  >
                    {src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={src}
                        alt=""
                        draggable={false}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="absolute inset-0 animate-pulse bg-[var(--panel)]" />
                    )}
                  </div>
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
            );
          })}
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

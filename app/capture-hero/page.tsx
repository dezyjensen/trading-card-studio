"use client";

import { TradingCard } from "@/components/TradingCard";
import { HERO_SAMPLES } from "@/lib/heroSamples";

/**
 * Dev-only rasterization target for `npm run capture:hero`.
 * Stashed out of GitHub Pages static builds.
 */
export default function CaptureHeroPage() {
  return (
    <main
      style={{
        margin: 0,
        padding: 24,
        background: "#f3efe6",
        minHeight: "100vh",
      }}
    >
      <p style={{ fontFamily: "system-ui", marginBottom: 16 }}>
        Capture target — used by scripts/capture-hero-samples.cjs
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {HERO_SAMPLES.map((sample) => (
          <div key={sample.id} data-hero-id={sample.id}>
            <div
              data-hero-card={sample.id}
              style={{ width: 360, background: "transparent" }}
            >
              <TradingCard
                state={sample.state}
                interactive={false}
                forExport
                className="!max-w-none"
              />
            </div>
          </div>
        ))}
      </div>
      {/* Extra space so the last card can scroll to the top of the viewport for capture */}
      <div style={{ height: "80vh" }} aria-hidden />
    </main>
  );
}

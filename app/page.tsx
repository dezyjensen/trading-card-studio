import { Studio } from "@/components/Studio";
import { TradingCard } from "@/components/TradingCard";
import { DEFAULT_CARD_STATE } from "@/lib/themes";

const demoState = {
  ...DEFAULT_CARD_STATE,
  name: "Mochi",
  subtitle: "Champion of naps. Collector of socks. Undefeated.",
  themeId: "ember" as const,
  accent: "#e8923a",
  secondary: "#c44d2a",
};

export default function Home() {
  return (
    <>
      <header className="hero-surface relative min-h-[100svh] flex flex-col">
        <nav className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-8">
          <span className="font-[family-name:var(--font-brand)] text-sm font-bold tracking-[0.08em] uppercase text-[var(--ink)]">
            Trading Card Studio
          </span>
          <a
            href="#studio"
            className="text-sm text-[var(--ink-muted)] transition hover:text-[var(--brass)]"
          >
            Open studio
          </a>
        </nav>

        <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-5 pb-16 pt-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:px-8 lg:pb-20">
          <div className="max-w-xl">
            <p className="animate-fade-up font-[family-name:var(--font-brand)] text-4xl font-extrabold leading-[0.95] tracking-tight text-[var(--ink)] sm:text-5xl md:text-6xl lg:text-7xl">
              Trading Card Studio
            </p>
            <h1 className="animate-fade-up-delay mt-5 font-[family-name:var(--font-display)] text-2xl font-medium leading-snug text-[var(--ink)] sm:text-3xl">
              Any photo. Instant collectible.
            </h1>
            <p className="animate-fade-up-delay mt-4 max-w-md text-base leading-relaxed text-[var(--ink-muted)] sm:text-lg">
              Design a polished trading card of your pet, friend, or team — then
              download and share in seconds.
            </p>
            <div className="animate-fade-up-delay-2 mt-8 flex flex-wrap gap-3">
              <a
                href="#studio"
                className="rounded-xl bg-[var(--brass)] px-6 py-3.5 font-[family-name:var(--font-brand)] font-semibold text-[#1a140c] transition hover:brightness-110"
              >
                Start creating
              </a>
              <a
                href="#studio"
                className="rounded-xl border border-[var(--line)] px-6 py-3.5 font-[family-name:var(--font-brand)] font-semibold text-[var(--ink)] transition hover:border-[var(--brass)]"
              >
                See styles
              </a>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div
              className="pointer-events-none absolute -inset-8 rounded-full opacity-40 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(232,146,58,0.35), transparent 65%)",
              }}
              aria-hidden
            />
            <div className="hero-card-float relative w-full max-w-[300px] sm:max-w-[320px]">
              <TradingCard state={demoState} />
            </div>
          </div>
        </div>
      </header>

      <Studio />

      <footer className="border-t border-[var(--line)] px-5 py-8 text-center text-sm text-[var(--ink-muted)]">
        Trading Card Studio · Make something collectible
      </footer>
    </>
  );
}

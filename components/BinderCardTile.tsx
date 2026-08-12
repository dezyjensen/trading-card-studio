import { ONE_OF_ONE } from "@/lib/collectorNumber";
import type { CardState } from "@/lib/themes";
import { FORMATS, RARITIES, getTheme } from "@/lib/themes";

type BinderCardTileProps = {
  state: CardState;
  name: string;
  collectorNumber?: number | null;
  className?: string;
};

/** Compact binder pocket art — photo + 1/1 + name. */
export function BinderCardTile({
  state,
  name,
  className = "",
}: BinderCardTileProps) {
  const theme = getTheme(state.themeId);
  const format =
    FORMATS.find((f) => f.id === state.format)?.name ?? state.format;
  const rarity =
    RARITIES.find((r) => r.id === state.rarity)?.label ?? state.rarity;
  const accent = state.accent || theme.defaultAccent;

  return (
    <div
      className={`relative aspect-[5/7] w-full overflow-hidden rounded-md ${className}`}
      style={{
        background: "#171c18",
        boxShadow: `inset 0 0 0 2px ${accent}, 0 2px 8px rgba(0,0,0,0.25)`,
      }}
    >
      {state.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={state.photoUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            objectPosition: `center ${state.cropY ?? 50}%`,
          }}
          draggable={false}
        />
      ) : (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-2"
          style={{
            background: `linear-gradient(160deg, ${accent}55, #171c18 70%)`,
          }}
        >
          <span className="font-[family-name:var(--font-mono)] text-[10px] font-bold tracking-wider text-[#e4c56f]">
            {ONE_OF_ONE}
          </span>
          <span className="text-center font-[family-name:var(--font-brand)] text-xs font-bold text-white/80 sm:text-sm">
            {name || "Untitled"}
          </span>
        </div>
      )}

      <div className="absolute left-1 top-1 rounded bg-black/70 px-1 py-0.5 font-[family-name:var(--font-mono)] text-[9px] font-bold tracking-wide text-[#e4c56f] sm:text-[10px]">
        {ONE_OF_ONE}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-1.5 pb-1.5 pt-8">
        <p className="truncate text-center text-[10px] font-semibold leading-tight text-white sm:text-[11px]">
          {name || "Untitled"}
        </p>
        <p className="mt-0.5 truncate text-center text-[8px] uppercase tracking-wider text-white/65 sm:text-[9px]">
          {format} · {rarity}
        </p>
      </div>
    </div>
  );
}

"use client";

import { FoilOverlay } from "card-foil/react";
import "card-foil/style.css";
import { CardFrameSvg } from "@/components/CardFrameSvg";
import { formatCollectorNumber } from "@/lib/collectorNumber";
import {
  CLASSIC_TYPE_COLORS,
  RARITIES,
  STAGES,
  classicAccent,
  getTheme,
  resolveAppearance,
  resolveFullArtFrost,
  type CardAttack,
  type CardState,
  type CardTheme,
} from "@/lib/themes";

/** Body copy on the card face — room for descenders (g/y/p) under line-clamp */
const faceBody =
  "leading-[1.45] [overflow-wrap:anywhere] pb-[0.12em]";
const faceBodyClamp1 = `line-clamp-1 ${faceBody}`;
const faceBodyClamp2 = `line-clamp-2 ${faceBody}`;
/** Titles/names — avoid leading-none/tight which clips hanging letters */
const faceTitle = "leading-normal";

function cardFooterMeta(state: CardState, setCode: string) {
  const num = formatCollectorNumber(state.collectorNumber);
  return `${num} · ${setCode} · Illus. ${state.illustrator || "—"}`;
}

type TradingCardProps = {
  state: CardState;
  className?: string;
  interactive?: boolean;
  forExport?: boolean;
};

export function TradingCard({
  state,
  className = "",
  interactive = true,
  forExport = false,
}: TradingCardProps) {
  const theme = getTheme(state.themeId);
  const look = resolveAppearance(state);
  const accent = classicAccent(state);
  const rarity = RARITIES.find((r) => r.id === state.rarity) ?? RARITIES[2];
  const stage = STAGES.find((s) => s.id === state.stage) ?? STAGES[0];
  const showFoil = !forExport && interactive && look.foil !== "none";
  const attacks = state.attacks.filter((a) => a.name.trim().length > 0);
  const isFullArt = state.format === "fullart";
  const isClassic = state.format === "classic";
  const isPrism = state.format === "prism";

  return (
    <div
      className={`trading-card relative aspect-[5/7] w-full max-w-[320px] select-none ${
        forExport ? "is-exporting" : ""
      } ${isPrism ? "trading-card-prism" : ""} ${className}`}
      style={{ borderRadius: look.radius }}
      data-theme={theme.id}
      data-format={state.format}
    >
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          borderRadius: look.radius,
          background: look.frameOuter,
          boxShadow: forExport
            ? `0 0 0 1px ${accent}66`
              : isClassic
              ? "0 20px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.45)"
              : isPrism
                ? "0 28px 56px rgba(120,80,200,0.35), 0 0 24px rgba(255,100,180,0.25), inset 0 1px 0 rgba(255,255,255,0.5)"
                : `0 28px 56px rgba(0,0,0,0.55), 0 0 0 1px ${accent}55, inset 0 1px 0 rgba(255,255,255,0.25)`,
        }}
      >
        {isPrism && !forExport && (
          <div className="prism-border-shift pointer-events-none absolute inset-0 export-hide" />
        )}

        {showFoil && look.foil !== "none" && (
          <FoilOverlay
            finish={look.foil}
            intensity={Math.min(2, look.foilIntensity * 1.25)}
            tilt={false}
            specular
            shimmer
            className="export-hide"
          />
        )}

        {/* Standard keeps ornate theme frame; classic/prism use their own borders */}
        {!isFullArt && !isClassic && !isPrism && (
          <CardFrameSvg
            theme={{ ...theme, radius: look.radius }}
            accent={accent}
            secondary={state.secondary}
          />
        )}

        {isFullArt ? (
          <FullArtFace
            state={state}
            look={look}
            theme={theme}
            accent={accent}
            stageLabel={stage.label}
            rarityLabel={rarity.label}
            rarityPips={rarity.pips}
            attacks={attacks}
          />
        ) : isClassic ? (
          <ClassicFace
            state={state}
            look={look}
            theme={theme}
            accent={accent}
            stageLabel={stage.label}
            rarityLabel={rarity.label}
            rarityPips={rarity.pips}
            attacks={attacks}
          />
        ) : isPrism ? (
          <PrismFace
            state={state}
            look={look}
            theme={theme}
            accent={accent}
            stageLabel={stage.label}
            rarityLabel={rarity.label}
            rarityPips={rarity.pips}
            attacks={attacks}
          />
        ) : (
          <StandardFace
            state={state}
            look={look}
            theme={theme}
            accent={accent}
            stageLabel={stage.label}
            rarityLabel={rarity.label}
            rarityPips={rarity.pips}
            attacks={attacks}
          />
        )}
      </div>
    </div>
  );
}

type FaceProps = {
  state: CardState;
  look: ReturnType<typeof resolveAppearance>;
  theme: CardTheme;
  accent: string;
  stageLabel: string;
  rarityLabel: string;
  rarityPips: number;
  attacks: CardAttack[];
};

/** Vintage classic layout: yellow border, type-tinted face, plain name/HP */
function ClassicFace({
  state,
  look,
  theme,
  accent,
  rarityLabel,
  rarityPips,
  attacks,
}: FaceProps) {
  const typeColor =
    CLASSIC_TYPE_COLORS[state.typeLabel] ?? accent;

  return (
    <div
      className="absolute inset-[11px] flex flex-col overflow-hidden"
      style={{
        borderRadius: 3,
        background: look.frameInner,
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.25)",
      }}
    >
      {/* Name + HP — plain typography */}
      <div className="mx-2 mt-1.5 flex shrink-0 items-end justify-between gap-1">
        <h2
          className={`min-w-0 flex-1 truncate font-[family-name:var(--font-display)] text-[15px] font-bold tracking-tight ${faceTitle}`}
          style={{ color: look.titleColor }}
        >
          {state.name || "Untitled"}
        </h2>
        <div className="flex shrink-0 items-end gap-1 pb-px">
          <span
            className="font-[family-name:var(--font-brand)] text-[9px] font-extrabold leading-none"
            style={{ color: look.titleColor }}
          >
            HP
          </span>
          <span className="font-[family-name:var(--font-brand)] text-[20px] font-black leading-none text-[#c01018]">
            {state.hp}
          </span>
          <TypePip color={typeColor} size={16} ring />
        </div>
      </div>

      {/* Art box — large window; shrinks only if footer would clip */}
      <div
        className="relative mx-2 mt-1.5 min-h-0 w-[calc(100%-1rem)] shrink self-center overflow-hidden bg-black"
        style={{
          aspectRatio: "4 / 3",
          maxHeight: "39%",
          border: "2.5px solid #1a1810",
          boxShadow: "2px 2px 0 rgba(0,0,0,0.35)",
        }}
      >
        <ArtImage state={state} />
      </div>

      {/* Length / type bar under art */}
      <div
        className="mx-2 mt-1 flex shrink-0 items-center justify-between rounded-sm px-1.5 py-0.5"
        style={{
          background: "rgba(255,255,255,0.55)",
          border: "1px solid rgba(0,0,0,0.2)",
          color: look.textInk,
        }}
      >
        <span className="text-[8px] font-bold">
          {state.typeLabel || theme.defaultType} · {rarityLabel}
        </span>
        <span className="text-[7px] opacity-70">No. {String(state.hp).padStart(3, "0")}</span>
      </div>

      {/* Cream rules box */}
      <div
        className="mx-2 mb-1.5 mt-1 flex min-h-[34%] flex-1 flex-col overflow-hidden px-2 py-1"
        style={{
          background: look.textBox,
          border: "1.5px solid rgba(0,0,0,0.35)",
          color: look.textInk,
        }}
      >
        <div className="min-h-0 flex-1 overflow-hidden">
          {state.abilityEnabled && state.ability.name.trim() && (
            <div
              className="mb-1 border-b border-dashed pb-1"
              style={{ borderColor: "rgba(0,0,0,0.25)" }}
            >
              <div className="flex items-center gap-1">
                <span
                  className="rounded-sm px-1 text-[7px] font-black uppercase text-white"
                  style={{ background: typeColor }}
                >
                  Power
                </span>
                <span className="text-[10px] font-bold">{state.ability.name}</span>
              </div>
            {state.ability.description.trim() && (
              <p
                className={`mt-0.5 text-[8px] ${faceBodyClamp2}`}
                style={{ color: look.textMuted }}
              >
                {state.ability.description}
              </p>
            )}
          </div>
        )}

        <div className="space-y-0.5">
          {attacks.map((attack, i) => (
            <ClassicAttackRow
              key={`${attack.name}-${i}`}
              attack={attack}
              typeColor={typeColor}
              muted={look.textMuted}
            />
          ))}
        </div>

        {state.flavor.trim() && (
          <p
            className={`mt-1 border-t border-dashed pt-1 text-[7.5px] italic ${faceBodyClamp2}`}
            style={{ borderColor: "rgba(0,0,0,0.2)", color: look.textMuted }}
          >
              {state.flavor}
            </p>
          )}
        </div>

        <div
          className="mt-1 shrink-0 grid grid-cols-3 gap-1 border-t pt-1"
          style={{ borderColor: "rgba(0,0,0,0.25)" }}
        >
          <ClassicStat
            label="weakness"
            value={state.weakness || "—"}
            typeColor={
              state.weakness
                ? CLASSIC_TYPE_COLORS[state.weakness] ?? "#888"
                : "#888"
            }
          />
          <ClassicStat
            label="resistance"
            value={state.resistance || "—"}
            typeColor={
              state.resistance
                ? CLASSIC_TYPE_COLORS[state.resistance] ?? "#888"
                : "#888"
            }
          />
          <div className="text-center">
            <div className="text-[6px] font-bold uppercase tracking-wide opacity-70">
              retreat cost
            </div>
            <div className="mt-0.5 flex justify-center gap-0.5">
              {Array.from({ length: Math.min(4, Math.max(0, state.retreat)) }).map(
                (_, i) => (
                  <TypePip key={i} color="#a8a090" size={10} ring />
                ),
              )}
              {state.retreat <= 0 && <span className="text-[8px]">—</span>}
            </div>
          </div>
        </div>

        <div
          className="mt-1 flex shrink-0 items-center justify-between text-[6.5px] uppercase tracking-wider"
          style={{ color: look.textMuted }}
        >
          <span className="min-w-0 truncate">
            {cardFooterMeta(state, look.setCode)}
          </span>
          <span className="flex gap-0.5">
            {Array.from({ length: rarityPips }).map((_, i) => (
              <span
                key={i}
                className="inline-block h-1.5 w-1.5 rotate-45 bg-[#1a1810]"
              />
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Spectrum / prismatic rainbow layout — crystal face, rainbow rim, iridescent chrome */
function PrismFace({
  state,
  look,
  theme,
  accent,
  stageLabel,
  rarityLabel,
  rarityPips,
  attacks,
}: FaceProps) {
  return (
    <div
      className="absolute inset-[10px] flex flex-col overflow-hidden"
      style={{
        borderRadius: Math.max(look.radius - 6, 8),
        background: look.frameInner,
        boxShadow:
          "inset 0 0 0 1px rgba(255,255,255,0.85), inset 0 0 0 2px rgba(180,120,255,0.35)",
      }}
    >
      <div className="prism-inner-sheen pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-2 mt-1.5 flex shrink-0 items-center justify-between gap-2">
        <span className="prism-badge rounded-full px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.14em] text-white">
          Spectrum Rare
        </span>
        <span
          className="text-[8px] font-semibold uppercase tracking-wider"
          style={{ color: look.textMuted }}
        >
          {stageLabel}
        </span>
      </div>

      <div className="relative z-10 mx-2 mt-1 flex shrink-0 items-end gap-2">
        <div
          className="min-w-0 flex-1 truncate rounded-lg px-2.5 py-1.5"
          style={{
            background: look.plateColor,
            color: look.plateText,
            boxShadow:
              "inset 0 0 0 1px rgba(180,120,255,0.35), 0 2px 8px rgba(180,100,200,0.15)",
          }}
        >
          <span className="font-[family-name:var(--font-display)] text-[14px] font-bold tracking-tight">
            {state.name || "Untitled"}
          </span>
        </div>
        <div className="flex shrink-0 items-baseline gap-0.5 rounded-lg bg-white/70 px-1.5 py-1 shadow-sm">
          <span className="text-[8px] font-bold" style={{ color: look.textMuted }}>
            HP
          </span>
          <span className="text-[18px] font-black text-[#c01018]">{state.hp}</span>
          <TypePip color={accent} size={14} />
        </div>
      </div>

      <div
        className="relative z-10 mx-2 mt-1.5 min-h-0 w-[calc(100%-1rem)] shrink self-center overflow-hidden"
        style={{
          aspectRatio: "4 / 3",
          maxHeight: "36%",
          borderRadius: 10,
          padding: 2,
          background:
            "linear-gradient(135deg, #ff6b9d, #ffc93c, #6bffb8, #6bc5ff, #b388ff, #ff6b9d)",
          boxShadow: "0 4px 16px rgba(140,80,200,0.25)",
        }}
      >
        <div
          className="relative h-full w-full overflow-hidden rounded-[8px]"
          style={{ background: look.artMatte }}
        >
          <ArtImage state={state} />
          <div className="prism-art-glint pointer-events-none absolute inset-0" />
        </div>
      </div>

      <div
        className="relative z-10 mx-2 mt-1 flex shrink-0 items-center justify-between rounded-md px-2 py-0.5"
        style={{
          background: "rgba(255,255,255,0.65)",
          boxShadow: "inset 0 0 0 1px rgba(180,120,255,0.3)",
          color: look.textInk,
        }}
      >
        <span className="text-[8px] font-bold uppercase tracking-[0.1em]">
          {state.typeLabel || theme.defaultType} · {rarityLabel}
        </span>
        <span className="flex gap-0.5">
          {Array.from({ length: rarityPips }).map((_, i) => (
            <span
              key={i}
              className="inline-block h-1.5 w-1.5 rotate-45"
              style={{
                background: `hsl(${(i * 70 + 300) % 360} 80% 60%)`,
                boxShadow: "0 0 4px currentColor",
              }}
            />
          ))}
        </span>
      </div>

      <div
        className="relative z-10 mx-2 mb-1.5 mt-1 flex min-h-[32%] flex-1 flex-col overflow-hidden rounded-lg px-2 py-1"
        style={{
          background: look.textBox,
          boxShadow: "inset 0 0 0 1px rgba(180,120,255,0.35)",
          color: look.textInk,
        }}
      >
        <div className="min-h-0 flex-1 overflow-hidden">
          {state.abilityEnabled && state.ability.name.trim() && (
            <div
              className="mb-1 border-b pb-1"
              style={{ borderColor: "rgba(180,120,255,0.25)" }}
            >
              <div className="flex items-center gap-1">
                <span className="prism-badge rounded-sm px-1 py-px text-[7px] font-extrabold uppercase text-white">
                  Prism Power
                </span>
                <span className="font-[family-name:var(--font-display)] text-[10px] font-semibold">
                  {state.ability.name}
                </span>
              </div>
              {state.ability.description.trim() && (
                <p
                  className={`mt-0.5 text-[8px] ${faceBodyClamp2}`}
                  style={{ color: look.textMuted }}
                >
                  {state.ability.description}
                </p>
              )}
            </div>
          )}

          <div className="space-y-1">
            {attacks.map((attack, i) => (
              <AttackRow
                key={`${attack.name}-${i}`}
                attack={attack}
                accent={accent}
                muted={look.textMuted}
              />
            ))}
          </div>

          {state.flavor.trim() && (
            <p
              className={`mt-1 border-t pt-1 text-[7.5px] italic ${faceBodyClamp2}`}
              style={{
                borderColor: "rgba(180,120,255,0.2)",
                color: look.textMuted,
              }}
            >
              {state.flavor}
            </p>
          )}
        </div>

        <div
          className="mt-1 flex shrink-0 items-end justify-between gap-1 border-t pt-1"
          style={{ borderColor: "rgba(180,120,255,0.25)" }}
        >
          <StatChip label="Weakness" value={state.weakness || "—"} accent={accent} />
          <StatChip label="Resistance" value={state.resistance || "—"} accent={accent} />
          <div className="text-center">
            <div
              className="text-[6px] font-bold uppercase tracking-wider"
              style={{ color: look.textMuted }}
            >
              Retreat
            </div>
            <div className="mt-0.5 flex justify-center gap-0.5">
              {Array.from({ length: Math.min(4, Math.max(0, state.retreat)) }).map(
                (_, i) => (
                  <TypePip key={i} color={state.secondary} size={9} />
                ),
              )}
              {state.retreat <= 0 && (
                <span className="text-[8px]" style={{ color: look.textMuted }}>
                  —
                </span>
              )}
            </div>
          </div>
        </div>

        <div
          className="mt-1 flex shrink-0 items-center justify-between font-[family-name:var(--font-mono)] text-[6.5px] uppercase tracking-[0.12em]"
          style={{ color: look.textMuted }}
        >
          <span className="min-w-0 truncate">
            {cardFooterMeta(state, look.setCode)}
          </span>
          <span className="prism-badge rounded px-1 py-px text-[6px] font-bold text-white">
            PRISM
          </span>
        </div>
      </div>
    </div>
  );
}

function ClassicAttackRow({
  attack,
  typeColor,
  muted,
}: {
  attack: CardAttack;
  typeColor: string;
  muted: string;
}) {
  return (
    <div className="border-b border-dashed border-black/15 pb-1 last:border-0">
      <div className="flex items-center gap-1.5">
        <div className="flex shrink-0 items-center gap-0.5 py-px pl-px">
          {Array.from({ length: Math.min(4, Math.max(1, attack.cost)) }).map((_, i) => (
            <TypePip key={i} color={typeColor} size={11} ring />
          ))}
        </div>
        <span
          className={`min-w-0 flex-1 truncate text-[11px] font-bold ${faceTitle}`}
        >
          {attack.name}
        </span>
        <span className="shrink-0 pr-px text-[14px] font-black leading-none text-[#1a1810]">
          {attack.damage || ""}
        </span>
      </div>
      {attack.description.trim() && (
        <p
          className={`mt-0.5 text-[7.5px] ${faceBodyClamp2}`}
          style={{ color: muted }}
        >
          {attack.description}
        </p>
      )}
    </div>
  );
}

function ClassicStat({
  label,
  value,
  typeColor,
}: {
  label: string;
  value: string;
  typeColor: string;
}) {
  return (
    <div className="text-center">
      <div className="text-[6px] font-bold uppercase tracking-wide opacity-70">{label}</div>
      <div className="mt-0.5 flex items-center justify-center gap-0.5">
        {value !== "—" && <TypePip color={typeColor} size={11} ring />}
        <span className="text-[8px] font-semibold">{value}</span>
      </div>
    </div>
  );
}

function StandardFace({
  state,
  look,
  theme,
  accent,
  stageLabel,
  rarityLabel,
  rarityPips,
  attacks,
}: FaceProps) {
  return (
    <div
      className="absolute inset-[13px] flex flex-col overflow-hidden"
      style={{
        borderRadius: Math.max(look.radius - 6, 2),
        background: look.frameInner,
        boxShadow: `inset 0 0 0 1px rgba(0,0,0,0.18), inset 0 0 0 2px ${accent}55`,
      }}
    >
      <div className="mx-1.5 mt-1.5 flex shrink-0 items-end gap-1.5">
        <div
          className="min-w-0 flex-1 truncate border px-2 py-1 leading-none"
          style={{
            background: look.plateColor,
            color: look.plateText,
            borderColor: `${accent}99`,
            borderRadius: 3,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.65)",
          }}
        >
          <span className={titleClass(look.fontTitle)}>
            {state.name || "Untitled"}
          </span>
        </div>
        <div
          className="flex shrink-0 items-baseline gap-0.5 pb-0.5 pr-0.5"
          style={{ color: look.titleColor }}
        >
          <span className="font-[family-name:var(--font-brand)] text-[9px] font-bold tracking-wide">
            HP
          </span>
          <span
            className="font-[family-name:var(--font-brand)] text-[18px] font-extrabold leading-none"
            style={{ color: "#b01020" }}
          >
            {state.hp}
          </span>
          <TypePip color={accent} size={14} />
        </div>
      </div>

      <div
        className="relative mx-1.5 mt-1.5 min-h-0 w-[calc(100%-0.75rem)] shrink self-center overflow-hidden border-2"
        style={{
          aspectRatio: "4 / 3.1",
          maxHeight: "40%",
          background: look.artMatte,
          borderColor: accent,
          borderRadius: 2,
          boxShadow: `inset 0 0 0 1px ${state.secondary}88, 0 1px 2px rgba(0,0,0,0.25)`,
        }}
      >
        <ArtImage state={state} />
      </div>

      <div
        className="mx-1.5 mt-1 flex shrink-0 items-center justify-between border px-1.5 py-0.5"
        style={{
          background: "rgba(255,255,255,0.45)",
          borderColor: `${accent}66`,
          borderRadius: 2,
          color: look.textInk,
        }}
      >
        <span className="text-[8px] font-bold uppercase tracking-[0.08em]">
          {stageLabel} · {state.typeLabel || theme.defaultType}
        </span>
        <span className="text-[8px] font-semibold uppercase tracking-wider opacity-70">
          {rarityLabel}
        </span>
      </div>

      <RulesBox
        state={state}
        look={look}
        accent={accent}
        attacks={attacks}
        rarityPips={rarityPips}
        setCode={look.setCode}
      />
    </div>
  );
}

/** True full art: photo edge-to-edge, frosted text overlays on the image */
function FullArtFace({
  state,
  look,
  theme,
  accent,
  stageLabel,
  rarityLabel,
  rarityPips,
  attacks,
}: FaceProps) {
  const shownAttacks = attacks.slice(0, 2);
  const frostLevel = resolveFullArtFrost(state.fullArtFrost);
  const frost = `rgba(255,252,245,${frostLevel.panel})`;
  const frostStrong = `rgba(255,252,245,${frostLevel.chip})`;
  const blur = `blur(${frostLevel.blur}px)`;
  const veil = frostLevel.veil;

  return (
    <div
      className="absolute inset-[4px] overflow-hidden"
      style={{
        borderRadius: Math.max(look.radius - 2, 8),
        boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.7)",
      }}
    >
      <div className="absolute inset-0">
        <ArtImage state={state} fill />
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24"
        style={{
          background: `linear-gradient(180deg, rgba(10,8,6,${veil * 0.85}) 0%, transparent 100%)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%]"
        style={{
          background: `linear-gradient(0deg, rgba(10,8,6,${veil}) 0%, rgba(10,8,6,${veil * 0.45}) 55%, transparent 100%)`,
        }}
      />

      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2">
        <div
          className="min-w-0 flex-1 truncate rounded-lg px-2.5 py-1.5 text-[13px] font-bold"
          style={{
            background: frostStrong,
            color: look.plateText,
            backdropFilter: blur,
            boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
          }}
        >
          <span className={titleClass(look.fontTitle)}>
            {state.name || "Untitled"}
          </span>
        </div>
        <div
          className="flex shrink-0 items-baseline gap-0.5 rounded-lg px-2 py-1.5"
          style={{
            background: frostStrong,
            backdropFilter: blur,
            color: look.titleColor,
            boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
          }}
        >
          <span className="text-[8px] font-bold">HP</span>
          <span className="text-[16px] font-extrabold text-[#c01018]">{state.hp}</span>
          <TypePip color={accent} size={12} />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 space-y-1 p-2">
        <div
          className="flex items-center justify-between rounded-md px-2 py-0.5 text-[7.5px] font-bold uppercase tracking-wider"
          style={{
            background: frost,
            color: look.textMuted,
            backdropFilter: blur,
          }}
        >
          <span className="truncate">
            {stageLabel} · {state.typeLabel || theme.defaultType}
          </span>
          <span className="shrink-0">{rarityLabel}</span>
        </div>

        <div
          className="space-y-1 rounded-lg px-2 py-1.5"
          style={{
            background: frost,
            color: look.textInk,
            backdropFilter: blur,
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
          }}
        >
          {state.abilityEnabled && state.ability.name.trim() && (
            <div className="border-b pb-1" style={{ borderColor: `${accent}33` }}>
              <div className="flex items-center gap-1">
                <span
                  className="rounded-sm px-1 py-px text-[7px] font-extrabold uppercase text-white"
                  style={{ background: accent }}
                >
                  Ability
                </span>
                <span className="min-w-0 truncate text-[10px] font-semibold">
                  {state.ability.name}
                </span>
              </div>
              {state.ability.description.trim() && (
                <p
                  className={`mt-0.5 text-[7.5px] ${faceBodyClamp1}`}
                  style={{ color: look.textMuted }}
                >
                  {state.ability.description}
                </p>
              )}
            </div>
          )}

          <div className="space-y-0.5">
            {shownAttacks.map((attack, i) => (
              <AttackRow
                key={`${attack.name}-${i}`}
                attack={attack}
                accent={accent}
                muted={look.textMuted}
                dense
              />
            ))}
          </div>

          <div
            className="flex items-end justify-between gap-1 border-t pt-1"
            style={{ borderColor: `${accent}33` }}
          >
            <StatChip
              label="Weakness"
              value={state.weakness || "—"}
              accent={accent}
              chipBg={`rgba(255,255,255,${Math.min(0.7, frostLevel.panel + 0.08)})`}
            />
            <StatChip
              label="Resistance"
              value={state.resistance || "—"}
              accent={accent}
              chipBg={`rgba(255,255,255,${Math.min(0.7, frostLevel.panel + 0.08)})`}
            />
            <div className="text-center">
              <div
                className="text-[6px] font-bold uppercase tracking-wider"
                style={{ color: look.textMuted }}
              >
                Retreat
              </div>
              <div className="mt-0.5 flex justify-center gap-0.5">
                {Array.from({
                  length: Math.min(4, Math.max(0, state.retreat)),
                }).map((_, i) => (
                  <TypePip key={i} color={state.secondary} size={9} />
                ))}
                {state.retreat <= 0 && (
                  <span className="text-[8px]" style={{ color: look.textMuted }}>
                    —
                  </span>
                )}
              </div>
            </div>
          </div>

          <div
            className="flex items-center justify-between font-[family-name:var(--font-mono)] text-[6px] uppercase tracking-[0.12em]"
            style={{ color: look.textMuted }}
          >
            <span className="min-w-0 truncate">
              {cardFooterMeta(state, look.setCode)}
            </span>
            <span className="flex shrink-0 gap-0.5">
              {Array.from({ length: rarityPips }).map((_, i) => (
                <span
                  key={i}
                  className="inline-block h-1.5 w-1.5 rotate-45"
                  style={{ background: accent }}
                />
              ))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}


function RulesBox({
  state,
  look,
  accent,
  attacks,
  rarityPips,
  setCode,
  compact,
  light,
  dense,
}: {
  state: CardState;
  look: ReturnType<typeof resolveAppearance>;
  accent: string;
  attacks: CardAttack[];
  rarityPips: number;
  setCode: string;
  compact?: boolean;
  light?: boolean;
  dense?: boolean;
}) {
  const chipBg = light ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.35)";
  const shownAttacks = dense ? attacks.slice(0, 2) : attacks;

  return (
    <div
      className={`mx-1.5 mb-1.5 mt-1 flex min-h-[34%] flex-1 flex-col overflow-hidden ${
        compact ? "mx-0 mb-0 min-h-0 border-0 px-0 py-0" : "border px-1.5 py-1"
      }`}
      style={
        compact
          ? { color: look.textInk }
          : {
              background: look.textBox,
              borderColor: `${accent}77`,
              borderRadius: 2,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)",
              color: look.textInk,
            }
      }
    >
      <div className="min-h-0 flex-1 overflow-hidden">
        {state.abilityEnabled && state.ability.name.trim() && (
          <div
            className={`${dense ? "mb-0.5 pb-0.5" : "mb-1 pb-1"} border-b`}
            style={{ borderColor: `${accent}44` }}
          >
            <div className="flex items-center gap-1">
              <span
                className="rounded-sm px-1 py-px text-[7px] font-extrabold uppercase tracking-wide text-white"
                style={{ background: accent }}
              >
                Ability
              </span>
              <span
                className={`min-w-0 truncate font-[family-name:var(--font-display)] text-[10px] font-semibold ${faceTitle}`}
              >
                {state.ability.name}
              </span>
            </div>
            {state.ability.description.trim() && (
              <p
                className={`mt-0.5 text-[8px] ${
                  dense ? faceBodyClamp1 : faceBodyClamp2
                }`}
                style={{ color: look.textMuted }}
              >
                {state.ability.description}
              </p>
            )}
          </div>
        )}

        <div className={dense ? "space-y-0.5" : "space-y-1"}>
          {shownAttacks.map((attack, i) => (
            <AttackRow
              key={`${attack.name}-${i}`}
              attack={attack}
              accent={accent}
              muted={look.textMuted}
              dense={dense}
            />
          ))}
        </div>

        {!dense && state.flavor.trim() && (
          <p
            className={`mt-1 border-t pt-1 text-[7.5px] italic ${faceBodyClamp2}`}
            style={{ borderColor: `${accent}33`, color: look.textMuted }}
          >
            {state.flavor}
          </p>
        )}
      </div>

      <div
        className={`${dense ? "mt-0.5" : "mt-1"} flex shrink-0 items-end justify-between gap-1 border-t pt-1`}
        style={{ borderColor: `${accent}44` }}
      >
        <StatChip
          label="Weakness"
          value={state.weakness || "—"}
          accent={accent}
          chipBg={chipBg}
        />
        <StatChip
          label="Resistance"
          value={state.resistance || "—"}
          accent={accent}
          chipBg={chipBg}
        />
        <div className="text-center">
          <div
            className="text-[6px] font-bold uppercase tracking-wider"
            style={{ color: look.textMuted }}
          >
            Retreat
          </div>
          <div className="mt-0.5 flex justify-center gap-0.5">
            {Array.from({ length: Math.min(4, Math.max(0, state.retreat)) }).map(
              (_, i) => (
                <TypePip key={i} color={state.secondary} size={9} />
              ),
            )}
            {state.retreat <= 0 && (
              <span className="text-[8px]" style={{ color: look.textMuted }}>
                —
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        className={`${dense ? "mt-0.5" : "mt-1"} flex shrink-0 items-center justify-between font-[family-name:var(--font-mono)] text-[6.5px] uppercase tracking-[0.12em]`}
        style={{ color: look.textMuted }}
      >
        <span className="min-w-0 truncate">
          {cardFooterMeta(state, setCode)}
        </span>
        <span className="flex shrink-0 items-center gap-0.5">
          {Array.from({ length: rarityPips }).map((_, i) => (
            <span
              key={i}
              className="inline-block h-1.5 w-1.5 rotate-45"
              style={{ background: accent }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}

function ArtImage({ state, fill }: { state: CardState; fill?: boolean }) {
  if (!state.photoUrl) {
    return (
      <div
        className="flex h-full w-full items-center justify-center text-[11px]"
        style={{
          background: fill
            ? "linear-gradient(160deg, #d8c8a8, #b8a888)"
            : `repeating-linear-gradient(-45deg, #0002, #0002 6px, #fff1 6px, #fff1 12px)`,
          color: fill ? "#3a3020" : "#fff9",
        }}
      >
        Upload portrait art
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={state.photoUrl}
      alt=""
      className="h-full w-full object-cover"
      style={{ objectPosition: `center ${state.cropY}%` }}
      draggable={false}
    />
  );
}

function AttackRow({
  attack,
  accent,
  muted,
  dense,
}: {
  attack: CardAttack;
  accent: string;
  muted: string;
  dense?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-1">
        <div className="flex shrink-0 gap-0.5">
          {Array.from({ length: Math.min(4, Math.max(1, attack.cost)) }).map((_, i) => (
            <TypePip key={i} color={accent} size={dense ? 9 : 10} />
          ))}
        </div>
        <span
          className={`min-w-0 flex-1 truncate font-[family-name:var(--font-brand)] text-[10px] font-bold ${faceTitle}`}
        >
          {attack.name}
        </span>
        <span
          className="shrink-0 font-[family-name:var(--font-brand)] text-[12px] font-extrabold leading-none"
          style={{ color: accent }}
        >
          {attack.damage || "—"}
        </span>
      </div>
      {!dense && attack.description.trim() && (
        <p
          className={`mt-0.5 pl-[2px] text-[7.5px] ${faceBodyClamp2}`}
          style={{ color: muted }}
        >
          {attack.description}
        </p>
      )}
      {dense && attack.description.trim() && (
        <p
          className={`mt-0.5 pl-[2px] text-[7px] ${faceBodyClamp1}`}
          style={{ color: muted }}
        >
          {attack.description}
        </p>
      )}
    </div>
  );
}

function StatChip({
  label,
  value,
  accent,
  chipBg,
}: {
  label: string;
  value: string;
  accent: string;
  chipBg?: string;
}) {
  return (
    <div className="min-w-0 flex-1 text-center">
      <div className="text-[6px] font-bold uppercase tracking-wider opacity-70">{label}</div>
      <div
        className="mt-0.5 truncate rounded-sm border px-1 py-px text-[8px] font-semibold"
        style={{
          borderColor: `${accent}66`,
          background: chipBg ?? "rgba(255,255,255,0.35)",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function TypePip({
  color,
  size,
  ring,
}: {
  color: string;
  size: number;
  ring?: boolean;
}) {
  return (
    <span
      className="inline-block shrink-0 rounded-full"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 30%, #fff9, transparent 45%), ${color}`,
        // Keep the dark rim inside the circle so overflow:hidden parents don't clip it
        boxShadow: ring
          ? "inset 0 0 0 1.5px #1a1810, inset 0 -1px 1px rgba(0,0,0,0.35), inset 1px 1px 0 rgba(255,255,255,0.35)"
          : "inset 0 -1px 1px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(0,0,0,0.15)",
      }}
    />
  );
}

function titleClass(fontTitle: CardTheme["fontTitle"]): string {
  if (fontTitle === "serif") {
    return "font-[family-name:var(--font-display)] text-[12px] font-semibold tracking-tight";
  }
  if (fontTitle === "mono") {
    return "font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-wide";
  }
  return "font-[family-name:var(--font-brand)] text-[12px] font-bold tracking-tight";
}

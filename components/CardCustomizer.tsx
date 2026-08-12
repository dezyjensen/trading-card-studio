"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AccordionContinue,
  AccordionSection,
} from "@/components/AccordionSection";
import { PhotoUpload, ART_WINDOW_ASPECT, FULL_ART_ASPECT } from "@/components/PhotoUpload";
import { StylePicker } from "@/components/StylePicker";
import { TextOptionBrowser } from "@/components/TextOptionBrowser";
import { collectorLabel } from "@/lib/collectorNumber";
import {
  type TextOption,
  type TextOptionKind,
} from "@/lib/textPresets";
import {
  BODY_PRESETS,
  CLASSIC_ENERGY_TYPES,
  FORMATS,
  FULLART_FROST_OPTIONS,
  FULLART_LIMITS,
  HOLO_OPTIONS,
  RARITIES,
  STAGES,
  TYPE_OPTIONS,
  formatChangePatch,
  getTheme,
  resolveFullArtFrost,
  usesBodyPresets,
  usesClassicEnergy,
  type BodyPreset,
  type CardAttack,
  type CardFormat,
  type CardState,
  type FullArtFrost,
  type HoloOption,
  type Rarity,
  type Stage,
  type ThemeId,
} from "@/lib/themes";

type SectionId =
  | "photo"
  | "format"
  | "style"
  | "sheen"
  | "frost"
  | "body"
  | "identity"
  | "ability"
  | "attacks"
  | "footer"
  | "colors";

type CardCustomizerProps = {
  state: CardState;
  onChange: (patch: Partial<CardState>) => void;
  onThemeChange: (id: ThemeId) => void;
  onClassicTypeChange: (typeLabel: string) => void;
  onPhotoChange: (url: string | null) => void;
};

const field =
  "w-full rounded-xl border border-[var(--line)] bg-[var(--background)] px-3 py-2.5 text-[var(--ink)] outline-none transition focus:border-[var(--brass)]";
const label = "block text-sm font-medium text-[var(--ink-muted)]";

function sectionOrder(format: CardFormat): SectionId[] {
  const order: SectionId[] = ["photo", "format", "style", "sheen"];
  if (format === "fullart") order.push("frost");
  if (usesBodyPresets(format)) order.push("body");
  order.push("identity", "ability", "attacks", "footer", "colors");
  return order;
}

export function CardCustomizer({
  state,
  onChange,
  onThemeChange,
  onClassicTypeChange,
  onPhotoChange,
}: CardCustomizerProps) {
  const [open, setOpen] = useState<SectionId | "">("photo");
  const [hpDraft, setHpDraft] = useState(String(state.hp));
  const [textBrowser, setTextBrowser] = useState<{
    kind: TextOptionKind | "all";
    lockKind: boolean;
    title: string;
    apply: (option: TextOption) => void;
  } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const order = useMemo(() => sectionOrder(state.format), [state.format]);
  const isFullArt = state.format === "fullart";
  const typeChoices =
    usesClassicEnergy(state.format) || state.format === "prism"
      ? [...CLASSIC_ENERGY_TYPES]
      : TYPE_OPTIONS;

  useEffect(() => {
    setHpDraft(String(state.hp));
  }, [state.hp]);

  useEffect(() => {
    if (open === "body" && !usesBodyPresets(state.format)) {
      setOpen("identity");
    }
    if (open === "frost" && state.format !== "fullart") {
      setOpen(usesBodyPresets(state.format) ? "body" : "identity");
    }
  }, [state.format, open]);

  useEffect(() => {
    if (!open || !rootRef.current) return;
    const el = rootRef.current.querySelector(`[data-section="${open}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [open]);

  function advance(from: SectionId) {
    const i = order.indexOf(from);
    const next = order[i + 1];
    setOpen(next ?? "");
  }

  function commitHp() {
    const parsed = Number.parseInt(hpDraft.replace(/[^\d]/g, ""), 10);
    if (Number.isNaN(parsed)) {
      setHpDraft(String(state.hp));
      return;
    }
    const next = Math.min(999, Math.max(1, parsed));
    setHpDraft(String(next));
    onChange({ hp: next });
  }

  function updateAttack(index: 0 | 1, patch: Partial<CardAttack>) {
    const attacks: [CardAttack, CardAttack] = [
      { ...state.attacks[0] },
      { ...state.attacks[1] },
    ];
    attacks[index] = { ...attacks[index], ...patch };
    onChange({ attacks });
  }

  function applyTextOption(option: TextOption, attackIndex?: 0 | 1) {
    if (option.kind === "ability") {
      onChange({
        abilityEnabled: true,
        ability: {
          name: option.title,
          description: option.body,
        },
      });
      return;
    }
    if (option.kind === "attack") {
      const index = attackIndex ?? 0;
      updateAttack(index, {
        name: option.title,
        description: option.body,
        damage: option.damage ?? state.attacks[index].damage,
        cost: option.cost ?? state.attacks[index].cost,
      });
      return;
    }
    if (option.kind === "flavor") {
      onChange({ flavor: option.body || option.title });
    }
  }

  function openTextBrowser(opts: {
    kind: TextOptionKind | "all";
    lockKind?: boolean;
    title: string;
    attackIndex?: 0 | 1;
  }) {
    setTextBrowser({
      kind: opts.kind,
      lockKind: opts.lockKind ?? opts.kind !== "all",
      title: opts.title,
      apply: (option) => applyTextOption(option, opts.attackIndex),
    });
  }

  const formatLabel =
    FORMATS.find((f) => f.id === state.format)?.name ?? state.format;
  const sheenLabel =
    HOLO_OPTIONS.find((h) => h.id === state.holo)?.name ?? "Matte";
  const frostLabel = resolveFullArtFrost(state.fullArtFrost).name;
  const bodyLabel =
    BODY_PRESETS.find((b) => b.id === state.bodyPreset)?.name ?? "Theme";
  const styleLabel =
    state.format === "prism"
      ? "Spectrum crystal"
      : usesClassicEnergy(state.format)
        ? state.typeLabel
        : getTheme(state.themeId).name;
  const stageLabel =
    STAGES.find((s) => s.id === state.stage)?.label ?? state.stage;
  const rarityLabel =
    RARITIES.find((r) => r.id === state.rarity)?.label ?? state.rarity;

  const stepOf = (id: SectionId) => order.indexOf(id) + 1;

  return (
    <div ref={rootRef} className="space-y-3">
      <p className="text-xs text-[var(--ink-muted)]">
        Sections collapse as you go so the preview stays in view. Tap a header
        anytime to reopen it.
      </p>

      <div data-section="photo">
        <AccordionSection
          id="photo"
          step={stepOf("photo")}
          title="Photo"
          summary={state.photoUrl ? "Portrait art added" : "Add portrait art"}
          open={open === "photo"}
          onOpen={(id) => setOpen((id || "") as SectionId | "")}
        >
          <PhotoUpload
            photoUrl={state.photoUrl}
            embedded
            cropAspect={isFullArt ? FULL_ART_ASPECT : ART_WINDOW_ASPECT}
            cropHint={
              isFullArt
                ? "Portrait crop — fills the Full Art card face"
                : "Art-window crop — matches Modern, Classic & Spectrum"
            }
            suggestRecrop={isFullArt}
            onPhotoChange={(url) => {
              onPhotoChange(url);
              if (url) advance("photo");
            }}
          />
          {state.photoUrl && (
            <AccordionContinue
              label="Continue to format"
              onClick={() => advance("photo")}
            />
          )}
        </AccordionSection>
      </div>

      <div data-section="format">
        <AccordionSection
          id="format"
          step={stepOf("format")}
          title="Card format"
          summary={formatLabel}
          open={open === "format"}
          onOpen={(id) => setOpen((id || "") as SectionId | "")}
        >
          <div className="grid grid-cols-2 gap-2">
            {FORMATS.map((fmt) => {
              const selected = state.format === fmt.id;
              return (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => {
                    const nextFormat = fmt.id as CardFormat;
                    const switchingToFullArt =
                      nextFormat === "fullart" && state.format !== "fullart";
                    onChange(formatChangePatch(nextFormat, state));
                    if (switchingToFullArt && state.photoUrl) {
                      // Existing crops are usually 4:3 — send them to reframe
                      setOpen("photo");
                      return;
                    }
                    const nextOrder = sectionOrder(nextFormat);
                    const i = nextOrder.indexOf("format");
                    setOpen(nextOrder[i + 1] ?? "");
                  }}
                  className={`rounded-xl border px-3 py-3 text-left transition ${
                    selected
                      ? "border-[var(--brass)] bg-[var(--brass)]/12 shadow-[0_0_0_1px_var(--brass)]"
                      : "border-[var(--line)] bg-[var(--background)] hover:border-[var(--brass)]/50"
                  }`}
                >
                  <div className="font-[family-name:var(--font-brand)] text-[var(--ink)]">
                    {fmt.name}
                  </div>
                  <div className="mt-0.5 text-xs text-[var(--ink-muted)]">
                    {fmt.description}
                  </div>
                </button>
              );
            })}
          </div>
        </AccordionSection>
      </div>

      <div data-section="style">
        <AccordionSection
          id="style"
          step={stepOf("style")}
          title={
            usesClassicEnergy(state.format)
              ? "Energy type"
              : state.format === "prism"
                ? "Card style"
                : "Theme style"
          }
          summary={styleLabel}
          open={open === "style"}
          onOpen={(id) => setOpen((id || "") as SectionId | "")}
        >
          <StylePicker
            format={state.format}
            themeId={state.themeId}
            typeLabel={state.typeLabel}
            embedded
            onThemeChange={(id) => {
              onThemeChange(id);
              advance("style");
            }}
            onClassicTypeChange={(type) => {
              onClassicTypeChange(type);
              advance("style");
            }}
          />
          {state.format === "prism" && (
            <AccordionContinue
              label="Continue to sheen"
              onClick={() => advance("style")}
            />
          )}
        </AccordionSection>
      </div>

      <div data-section="sheen">
        <AccordionSection
          id="sheen"
          step={stepOf("sheen")}
          title="Promo sheen"
          summary={sheenLabel}
          open={open === "sheen"}
          onOpen={(id) => setOpen((id || "") as SectionId | "")}
        >
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {HOLO_OPTIONS.map((opt) => {
              const selected = state.holo === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onChange({ holo: opt.id as HoloOption });
                    advance("sheen");
                  }}
                  className={`rounded-xl border px-3 py-2.5 text-left transition ${
                    selected
                      ? "border-[var(--brass)] bg-[var(--brass)]/12"
                      : "border-[var(--line)] bg-[var(--background)] hover:border-[var(--brass)]/50"
                  }`}
                >
                  <div className="text-sm font-semibold text-[var(--ink)]">
                    {opt.name}
                  </div>
                  <div className="text-[11px] text-[var(--ink-muted)]">
                    {opt.description}
                  </div>
                </button>
              );
            })}
          </div>
          {state.holo !== "none" && (
            <label className="flex items-center gap-3 text-sm text-[var(--ink-muted)]">
              Sheen intensity
              <input
                type="range"
                min={0.3}
                max={1.6}
                step={0.05}
                value={state.holoIntensity}
                onChange={(e) =>
                  onChange({ holoIntensity: Number(e.target.value) })
                }
                className="w-full accent-[var(--brass)]"
              />
            </label>
          )}
        </AccordionSection>
      </div>

      {isFullArt && (
        <div data-section="frost">
          <AccordionSection
            id="frost"
            step={stepOf("frost")}
            title="Glass frost"
            summary={frostLabel}
            open={open === "frost"}
            onOpen={(id) => setOpen((id || "") as SectionId | "")}
          >
            <p className="text-xs text-[var(--ink-muted)]">
              How opaque the frosted text panels sit over your photo.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {FULLART_FROST_OPTIONS.map((opt) => {
                const selected =
                  (state.fullArtFrost || "soft") === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onChange({ fullArtFrost: opt.id as FullArtFrost });
                      advance("frost");
                    }}
                    className={`rounded-xl border px-3 py-2.5 text-left transition ${
                      selected
                        ? "border-[var(--brass)] bg-[var(--brass)]/12"
                        : "border-[var(--line)] bg-[var(--background)] hover:border-[var(--brass)]/50"
                    }`}
                  >
                    <div className="text-sm font-semibold text-[var(--ink)]">
                      {opt.name}
                    </div>
                    <div className="text-[11px] text-[var(--ink-muted)]">
                      {opt.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </AccordionSection>
        </div>
      )}

      {usesBodyPresets(state.format) && (
        <div data-section="body">
          <AccordionSection
            id="body"
            step={stepOf("body")}
            title="Card body"
            summary={bodyLabel}
            open={open === "body"}
            onOpen={(id) => setOpen((id || "") as SectionId | "")}
          >
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {BODY_PRESETS.map((body) => {
                const selected = state.bodyPreset === body.id;
                return (
                  <button
                    key={body.id}
                    type="button"
                    title={body.name}
                    onClick={() => {
                      onChange({ bodyPreset: body.id as BodyPreset });
                      advance("body");
                    }}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-2 transition ${
                      selected
                        ? "border-[var(--brass)] shadow-[0_0_0_1px_var(--brass)]"
                        : "border-[var(--line)] bg-[var(--background)] hover:border-[var(--brass)]/50"
                    }`}
                  >
                    <span
                      className="h-8 w-full rounded-md border border-black/10"
                      style={{ background: body.swatch }}
                    />
                    <span className="text-[10px] text-[var(--ink-muted)]">
                      {body.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </AccordionSection>
        </div>
      )}

      <div data-section="identity">
        <AccordionSection
          id="identity"
          step={stepOf("identity")}
          title="Identity"
          summary={`${state.name || "Untitled"} · HP ${state.hp} · ${stageLabel}`}
          open={open === "identity"}
          onOpen={(id) => setOpen((id || "") as SectionId | "")}
        >
          {isFullArt && (
            <p className="text-xs text-[var(--ink-muted)]">
              Full Art puts short text over the photo — keep names and effects
              brief.
            </p>
          )}
          <div className="space-y-2">
            <label htmlFor="card-name" className={label}>
              Name
            </label>
            <input
              id="card-name"
              type="text"
              maxLength={isFullArt ? FULLART_LIMITS.name : 22}
              value={state.name}
              onChange={(e) => onChange({ name: e.target.value })}
              className={field}
              placeholder="Card title"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label htmlFor="hp" className={label}>
                HP
              </label>
              <input
                id="hp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={hpDraft}
                onChange={(e) =>
                  setHpDraft(e.target.value.replace(/[^\d]/g, "").slice(0, 3))
                }
                onBlur={commitHp}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                }}
                className={field}
                placeholder="120"
              />
            </div>
            {!usesClassicEnergy(state.format) && (
              <div className="space-y-2">
                <label htmlFor="type" className={label}>
                  Type label
                </label>
                <select
                  id="type"
                  value={state.typeLabel}
                  onChange={(e) => onChange({ typeLabel: e.target.value })}
                  className={field}
                >
                  {typeChoices.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="stage" className={label}>
                Stage
              </label>
              <select
                id="stage"
                value={state.stage}
                onChange={(e) => onChange({ stage: e.target.value as Stage })}
                className={field}
              >
                {STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="rarity" className={label}>
                Rarity
              </label>
              <select
                id="rarity"
                value={state.rarity}
                onChange={(e) => onChange({ rarity: e.target.value as Rarity })}
                className={field}
              >
                {RARITIES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <AccordionContinue
            label="Continue to ability"
            onClick={() => advance("identity")}
          />
        </AccordionSection>
      </div>

      <div data-section="ability">
        <AccordionSection
          id="ability"
          step={stepOf("ability")}
          title="Ability"
          summary={
            state.abilityEnabled
              ? state.ability.name || "Shown on card"
              : "Hidden on card"
          }
          open={open === "ability"}
          onOpen={(id) => setOpen((id || "") as SectionId | "")}
        >
          <div className="rounded-xl border border-[var(--line)] bg-[var(--background)] p-3">
            <p className={label}>Card text library</p>
            <p className="mt-0.5 text-xs text-[var(--ink-muted)]">
              Search ready-made abilities, attacks, and flavor lines for pets,
              partners, kids, and family — or write your own below.
            </p>
            <button
              type="button"
              onClick={() =>
                openTextBrowser({
                  kind: "all",
                  lockKind: false,
                  title: "Card text library",
                })
              }
              className="mt-3 min-h-11 w-full rounded-xl bg-[var(--brass)] px-4 text-sm font-semibold text-[#1a140c] transition hover:brightness-110"
            >
              Open text library
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChange({ abilityEnabled: true })}
              className={`min-h-11 rounded-xl text-sm font-semibold transition ${
                state.abilityEnabled
                  ? "bg-[var(--brass)] text-[#1a140c]"
                  : "border border-[var(--line)] text-[var(--ink-muted)] hover:border-[var(--brass)] hover:text-[var(--ink)]"
              }`}
            >
              Show ability
            </button>
            <button
              type="button"
              onClick={() => onChange({ abilityEnabled: false })}
              className={`min-h-11 rounded-xl text-sm font-semibold transition ${
                !state.abilityEnabled
                  ? "bg-[var(--ink)] text-[var(--background)]"
                  : "border border-[var(--line)] text-[var(--ink-muted)] hover:border-[var(--brass)] hover:text-[var(--ink)]"
              }`}
            >
              Hide ability
            </button>
          </div>

          {state.abilityEnabled ? (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="ability-name" className={label}>
                    Ability name
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      openTextBrowser({
                        kind: "ability",
                        title: "Choose an ability",
                      })
                    }
                    className="text-xs font-semibold text-[var(--brass)] underline-offset-2 hover:underline"
                  >
                    From library
                  </button>
                </div>
                <input
                  id="ability-name"
                  type="text"
                  maxLength={isFullArt ? FULLART_LIMITS.abilityName : 28}
                  value={state.ability.name}
                  onChange={(e) => {
                    onChange({
                      ability: { ...state.ability, name: e.target.value },
                    });
                  }}
                  className={field}
                  placeholder="Ability name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="ability-desc" className={label}>
                  Ability text
                </label>
                <textarea
                  id="ability-desc"
                  maxLength={
                    isFullArt ? FULLART_LIMITS.abilityDescription : 160
                  }
                  rows={2}
                  value={state.ability.description}
                  onChange={(e) => {
                    onChange({
                      ability: {
                        ...state.ability,
                        description: e.target.value,
                      },
                    });
                  }}
                  className={`${field} resize-none`}
                  placeholder="What does this ability do?"
                />
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--background)] px-3 py-3 text-sm text-[var(--ink-muted)]">
              Ability is hidden — it won’t print on the card face. Your saved
              text stays if you show it again.
              {state.ability.name.trim() ? (
                <span className="mt-1 block text-[var(--ink)]">
                  Saved: “{state.ability.name}”
                </span>
              ) : null}
            </div>
          )}
          <AccordionContinue
            label="Continue to attacks"
            onClick={() => advance("ability")}
          />
        </AccordionSection>
      </div>

      <div data-section="attacks">
        <AccordionSection
          id="attacks"
          step={stepOf("attacks")}
          title="Attacks"
          summary={
            state.attacks
              .filter((a) => a.name.trim())
              .map((a) => a.name)
              .join(" · ") || "Add attack names"
          }
          open={open === "attacks"}
          onOpen={(id) => setOpen((id || "") as SectionId | "")}
        >
          {isFullArt && (
            <p className="text-xs text-[var(--ink-muted)]">
              Prefer short attack names; effect text is clamped on Full Art.
            </p>
          )}
          {([0, 1] as const).map((index) => (
            <div
              key={index}
              className="space-y-3 rounded-xl border border-[var(--line)] bg-[var(--background)] p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
                  Attack {index + 1}
                  {index === 1 ? " (optional)" : ""}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    openTextBrowser({
                      kind: "attack",
                      title: `Choose attack ${index + 1}`,
                      attackIndex: index,
                    })
                  }
                  className="text-xs font-semibold text-[var(--brass)] underline-offset-2 hover:underline"
                >
                  From library
                </button>
              </div>
              <div className="grid grid-cols-[1fr_72px_64px] gap-2">
                <input
                  type="text"
                  maxLength={isFullArt ? FULLART_LIMITS.attackName : 22}
                  value={state.attacks[index].name}
                  onChange={(e) => updateAttack(index, { name: e.target.value })}
                  className={field}
                  placeholder="Name"
                />
                <input
                  type="text"
                  maxLength={4}
                  value={state.attacks[index].damage}
                  onChange={(e) =>
                    updateAttack(index, { damage: e.target.value })
                  }
                  className={field}
                  placeholder="Dmg"
                />
                <input
                  type="number"
                  min={1}
                  max={4}
                  value={state.attacks[index].cost}
                  onChange={(e) =>
                    updateAttack(index, {
                      cost: Math.min(
                        4,
                        Math.max(1, Number(e.target.value) || 1),
                      ),
                    })
                  }
                  className={field}
                  title="Energy cost"
                />
              </div>
              <textarea
                maxLength={
                  isFullArt ? FULLART_LIMITS.attackDescription : 120
                }
                rows={2}
                value={state.attacks[index].description}
                onChange={(e) =>
                  updateAttack(index, { description: e.target.value })
                }
                className={`${field} resize-none`}
                placeholder="Attack effect text"
              />
            </div>
          ))}
          <AccordionContinue
            label="Continue to footer"
            onClick={() => advance("attacks")}
          />
        </AccordionSection>
      </div>

      <div data-section="footer">
        <AccordionSection
          id="footer"
          step={stepOf("footer")}
          title="Footer stats"
          summary={`${rarityLabel} · ${state.weakness || "No weak"} / ${state.resistance || "No resist"}`}
          open={open === "footer"}
          onOpen={(id) => setOpen((id || "") as SectionId | "")}
        >
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <label htmlFor="weakness" className={label}>
                Weakness
              </label>
              <select
                id="weakness"
                value={state.weakness}
                onChange={(e) => onChange({ weakness: e.target.value })}
                className={field}
              >
                <option value="">None</option>
                {typeChoices.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="resistance" className={label}>
                Resistance
              </label>
              <select
                id="resistance"
                value={state.resistance}
                onChange={(e) => onChange({ resistance: e.target.value })}
                className={field}
              >
                <option value="">None</option>
                {typeChoices.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="retreat" className={label}>
                Retreat
              </label>
              <input
                id="retreat"
                type="number"
                min={0}
                max={4}
                value={state.retreat}
                onChange={(e) =>
                  onChange({
                    retreat: Math.min(
                      4,
                      Math.max(0, Number(e.target.value) || 0),
                    ),
                  })
                }
                className={field}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="flavor" className={label}>
                Flavor text
              </label>
              <button
                type="button"
                onClick={() =>
                  openTextBrowser({
                    kind: "flavor",
                    title: "Choose flavor text",
                  })
                }
                className="text-xs font-semibold text-[var(--brass)] underline-offset-2 hover:underline"
              >
                From library
              </button>
            </div>
            <textarea
              id="flavor"
              maxLength={isFullArt ? FULLART_LIMITS.flavor : 120}
              rows={2}
              value={state.flavor}
              onChange={(e) => onChange({ flavor: e.target.value })}
              className={`${field} resize-none`}
              placeholder={
                isFullArt
                  ? "Optional — hidden on Full Art face"
                  : "Italic lore line at the bottom"
              }
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="illus" className={label}>
              Illustrator
            </label>
            <input
              id="illus"
              type="text"
              maxLength={24}
              value={state.illustrator}
              onChange={(e) => onChange({ illustrator: e.target.value })}
              className={field}
              placeholder="Your name"
            />
          </div>

          <div className="rounded-xl border border-[var(--line)] bg-[var(--background)] px-3 py-2.5">
            <p className="text-xs font-medium text-[var(--ink-muted)]">
              Print number
            </p>
            <p className="mt-0.5 font-[family-name:var(--font-mono)] text-sm font-semibold text-[var(--ink)]">
              {collectorLabel()} — every Keepsleeve card is a one-of-one
            </p>
          </div>
          <AccordionContinue
            label="Continue to colors"
            onClick={() => advance("footer")}
          />
        </AccordionSection>
      </div>

      <div data-section="colors">
        <AccordionSection
          id="colors"
          step={stepOf("colors")}
          title="Colors"
          summary={`${state.accent} · ${state.secondary}`}
          open={open === "colors"}
          onOpen={(id) => setOpen((id || "") as SectionId | "")}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="accent" className={label}>
                Accent
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="accent"
                  type="color"
                  value={state.accent}
                  onChange={(e) => onChange({ accent: e.target.value })}
                  className="h-10 w-12 cursor-pointer rounded-lg border border-[var(--line)] bg-transparent p-1"
                />
                <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--ink-muted)]">
                  {state.accent}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="secondary" className={label}>
                Secondary
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="secondary"
                  type="color"
                  value={state.secondary}
                  onChange={(e) => onChange({ secondary: e.target.value })}
                  className="h-10 w-12 cursor-pointer rounded-lg border border-[var(--line)] bg-transparent p-1"
                />
                <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--ink-muted)]">
                  {state.secondary}
                </span>
              </div>
            </div>
          </div>

          {state.photoUrl && (
            <div className="space-y-2">
              <label htmlFor="crop" className={label}>
                Photo position
              </label>
              <input
                id="crop"
                type="range"
                min={0}
                max={100}
                value={state.cropY}
                onChange={(e) => onChange({ cropY: Number(e.target.value) })}
                className="w-full accent-[var(--brass)]"
              />
            </div>
          )}
          <AccordionContinue label="Done" onClick={() => setOpen("")} />
        </AccordionSection>
      </div>

      {textBrowser && (
        <TextOptionBrowser
          open
          initialKind={textBrowser.kind}
          lockKind={textBrowser.lockKind}
          title={textBrowser.title}
          onClose={() => setTextBrowser(null)}
          onPick={textBrowser.apply}
        />
      )}
    </div>
  );
}

export type ThemeId =
  | "aurora"
  | "ember"
  | "noir"
  | "arcade"
  | "garden";

export type FoilFinish = "foil" | "etched" | "galaxy" | "oil-slick";
export type HoloOption = "none" | FoilFinish;
export type CardFormat = "standard" | "classic" | "fullart" | "prism";

/** Full Art keeps chrome short so the photo stays dominant. */
export const FULLART_LIMITS = {
  name: 18,
  abilityName: 18,
  abilityDescription: 72,
  attackName: 16,
  attackDescription: 56,
  flavor: 56,
  maxAttacks: 2,
} as const;

export type FullArtFrost = "clear" | "soft" | "solid";

export const FULLART_FROST_OPTIONS: {
  id: FullArtFrost;
  name: string;
  description: string;
  panel: number;
  chip: number;
  blur: number;
  veil: number;
}[] = [
  {
    id: "clear",
    name: "Clear",
    description: "Most art shows through",
    panel: 0.42,
    chip: 0.52,
    blur: 10,
    veil: 0.28,
  },
  {
    id: "soft",
    name: "Soft",
    description: "Balanced glass default",
    panel: 0.55,
    chip: 0.64,
    blur: 12,
    veil: 0.38,
  },
  {
    id: "solid",
    name: "Solid",
    description: "Max readability",
    panel: 0.78,
    chip: 0.86,
    blur: 14,
    veil: 0.55,
  },
];

export function resolveFullArtFrost(id: FullArtFrost | undefined) {
  return (
    FULLART_FROST_OPTIONS.find((o) => o.id === id) ?? FULLART_FROST_OPTIONS[1]
  );
}

export type BodyPreset =
  | "theme"
  | "cream"
  | "classic-yellow"
  | "white"
  | "slate"
  | "charcoal";
export type Rarity = "common" | "uncommon" | "rare" | "mythic";
export type Stage = "basic" | "stage1" | "stage2" | "legend";

export type CardAbility = {
  name: string;
  description: string;
};

export type CardAttack = {
  name: string;
  description: string;
  damage: string;
  cost: number;
};

export type CardTheme = {
  id: ThemeId;
  name: string;
  description: string;
  defaultAccent: string;
  defaultSecondary: string;
  frameOuter: string;
  frameInner: string;
  artMatte: string;
  textBox: string;
  textInk: string;
  textMuted: string;
  titleColor: string;
  plateColor: string;
  plateText: string;
  fontTitle: "display" | "serif" | "mono";
  radius: number;
  foil: FoilFinish;
  foilIntensity: number;
  defaultType: string;
  setCode: string;
};

export const RARITIES: { id: Rarity; label: string; pips: number }[] = [
  { id: "common", label: "Common", pips: 1 },
  { id: "uncommon", label: "Uncommon", pips: 2 },
  { id: "rare", label: "Rare", pips: 3 },
  { id: "mythic", label: "Mythic", pips: 4 },
];

export const STAGES: { id: Stage; label: string }[] = [
  { id: "basic", label: "Basic" },
  { id: "stage1", label: "Stage 1" },
  { id: "stage2", label: "Stage 2" },
  { id: "legend", label: "Legendary" },
];

export const FORMATS: {
  id: CardFormat;
  name: string;
  description: string;
}[] = [
  {
    id: "standard",
    name: "Modern",
    description: "Theme styles · collectible layout",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Yellow border · Fire, Water, Grass…",
  },
  {
    id: "fullart",
    name: "Full Art",
    description: "Edge-to-edge portrait art · text over the photo",
  },
  {
    id: "prism",
    name: "Spectrum",
    description: "Fixed rainbow crystal finish",
  },
];

/** Energy types used by Classic — these drive the face tint, not decorative themes. */
export const CLASSIC_ENERGY_TYPES = [
  "Fire",
  "Water",
  "Grass",
  "Electric",
  "Psychic",
  "Fighting",
  "Dark",
  "Metal",
  "Fairy",
  "Dragon",
  "Colorless",
] as const;

export type ClassicEnergyType = (typeof CLASSIC_ENERGY_TYPES)[number];

export function isClassicEnergyType(value: string): value is ClassicEnergyType {
  return (CLASSIC_ENERGY_TYPES as readonly string[]).includes(value);
}

export const HOLO_OPTIONS: {
  id: HoloOption;
  name: string;
  description: string;
}[] = [
  { id: "none", name: "Matte", description: "No foil sheen" },
  { id: "foil", name: "Rainbow Foil", description: "Classic promo rainbow" },
  { id: "etched", name: "Etched", description: "Soft silver sheen" },
  { id: "galaxy", name: "Cosmos", description: "Galaxy sparkle" },
  { id: "oil-slick", name: "Oil Slick", description: "Dark iridescent" },
];

export const BODY_PRESETS: {
  id: BodyPreset;
  name: string;
  swatch: string;
  frameInner: string;
  textBox: string;
  plateColor: string;
  textInk: string;
  textMuted: string;
  plateText: string;
  titleColor: string;
}[] = [
  {
    id: "theme",
    name: "Match style",
    swatch: "linear-gradient(135deg,#c8d0d8,#e8e0d0)",
    frameInner: "",
    textBox: "",
    plateColor: "",
    textInk: "",
    textMuted: "",
    plateText: "",
    titleColor: "",
  },
  {
    id: "cream",
    name: "Cream",
    swatch: "#f0e6d2",
    frameInner: "linear-gradient(180deg, #f2eadc 0%, #e4d8c0 100%)",
    textBox: "linear-gradient(180deg, #f8f0e0 0%, #ebe0cc 100%)",
    plateColor: "linear-gradient(180deg, #fff8ec, #eadcc4)",
    textInk: "#2a2418",
    textMuted: "#5a5040",
    plateText: "#2a2418",
    titleColor: "#2a2418",
  },
  {
    id: "classic-yellow",
    name: "Classic Yellow",
    swatch: "#f0d848",
    frameInner: "linear-gradient(180deg, #f8e878 0%, #e8d040 100%)",
    textBox: "linear-gradient(180deg, #fff8d8 0%, #f0e8b8 100%)",
    plateColor: "linear-gradient(180deg, #ffe850, #f0d020)",
    textInk: "#2a2410",
    textMuted: "#5a5028",
    plateText: "#2a2410",
    titleColor: "#2a2410",
  },
  {
    id: "white",
    name: "White",
    swatch: "#f5f5f5",
    frameInner: "linear-gradient(180deg, #fafafa 0%, #e8e8e8 100%)",
    textBox: "linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%)",
    plateColor: "linear-gradient(180deg, #ffffff, #ececec)",
    textInk: "#1a1a1a",
    textMuted: "#555555",
    plateText: "#1a1a1a",
    titleColor: "#1a1a1a",
  },
  {
    id: "slate",
    name: "Slate",
    swatch: "#4a5560",
    frameInner: "linear-gradient(180deg, #4a5560 0%, #343c44 100%)",
    textBox: "linear-gradient(180deg, #3a424a 0%, #2a3038 100%)",
    plateColor: "linear-gradient(180deg, #5a6570, #404850)",
    textInk: "#e8ecef",
    textMuted: "#a8b0b8",
    plateText: "#f0f4f8",
    titleColor: "#f0f4f8",
  },
  {
    id: "charcoal",
    name: "Charcoal",
    swatch: "#2a2a2a",
    frameInner: "linear-gradient(180deg, #2e2e2e 0%, #1a1a1a 100%)",
    textBox: "linear-gradient(180deg, #242424 0%, #141414 100%)",
    plateColor: "linear-gradient(180deg, #3a3a3a, #222)",
    textInk: "#ececec",
    textMuted: "#9a9a9a",
    plateText: "#f5f5f5",
    titleColor: "#f5f5f5",
  },
];

export const TYPE_OPTIONS = [
  "Fire",
  "Water",
  "Grass",
  "Electric",
  "Psychic",
  "Fighting",
  "Dark",
  "Metal",
  "Fairy",
  "Dragon",
  "Colorless",
  "Spirit",
  "Inferno",
  "Shadow",
  "Pixel",
  "Bloom",
];

/** Classic vintage energy / type pip colors */
export const CLASSIC_TYPE_COLORS: Record<string, string> = {
  Fire: "#e06028",
  Water: "#3090d0",
  Grass: "#3aa050",
  Electric: "#f0c020",
  Psychic: "#c040a0",
  Fighting: "#c06030",
  Dark: "#4a4060",
  Metal: "#8a9098",
  Fairy: "#e890b8",
  Dragon: "#7868b8",
  Colorless: "#a8a090",
  Spirit: "#6898c8",
  Inferno: "#e06028",
  Shadow: "#4a4060",
  Pixel: "#d03060",
  Bloom: "#3aa050",
};

/**
 * Classic vintage type face fills — the whole card body is tinted by type,
 * which is the biggest visual difference from modern bordered templates.
 */
export const CLASSIC_TYPE_FACES: Record<string, string> = {
  Fire: "linear-gradient(180deg, #f8c8a0 0%, #f0a878 45%, #e89060 100%)",
  Water: "linear-gradient(180deg, #b8dcf0 0%, #90c8e8 45%, #78b0d8 100%)",
  Grass: "linear-gradient(180deg, #c8e8a8 0%, #a8d888 45%, #90c870 100%)",
  Electric: "linear-gradient(180deg, #f8f0a0 0%, #f0e070 45%, #e8d050 100%)",
  Psychic: "linear-gradient(180deg, #e8c0e0 0%, #d8a0d0 45%, #c888c0 100%)",
  Fighting: "linear-gradient(180deg, #e0c0a0 0%, #d0a880 45%, #c09068 100%)",
  Dark: "linear-gradient(180deg, #9088a0 0%, #706888 45%, #585070 100%)",
  Metal: "linear-gradient(180deg, #d0d4d8 0%, #b0b8c0 45%, #989ea8 100%)",
  Fairy: "linear-gradient(180deg, #f8d0e0 0%, #f0b0d0 45%, #e898c0 100%)",
  Dragon: "linear-gradient(180deg, #c8c0e0 0%, #b0a0d0 45%, #9888c0 100%)",
  Colorless: "linear-gradient(180deg, #e8e4d8 0%, #d8d0c0 45%, #c8c0b0 100%)",
  Spirit: "linear-gradient(180deg, #c0d8e8 0%, #a0c0d8 45%, #88a8c8 100%)",
  Inferno: "linear-gradient(180deg, #f8c8a0 0%, #f0a878 45%, #e89060 100%)",
  Shadow: "linear-gradient(180deg, #9088a0 0%, #706888 45%, #585070 100%)",
  Pixel: "linear-gradient(180deg, #f0c0d0 0%, #e098b0 45%, #d07898 100%)",
  Bloom: "linear-gradient(180deg, #c8e8a8 0%, #a8d888 45%, #90c870 100%)",
};

export function classicTypeFace(typeLabel: string): string {
  return (
    CLASSIC_TYPE_FACES[typeLabel] ??
    "linear-gradient(180deg, #e8e0d0 0%, #d8d0c0 100%)"
  );
}

export const THEMES: CardTheme[] = [
  {
    id: "aurora",
    name: "Aurora",
    description: "Crystal border · cool accents",
    defaultAccent: "#3a8fa8",
    defaultSecondary: "#c9a24a",
    frameOuter:
      "linear-gradient(145deg, #2a4a5c 0%, #5a8aa0 30%, #1e3848 55%, #7ab0c4 85%, #2a4a5c 100%)",
    frameInner: "linear-gradient(180deg, #d8e8f0 0%, #b8d0dc 100%)",
    artMatte: "#1a3040",
    textBox: "linear-gradient(180deg, #f4ead8 0%, #e8dcc4 100%)",
    textInk: "#2a2418",
    textMuted: "#5a5040",
    titleColor: "#1a3040",
    plateColor: "linear-gradient(180deg, #f0f6fa, #c8dce8)",
    plateText: "#1a3040",
    fontTitle: "serif",
    radius: 12,
    foil: "galaxy",
    foilIntensity: 0.85,
    defaultType: "Water",
    setCode: "AUR",
  },
  {
    id: "ember",
    name: "Ember",
    description: "Gold rim · warm accents",
    defaultAccent: "#c47828",
    defaultSecondary: "#8a3018",
    frameOuter:
      "linear-gradient(160deg, #5a3018 0%, #c49040 25%, #3a2010 50%, #e0a848 80%, #4a2814 100%)",
    frameInner: "linear-gradient(180deg, #f0d8b0 0%, #d8b888 100%)",
    artMatte: "#3a2010",
    textBox: "linear-gradient(180deg, #f6ecd8 0%, #e4d4b4 100%)",
    textInk: "#2a1c10",
    textMuted: "#6a5040",
    titleColor: "#2a1408",
    plateColor: "linear-gradient(180deg, #fff0d0, #e8c888)",
    plateText: "#2a1408",
    fontTitle: "serif",
    radius: 10,
    foil: "foil",
    foilIntensity: 1.05,
    defaultType: "Fire",
    setCode: "EMB",
  },
  {
    id: "noir",
    name: "Noir",
    description: "Black & gold antique",
    defaultAccent: "#c4a040",
    defaultSecondary: "#6a5830",
    frameOuter:
      "linear-gradient(180deg, #1a1814 0%, #4a4030 35%, #0c0c0a 60%, #6a5a38 90%, #1a1814 100%)",
    frameInner: "linear-gradient(180deg, #e8e0d0 0%, #d0c8b0 100%)",
    artMatte: "#12100c",
    textBox: "linear-gradient(180deg, #f2eadc 0%, #e0d6c4 100%)",
    textInk: "#1a1810",
    textMuted: "#5a5240",
    titleColor: "#1a1810",
    plateColor: "linear-gradient(180deg, #f8f0dc, #d8ccaa)",
    plateText: "#1a1810",
    fontTitle: "serif",
    radius: 6,
    foil: "etched",
    foilIntensity: 0.8,
    defaultType: "Dark",
    setCode: "NOR",
  },
  {
    id: "arcade",
    name: "Retro Arcade",
    description: "Neon trim print",
    defaultAccent: "#d03060",
    defaultSecondary: "#208868",
    frameOuter:
      "linear-gradient(135deg, #183050 0%, #4080a0 35%, #102038 60%, #50a0c0 90%, #183050 100%)",
    frameInner: "linear-gradient(180deg, #e0ecf4 0%, #c0d4e4 100%)",
    artMatte: "#102030",
    textBox: "linear-gradient(180deg, #f0ece0 0%, #ddd4c4 100%)",
    textInk: "#182028",
    textMuted: "#485860",
    titleColor: "#102030",
    plateColor: "linear-gradient(180deg, #f4f8fc, #c8dce8)",
    plateText: "#102030",
    fontTitle: "mono",
    radius: 4,
    foil: "oil-slick",
    foilIntensity: 1.0,
    defaultType: "Electric",
    setCode: "ARC",
  },
  {
    id: "garden",
    name: "Garden",
    description: "Vintage botanical",
    defaultAccent: "#3a7848",
    defaultSecondary: "#88a858",
    frameOuter:
      "linear-gradient(160deg, #2a4830 0%, #68a070 30%, #1a3020 55%, #88b878 85%, #2a4830 100%)",
    frameInner: "linear-gradient(180deg, #e4f0dc 0%, #c8dcb8 100%)",
    artMatte: "#1a3020",
    textBox: "linear-gradient(180deg, #f2f0e4 0%, #e0dcc8 100%)",
    textInk: "#1e2a18",
    textMuted: "#4a5840",
    titleColor: "#1a2a18",
    plateColor: "linear-gradient(180deg, #f4f8ec, #d0e0c0)",
    plateText: "#1a2a18",
    fontTitle: "serif",
    radius: 14,
    foil: "foil",
    foilIntensity: 0.75,
    defaultType: "Grass",
    setCode: "GRD",
  },
];

export function getTheme(id: ThemeId): CardTheme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export type CardAppearance = {
  frameOuter: string;
  frameInner: string;
  artMatte: string;
  textBox: string;
  textInk: string;
  textMuted: string;
  titleColor: string;
  plateColor: string;
  plateText: string;
  radius: number;
  foil: HoloOption;
  foilIntensity: number;
  fontTitle: CardTheme["fontTitle"];
  setCode: string;
};

export function resolveAppearance(state: CardState): CardAppearance {
  const theme = getTheme(state.themeId);
  const body = BODY_PRESETS.find((b) => b.id === state.bodyPreset);
  const typeKey = state.typeLabel;

  if (state.format === "classic") {
    // Body preset only overrides when user explicitly picks one; default = type face
    const face =
      body && body.id !== "theme" ? body.frameInner : classicTypeFace(typeKey);
    return {
      // Classic always keeps the vintage yellow stock border
      frameOuter:
        "linear-gradient(180deg, #f2d84a 0%, #e8c820 40%, #d4b018 70%, #c9a010 100%)",
      frameInner: face,
      artMatte: "#1a1810",
      textBox: "linear-gradient(180deg, #fffef5 0%, #f5edd8 100%)",
      textInk: "#1a1810",
      textMuted: "#4a4030",
      titleColor: "#1a1810",
      plateColor: "transparent",
      plateText: "#1a1810",
      radius: 5,
      foil: state.holo,
      foilIntensity: state.holoIntensity * 0.75,
      fontTitle: "serif",
      setCode: theme.setCode,
    };
  }

  if (state.format === "prism") {
    const prismFoil =
      state.holo === "none" ? "foil" : state.holo;
    return {
      frameOuter:
        "linear-gradient(135deg, #ff6b9d 0%, #ffc93c 18%, #6bffb8 36%, #6bc5ff 54%, #b388ff 72%, #ff6b9d 100%)",
      frameInner:
        body && body.id !== "theme"
          ? body.frameInner
          : "linear-gradient(180deg, #fffbff 0%, #f4f0ff 40%, #fff8f4 100%)",
      artMatte: "#1a1220",
      textBox:
        "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(245,240,255,0.95) 50%, rgba(255,248,252,0.95) 100%)",
      textInk: "#1a1228",
      textMuted: "#5a5070",
      titleColor: "#1a1228",
      plateColor:
        "linear-gradient(90deg, #fff0f8, #f0f4ff, #f8fff4, #fff8e8, #fff0f8)",
      plateText: "#1a1228",
      radius: 14,
      foil: prismFoil,
      foilIntensity: Math.max(state.holoIntensity, 1.15),
      fontTitle: "display",
      setCode: theme.setCode,
    };
  }

  if (state.format === "fullart") {
    return {
      frameOuter: `linear-gradient(145deg, ${state.accent}cc 0%, #f5f0e6 35%, ${state.secondary}cc 100%)`,
      frameInner: "transparent",
      artMatte: "#0a0a0a",
      // Light frosted panel — art stays readable
      textBox:
        "linear-gradient(180deg, rgba(255,252,245,0.55) 0%, rgba(255,250,240,0.88) 55%, rgba(248,242,230,0.94) 100%)",
      textInk: "#1a1810",
      textMuted: "#5a5040",
      titleColor: "#1a1810",
      plateColor: "rgba(255,252,245,0.72)",
      plateText: "#1a1810",
      radius: 12,
      foil: state.holo,
      foilIntensity: state.holoIntensity,
      fontTitle: theme.fontTitle,
      setCode: theme.setCode,
    };
  }

  // standard
  return {
    frameOuter: theme.frameOuter,
    frameInner:
      body && body.id !== "theme" ? body.frameInner : theme.frameInner,
    artMatte: theme.artMatte,
    textBox: body && body.id !== "theme" ? body.textBox : theme.textBox,
    textInk: body && body.id !== "theme" ? body.textInk : theme.textInk,
    textMuted: body && body.id !== "theme" ? body.textMuted : theme.textMuted,
    titleColor:
      body && body.id !== "theme" ? body.titleColor : theme.titleColor,
    plateColor:
      body && body.id !== "theme" ? body.plateColor : theme.plateColor,
    plateText: body && body.id !== "theme" ? body.plateText : theme.plateText,
    radius: theme.radius,
    foil: state.holo === "none" ? "none" : state.holo || theme.foil,
    foilIntensity: state.holoIntensity,
    fontTitle: theme.fontTitle,
    setCode: theme.setCode,
  };
}

export function classicAccent(state: CardState): string {
  if (state.format !== "classic") return state.accent;
  return CLASSIC_TYPE_COLORS[state.typeLabel] ?? state.accent;
}

/** Soft companion accent for classic energy (retreat pips, secondary chrome). */
export const CLASSIC_TYPE_SECONDARIES: Record<string, string> = {
  Fire: "#f0a060",
  Water: "#78b8e0",
  Grass: "#78c070",
  Electric: "#f8e070",
  Psychic: "#d888c8",
  Fighting: "#d89868",
  Dark: "#8880a0",
  Metal: "#c0c4c8",
  Fairy: "#f0b8d0",
  Dragon: "#a898d0",
  Colorless: "#c8c0b0",
};

export function usesThemeStyles(format: CardFormat): boolean {
  return format === "standard" || format === "fullart";
}

export function usesClassicEnergy(format: CardFormat): boolean {
  return format === "classic";
}

export function usesBodyPresets(format: CardFormat): boolean {
  return format === "standard" || format === "fullart";
}

export type CardState = {
  themeId: ThemeId;
  format: CardFormat;
  holo: HoloOption;
  holoIntensity: number;
  bodyPreset: BodyPreset;
  fullArtFrost: FullArtFrost;
  photoUrl: string | null;
  name: string;
  flavor: string;
  accent: string;
  secondary: string;
  cropY: number;
  hp: number;
  rarity: Rarity;
  stage: Stage;
  typeLabel: string;
  illustrator: string;
  /** Legacy field; cards print as 1/1 (one-of-one). */
  collectorNumber?: number | null;
  abilityEnabled: boolean;
  ability: CardAbility;
  attacks: [CardAttack, CardAttack];
  weakness: string;
  resistance: string;
  retreat: number;
};

export function classicTypePatch(typeLabel: string): Partial<CardState> {
  const energy = isClassicEnergyType(typeLabel) ? typeLabel : "Fire";
  return {
    typeLabel: energy,
    accent: CLASSIC_TYPE_COLORS[energy],
    secondary: CLASSIC_TYPE_SECONDARIES[energy] ?? "#c8c0b0",
    bodyPreset: "theme",
  };
}

/** Normalize options when switching card formats. */
export function formatChangePatch(
  format: CardFormat,
  prev: CardState,
): Partial<CardState> {
  if (format === "classic") {
    const energy = isClassicEnergyType(prev.typeLabel)
      ? prev.typeLabel
      : "Fire";
    return {
      format,
      ...classicTypePatch(energy),
    };
  }

  if (format === "prism") {
    return {
      format,
      bodyPreset: "theme",
      holo: prev.holo === "none" ? "foil" : prev.holo,
    };
  }

  if (format === "fullart") {
    const theme = getTheme(prev.themeId);
    return {
      format,
      accent: theme.defaultAccent,
      secondary: theme.defaultSecondary,
      fullArtFrost: prev.fullArtFrost || "soft",
    };
  }

  // Modern keeps decorative themes
  const theme = getTheme(prev.themeId);
  return {
    format,
    accent: theme.defaultAccent,
    secondary: theme.defaultSecondary,
  };
}

export const DEFAULT_CARD_STATE: CardState = {
  themeId: "ember",
  format: "standard",
  holo: "foil",
  holoIntensity: 1,
  bodyPreset: "theme",
  fullArtFrost: "soft",
  photoUrl: null,
  name: "Your Name",
  flavor: "A legendary presence enters the field.",
  accent: THEMES[1].defaultAccent,
  secondary: THEMES[1].defaultSecondary,
  cropY: 50,
  hp: 120,
  rarity: "rare",
  stage: "basic",
  typeLabel: "Fire",
  illustrator: "You",
  abilityEnabled: true,
  ability: {
    name: "Radiant Presence",
    description: "Once per turn, draw a card if this card is your Active.",
  },
  attacks: [
    {
      name: "Spark Strike",
      description: "Flip a coin. If heads, the opponent can’t attack next turn.",
      damage: "30",
      cost: 1,
    },
    {
      name: "Finale Burst",
      description: "Discard an Energy from this card.",
      damage: "80",
      cost: 3,
    },
  ],
  weakness: "Water",
  resistance: "Grass",
  retreat: 2,
};

export type ThemeId =
  | "aurora"
  | "ember"
  | "noir"
  | "arcade"
  | "garden";

export type CardTheme = {
  id: ThemeId;
  name: string;
  description: string;
  defaultAccent: string;
  defaultSecondary: string;
  frame: string;
  panel: string;
  titleColor: string;
  subtitleColor: string;
  badgeBg: string;
  badgeText: string;
  portraitInset: string;
  fontTitle: "display" | "serif" | "mono";
  radius: string;
};

export const THEMES: CardTheme[] = [
  {
    id: "aurora",
    name: "Aurora",
    description: "Soft gem frame with cool pastels",
    defaultAccent: "#5ec8d8",
    defaultSecondary: "#7eb8e8",
    frame:
      "linear-gradient(145deg, #1a2a3a 0%, #2d4a5c 40%, #1e3344 100%)",
    panel: "rgba(12, 24, 36, 0.92)",
    titleColor: "#e8f7fb",
    subtitleColor: "#a8c8d4",
    badgeBg: "rgba(94, 200, 216, 0.2)",
    badgeText: "#9ee8f2",
    portraitInset: "12px",
    fontTitle: "display",
    radius: "18px",
  },
  {
    id: "ember",
    name: "Ember",
    description: "Warm metallic borders and glow",
    defaultAccent: "#e8923a",
    defaultSecondary: "#c44d2a",
    frame:
      "linear-gradient(160deg, #2a1510 0%, #4a2818 45%, #1f100c 100%)",
    panel: "rgba(28, 14, 10, 0.94)",
    titleColor: "#fff0e0",
    subtitleColor: "#d4a888",
    badgeBg: "rgba(232, 146, 58, 0.22)",
    badgeText: "#f0c080",
    portraitInset: "10px",
    fontTitle: "display",
    radius: "10px",
  },
  {
    id: "noir",
    name: "Noir",
    description: "High-contrast dark with gold lines",
    defaultAccent: "#d4af37",
    defaultSecondary: "#8a7a4a",
    frame: "linear-gradient(180deg, #0c0c0c 0%, #1a1a1a 50%, #0a0a0a 100%)",
    panel: "rgba(8, 8, 8, 0.96)",
    titleColor: "#f5f0e6",
    subtitleColor: "#a89e8a",
    badgeBg: "rgba(212, 175, 55, 0.15)",
    badgeText: "#d4af37",
    portraitInset: "8px",
    fontTitle: "serif",
    radius: "4px",
  },
  {
    id: "arcade",
    name: "Retro Arcade",
    description: "Bold geometry and saturated primaries",
    defaultAccent: "#ff3d7a",
    defaultSecondary: "#00d4aa",
    frame: "linear-gradient(135deg, #0a1628 0%, #12283c 50%, #08141f 100%)",
    panel: "rgba(8, 18, 32, 0.94)",
    titleColor: "#ffffff",
    subtitleColor: "#8ab0c8",
    badgeBg: "rgba(255, 61, 122, 0.25)",
    badgeText: "#ff8fb3",
    portraitInset: "8px",
    fontTitle: "mono",
    radius: "2px",
  },
  {
    id: "garden",
    name: "Garden",
    description: "Botanical line-work and soft greens",
    defaultAccent: "#3d7a5a",
    defaultSecondary: "#8fbc8f",
    frame:
      "linear-gradient(160deg, #1a2a1e 0%, #2a4030 40%, #152018 100%)",
    panel: "rgba(16, 28, 20, 0.93)",
    titleColor: "#eef6ee",
    subtitleColor: "#a8c4a8",
    badgeBg: "rgba(61, 122, 90, 0.25)",
    badgeText: "#a8d4b8",
    portraitInset: "14px",
    fontTitle: "serif",
    radius: "22px",
  },
];

export function getTheme(id: ThemeId): CardTheme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export type CardState = {
  themeId: ThemeId;
  photoUrl: string | null;
  name: string;
  subtitle: string;
  accent: string;
  secondary: string;
  cropY: number;
};

export const DEFAULT_CARD_STATE: CardState = {
  themeId: "aurora",
  photoUrl: null,
  name: "Your Name",
  subtitle: "Legendary collectible",
  accent: THEMES[0].defaultAccent,
  secondary: THEMES[0].defaultSecondary,
  cropY: 50,
};

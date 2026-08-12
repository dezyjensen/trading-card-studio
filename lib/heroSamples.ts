import {
  CLASSIC_TYPE_COLORS,
  CLASSIC_TYPE_SECONDARIES,
  DEFAULT_CARD_STATE,
  getTheme,
  type CardState,
} from "@/lib/themes";

function classicEnergy(
  typeLabel: keyof typeof CLASSIC_TYPE_COLORS,
  patch: Partial<CardState>,
): CardState {
  return {
    ...DEFAULT_CARD_STATE,
    format: "classic",
    bodyPreset: "theme",
    typeLabel,
    accent: CLASSIC_TYPE_COLORS[typeLabel],
    secondary: CLASSIC_TYPE_SECONDARIES[typeLabel] ?? "#c8c0b0",
    holo: "foil",
    holoIntensity: 1.15,
    ...patch,
  };
}

function themed(
  themeId: CardState["themeId"],
  format: CardState["format"],
  patch: Partial<CardState>,
): CardState {
  const theme = getTheme(themeId);
  return {
    ...DEFAULT_CARD_STATE,
    themeId,
    format,
    bodyPreset: "theme",
    accent: theme.defaultAccent,
    secondary: theme.defaultSecondary,
    typeLabel: theme.defaultType,
    holo: theme.foil,
    holoIntensity: 1.2,
    ...patch,
  };
}

export type HeroSample = {
  id: string;
  caption: string;
  state: CardState;
};

/**
 * Hero demos — memories of people & pets.
 * Images: Unsplash License (free use). Queried with auto=format for reliability.
 * Order leads with Spectrum + Full Art, then mixes formats.
 */
export const HERO_SAMPLES: HeroSample[] = [
  {
    id: "anniversary-spectrum",
    caption: "Spectrum · Anniversary",
    state: themed("arcade", "prism", {
      name: "Ever After",
      photoUrl:
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=640&h=800&q=80",
      flavor: "Ten years. Same laugh. Still choosing each other.",
      hp: 140,
      rarity: "mythic",
      stage: "legend",
      typeLabel: "Fairy",
      illustrator: "Heart Press",
      holo: "foil",
      holoIntensity: 1.4,
      ability: {
        name: "Vow Glow",
        description: "Once per turn, heal 30 from a memory you hold dear.",
      },
      attacks: [
        {
          name: "Toast",
          description: "Draw a card. Share it with someone nearby.",
          damage: "40",
          cost: 1,
        },
        {
          name: "Forever Spark",
          description: "This attack can’t be forgotten next turn.",
          damage: "90",
          cost: 3,
        },
      ],
      weakness: "Dark",
      resistance: "Fighting",
      retreat: 1,
    }),
  },
  {
    id: "birthday-fullart",
    caption: "Full Art · Birthday",
    state: themed("aurora", "fullart", {
      name: "Candle Kid",
      // Portrait cake with candles — subject sits in upper/mid frame for full-art frost
      photoUrl:
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=640&h=900&q=80&crop=center",
      cropY: 42,
      fullArtFrost: "clear",
      flavor: "Wish hard. Blow once.",
      hp: 80,
      rarity: "mythic",
      stage: "basic",
      typeLabel: "Spirit",
      illustrator: "Party Light",
      holo: "galaxy",
      ability: {
        name: "Make a Wish",
        description: "Search for one happy memory.",
      },
      attacks: [
        {
          name: "Confetti",
          description: "Flip a coin. Smile on heads.",
          damage: "30",
          cost: 1,
        },
        {
          name: "Cake Slice",
          description: "Heal 20 after the party.",
          damage: "60",
          cost: 2,
        },
      ],
      weakness: "Dark",
      resistance: "Fairy",
      retreat: 1,
    }),
  },
  {
    id: "mochi-classic",
    caption: "Classic · Pet",
    state: classicEnergy("Fire", {
      name: "Mochi",
      photoUrl:
        "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=640&h=800&q=80",
      flavor: "Undefeated in the sunbeam arena. Collector of socks.",
      hp: 180,
      rarity: "mythic",
      stage: "legend",
      illustrator: "TCS",
      ability: {
        name: "Nap Shield",
        description:
          "Prevent all damage done to this card during quiet afternoons.",
      },
      attacks: [
        {
          name: "Pounce",
          description: "Does 10 more for each sock claimed.",
          damage: "40",
          cost: 1,
        },
        {
          name: "Zoomies",
          description: "Flip 2 coins. 50 damage for each heads.",
          damage: "50×",
          cost: 3,
        },
      ],
      weakness: "Water",
      resistance: "Grass",
      retreat: 1,
    }),
  },
  {
    id: "love-modern",
    caption: "Modern · Love",
    state: themed("ember", "standard", {
      name: "Soft Landing",
      photoUrl:
        "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=640&h=800&q=80",
      flavor: "Hands held on a Tuesday. Ordinary magic.",
      hp: 110,
      rarity: "rare",
      stage: "stage1",
      typeLabel: "Fairy",
      illustrator: "Warm Type",
      ability: {
        name: "Steady Heart",
        description: "Your other cards take 10 less damage.",
      },
      attacks: [
        {
          name: "Lean In",
          description: "",
          damage: "30",
          cost: 1,
        },
        {
          name: "Promise Kept",
          description: "Heal 40 from one of your Benched memories.",
          damage: "70",
          cost: 2,
        },
      ],
      weakness: "Dark",
      resistance: "Fighting",
      retreat: 2,
    }),
  },
  {
    id: "family-spectrum",
    caption: "Spectrum · Family",
    state: themed("garden", "prism", {
      name: "Kinfolk",
      photoUrl:
        "https://images.unsplash.com/photo-1609220136736-443140cffec6?auto=format&fit=crop&w=640&h=800&q=80",
      flavor: "Same table. Louder every year. Still home.",
      hp: 160,
      rarity: "mythic",
      stage: "legend",
      typeLabel: "Colorless",
      illustrator: "Gather Press",
      holo: "foil",
      holoIntensity: 1.35,
      ability: {
        name: "Belonging",
        description: "Once per turn, draw until you have 5 cards in hand.",
      },
      attacks: [
        {
          name: "Group Hug",
          description: "Heal 20 from each of your cards in play.",
          damage: "20",
          cost: 1,
        },
        {
          name: "Legacy",
          description: "This attack does 30 more for each generation present.",
          damage: "60+",
          cost: 3,
        },
      ],
      weakness: "Fighting",
      resistance: "Psychic",
      retreat: 2,
    }),
  },
  {
    id: "river-classic",
    caption: "Classic · Best Friend",
    state: classicEnergy("Water", {
      name: "River",
      // Face-forward dog portrait so classic art window doesn’t crop the muzzle
      photoUrl:
        "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=640&h=800&q=80&crop=faces",
      cropY: 40,
      flavor: "Chases every ripple. Never loses a staring contest.",
      hp: 90,
      rarity: "rare",
      stage: "basic",
      illustrator: "Harbor Ink",
      abilityEnabled: false,
      ability: { name: "", description: "" },
      attacks: [
        {
          name: "Splash Dash",
          description: "Switch this card with one on the Bench.",
          damage: "20",
          cost: 1,
        },
        {
          name: "Tidal Bark",
          description: "The Defending card can’t retreat next turn.",
          damage: "60",
          cost: 2,
        },
      ],
      weakness: "Electric",
      resistance: "Fire",
      retreat: 2,
    }),
  },
  {
    id: "portrait-fullart",
    caption: "Full Art · Portrait",
    state: themed("noir", "fullart", {
      name: "Golden Hour",
      photoUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=640&h=800&q=80",
      flavor: "Daylight, then dinner.",
      hp: 100,
      rarity: "rare",
      stage: "basic",
      typeLabel: "Spirit",
      illustrator: "Lens & Co.",
      holo: "etched",
      abilityEnabled: true,
      ability: {
        name: "Presence",
        description: "Attacks vs this cost +1 Energy.",
      },
      attacks: [
        {
          name: "Glance",
          description: "",
          damage: "20",
          cost: 1,
        },
        {
          name: "Keep Frame",
          description: "Save this to your binder.",
          damage: "80",
          cost: 3,
        },
      ],
      weakness: "Dark",
      resistance: "Colorless",
      retreat: 1,
    }),
  },
  {
    id: "kids-modern",
    caption: "Modern · Play",
    state: themed("arcade", "standard", {
      name: "Recess",
      photoUrl:
        "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=640&h=800&q=80",
      flavor: "Mud on the knees. Victory in the laugh.",
      hp: 70,
      rarity: "uncommon",
      stage: "basic",
      typeLabel: "Colorless",
      illustrator: "Yard Games",
      abilityEnabled: false,
      ability: { name: "", description: "" },
      attacks: [
        {
          name: "Tag",
          description: "Switch the Defending card with a Benched one.",
          damage: "10",
          cost: 1,
        },
        {
          name: "All Out",
          description: "Flip a coin. If heads, this attack does 40 more.",
          damage: "40+",
          cost: 2,
        },
      ],
      weakness: "Fighting",
      resistance: "",
      retreat: 1,
    }),
  },
];

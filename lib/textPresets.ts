import type { CardState } from "@/lib/themes";

export type TextPresetCategory = "cat" | "dog" | "partner" | "kid" | "family";

export type TextPreset = {
  id: string;
  category: TextPresetCategory;
  /** Short chip label in the studio */
  label: string;
  /** Ability + attacks + flavor (and optional type/HP hints) */
  patch: Pick<
    CardState,
    "abilityEnabled" | "ability" | "attacks" | "flavor"
  > &
    Partial<Pick<CardState, "typeLabel" | "hp" | "stage" | "rarity">>;
};

export const TEXT_PRESET_CATEGORIES: {
  id: TextPresetCategory;
  label: string;
  hint: string;
}[] = [
  { id: "cat", label: "Cat", hint: "Nap kings & chaos agents" },
  { id: "dog", label: "Dog", hint: "Loyal, loud, snack-powered" },
  { id: "partner", label: "Partner", hint: "Couples & co-conspirators" },
  { id: "kid", label: "Kid", hint: "Tiny legends at full volume" },
  { id: "family", label: "Family", hint: "Parents, siblings, home crew" },
];

/**
 * Ready-to-use card copy for personal photos.
 * Avoids trademarked game names — TCG-flavored, memory-focused.
 */
export const TEXT_PRESETS: TextPreset[] = [
  // —— Cats ——
  {
    id: "cat-sunbeam",
    category: "cat",
    label: "Sunbeam boss",
    patch: {
      abilityEnabled: true,
      ability: {
        name: "Sunbeam Claim",
        description:
          "Once per turn, heal 20 if this card is resting in a warm spot.",
      },
      attacks: [
        {
          name: "Loaf Press",
          description: "The defending card can’t retreat next turn.",
          damage: "20",
          cost: 1,
        },
        {
          name: "Midnight Zoomies",
          description: "Flip a coin. If heads, this attack does 40 more.",
          damage: "50",
          cost: 2,
        },
      ],
      flavor: "Undefeated in the sunbeam arena. Collector of socks.",
      typeLabel: "Psychic",
      hp: 90,
    },
  },
  {
    id: "cat-judge",
    category: "cat",
    label: "Judgy stare",
    patch: {
      abilityEnabled: true,
      ability: {
        name: "Silent Judgment",
        description:
          "Your other cards take 10 less damage from judging looks.",
      },
      attacks: [
        {
          name: "Slow Blink",
          description: "Heal 30 from this card.",
          damage: "10",
          cost: 1,
        },
        {
          name: "Knockoff Cascade",
          description: "Discard an item from play. This card looks innocent.",
          damage: "60",
          cost: 3,
        },
      ],
      flavor: "Has opinions. Will not elaborate.",
      typeLabel: "Dark",
      hp: 100,
    },
  },
  {
    id: "cat-snack",
    category: "cat",
    label: "Treat hunter",
    patch: {
      abilityEnabled: true,
      ability: {
        name: "Can Opener Sense",
        description: "Once per turn, draw a card if someone opened the fridge.",
      },
      attacks: [
        {
          name: "Ankle Weave",
          description: "Switch the defending card with a benched one.",
          damage: "30",
          cost: 1,
        },
        {
          name: "Crunch Solo",
          description: "This attack does 20 more for each treat nearby.",
          damage: "70",
          cost: 2,
        },
      ],
      flavor: "Will sell state secrets for tuna.",
      typeLabel: "Water",
      hp: 80,
    },
  },

  // —— Dogs ——
  {
    id: "dog-best",
    category: "dog",
    label: "Best friend",
    patch: {
      abilityEnabled: true,
      ability: {
        name: "Loyal Guard",
        description:
          "Once per turn, prevent 20 damage done to one of your cards.",
      },
      attacks: [
        {
          name: "Tail Wind",
          description: "Draw a card. Everyone feels better.",
          damage: "30",
          cost: 1,
        },
        {
          name: "Full Zoom",
          description: "This attack can’t be blocked by closed doors.",
          damage: "80",
          cost: 3,
        },
      ],
      flavor: "Greets every goodbye like a reunion.",
      typeLabel: "Fighting",
      hp: 130,
    },
  },
  {
    id: "dog-snack",
    category: "dog",
    label: "Snack radar",
    patch: {
      abilityEnabled: true,
      ability: {
        name: "Floor Vacuum",
        description: "Once per turn, heal 10 after any crumb hits the floor.",
      },
      attacks: [
        {
          name: "Puppy Eyes",
          description: "The defending card’s next attack costs +1 Energy.",
          damage: "20",
          cost: 1,
        },
        {
          name: "Counter Surf",
          description: "Flip 2 coins. 30 damage for each heads.",
          damage: "40",
          cost: 2,
        },
      ],
      flavor: "If it fell, it’s already claimed.",
      typeLabel: "Fighting",
      hp: 110,
    },
  },
  {
    id: "dog-park",
    category: "dog",
    label: "Park legend",
    patch: {
      abilityEnabled: true,
      ability: {
        name: "Fetch Instinct",
        description: "Once per turn, search your deck for a memory and add it.",
      },
      attacks: [
        {
          name: "Splash Entry",
          description: "All of your cards heal 10.",
          damage: "40",
          cost: 2,
        },
        {
          name: "Muddy Victory",
          description: "This card can’t retreat next turn — too proud.",
          damage: "90",
          cost: 3,
        },
      ],
      flavor: "Came home with a stick and a story.",
      typeLabel: "Grass",
      hp: 120,
    },
  },

  // —— Partners ——
  {
    id: "partner-everyday",
    category: "partner",
    label: "Everyday magic",
    patch: {
      abilityEnabled: true,
      ability: {
        name: "Quiet Orbit",
        description:
          "Once per turn, heal 30 from a memory you hold dear.",
      },
      attacks: [
        {
          name: "Inside Joke",
          description: "Draw a card. Share it with someone nearby.",
          damage: "40",
          cost: 1,
        },
        {
          name: "Still Choosing",
          description: "This attack can’t be forgotten next turn.",
          damage: "90",
          cost: 3,
        },
      ],
      flavor: "Hands held on a Tuesday. Ordinary magic.",
      typeLabel: "Fairy",
      hp: 140,
      rarity: "mythic",
    },
  },
  {
    id: "partner-adventure",
    category: "partner",
    label: "Co-pilot",
    patch: {
      abilityEnabled: true,
      ability: {
        name: "Shared Map",
        description:
          "Once per turn, you may switch this card with one on the Bench.",
      },
      attacks: [
        {
          name: "Road Trip",
          description: "Look at the top 3 cards of your deck.",
          damage: "50",
          cost: 2,
        },
        {
          name: "Late Night Plot",
          description: "Flip a coin. If heads, take another turn of snacking.",
          damage: "70",
          cost: 2,
        },
      ],
      flavor: "Same playlist. Wrong turns welcome.",
      typeLabel: "Electric",
      hp: 120,
    },
  },
  {
    id: "partner-soft",
    category: "partner",
    label: "Soft landing",
    patch: {
      abilityEnabled: true,
      ability: {
        name: "Safe Harbor",
        description: "Your other cards take 10 less damage while this is Active.",
      },
      attacks: [
        {
          name: "Tea & Blanket",
          description: "Heal 40 from this card.",
          damage: "20",
          cost: 1,
        },
        {
          name: "I’ve Got You",
          description: "Prevent all effects of attacks on this card next turn.",
          damage: "60",
          cost: 3,
        },
      ],
      flavor: "The person who texts “home soon?” and means it.",
      typeLabel: "Water",
      hp: 130,
    },
  },

  // —— Kids ——
  {
    id: "kid-chaos",
    category: "kid",
    label: "Full volume",
    patch: {
      abilityEnabled: true,
      ability: {
        name: "Endless Energy",
        description: "Once per turn, this card can’t get Tired until bedtime.",
      },
      attacks: [
        {
          name: "Giggle Blast",
          description: "Flip a coin. Smile on heads.",
          damage: "30",
          cost: 1,
        },
        {
          name: "Costume Power",
          description: "This attack does 20 more if a cape is involved.",
          damage: "60",
          cost: 2,
        },
      ],
      flavor: "Mud on the knees. Victory in the laugh.",
      typeLabel: "Electric",
      hp: 80,
      stage: "basic",
    },
  },
  {
    id: "kid-artist",
    category: "kid",
    label: "Tiny artist",
    patch: {
      abilityEnabled: true,
      ability: {
        name: "Masterpiece Mode",
        description: "Once per turn, draw until you have 5 crayons in hand.",
      },
      attacks: [
        {
          name: "Sticker Storm",
          description: "Attach a Sticker to one of your cards.",
          damage: "20",
          cost: 1,
        },
        {
          name: "Fridge Gallery",
          description: "This card’s art can’t be discarded this turn.",
          damage: "50",
          cost: 2,
        },
      ],
      flavor: "Signed in glitter. Critically acclaimed at home.",
      typeLabel: "Fairy",
      hp: 70,
    },
  },
  {
    id: "kid-sport",
    category: "kid",
    label: "Recess MVP",
    patch: {
      abilityEnabled: true,
      ability: {
        name: "Second Wind",
        description: "Heal 20 after the party — or the practice.",
      },
      attacks: [
        {
          name: "Tag You’re It",
          description: "Switch the defending card with a benched one.",
          damage: "40",
          cost: 1,
        },
        {
          name: "Trophy Run",
          description: "Flip a coin. If heads, this attack does 40 more.",
          damage: "70",
          cost: 3,
        },
      ],
      flavor: "Came for the medal. Stayed for the snacks.",
      typeLabel: "Fighting",
      hp: 100,
    },
  },

  // —— Family ——
  {
    id: "family-table",
    category: "family",
    label: "Table crew",
    patch: {
      abilityEnabled: true,
      ability: {
        name: "Pass the Plate",
        description: "Once per turn, heal 20 from each of your cards in play.",
      },
      attacks: [
        {
          name: "Story Round",
          description: "Draw a card for each generation present.",
          damage: "30",
          cost: 1,
        },
        {
          name: "Leftover Legend",
          description: "This attack does 30 more for each empty plate.",
          damage: "80",
          cost: 3,
        },
      ],
      flavor: "Same table. Louder every year. Still home.",
      typeLabel: "Fairy",
      hp: 150,
      rarity: "mythic",
    },
  },
  {
    id: "family-parent",
    category: "family",
    label: "Parent power",
    patch: {
      abilityEnabled: true,
      ability: {
        name: "Always Packing",
        description:
          "Once per turn, search for a Bandage, Snack, or Spare Sock.",
      },
      attacks: [
        {
          name: "Reminder Ping",
          description: "The defending card can’t attack next turn (forgot shoes).",
          damage: "20",
          cost: 1,
        },
        {
          name: "Carpool Charge",
          description: "Heal 40 from one of your Benched memories.",
          damage: "70",
          cost: 2,
        },
      ],
      flavor: "Runs on coffee, calendar alerts, and love.",
      typeLabel: "Psychic",
      hp: 140,
    },
  },
  {
    id: "family-sibling",
    category: "family",
    label: "Sibling rivalry",
    patch: {
      abilityEnabled: true,
      ability: {
        name: "Shared History",
        description: "Your cards with the same last name take 10 less damage.",
      },
      attacks: [
        {
          name: "Borrowed Hoodie",
          description: "Take an item from the defending card.",
          damage: "30",
          cost: 1,
        },
        {
          name: "Truce Cookie",
          description: "Both players heal 30. The fight resumes tomorrow.",
          damage: "60",
          cost: 2,
        },
      ],
      flavor: "Fought over the front seat. Still shows up.",
      typeLabel: "Fighting",
      hp: 110,
    },
  },
];

export function presetsForCategory(category: TextPresetCategory): TextPreset[] {
  return TEXT_PRESETS.filter((p) => p.category === category);
}

// —— Individual browsable text options (search / sort / pick) ——

export type TextOptionKind = "ability" | "attack" | "flavor";

export type TextOptionCategory = TextPresetCategory | "general";

export type TextOption = {
  id: string;
  kind: TextOptionKind;
  category: TextOptionCategory;
  /** Primary line shown in the list */
  title: string;
  /** Supporting body (ability/attack effect, or empty for short flavors) */
  body: string;
  damage?: string;
  cost?: number;
};

export const TEXT_OPTION_KIND_LABELS: Record<TextOptionKind, string> = {
  ability: "Abilities",
  attack: "Attacks",
  flavor: "Flavor lines",
};

export const TEXT_OPTION_CATEGORIES: {
  id: TextOptionCategory;
  label: string;
}[] = [
  { id: "general", label: "General" },
  { id: "cat", label: "Cat" },
  { id: "dog", label: "Dog" },
  { id: "partner", label: "Partner" },
  { id: "kid", label: "Kid" },
  { id: "family", label: "Family" },
];

/** Extra one-off lines beyond the quick-fill packs */
const EXTRA_TEXT_OPTIONS: TextOption[] = [
  // General abilities
  {
    id: "gen-ability-backup",
    kind: "ability",
    category: "general",
    title: "Bench Warmth",
    body: "Once per turn, heal 20 from one of your Benched cards.",
  },
  {
    id: "gen-ability-draw",
    kind: "ability",
    category: "general",
    title: "Keen Eye",
    body: "Once per turn, look at the top card of your deck.",
  },
  {
    id: "gen-ability-tank",
    kind: "ability",
    category: "general",
    title: "Thick Skin",
    body: "This card takes 20 less damage from attacks.",
  },
  {
    id: "gen-ability-switch",
    kind: "ability",
    category: "general",
    title: "Quick Swap",
    body: "Once per turn, switch this card with one on your Bench.",
  },
  // General attacks
  {
    id: "gen-atk-tackle",
    kind: "attack",
    category: "general",
    title: "Tackle",
    body: "",
    damage: "30",
    cost: 1,
  },
  {
    id: "gen-atk-focus",
    kind: "attack",
    category: "general",
    title: "Focus Blast",
    body: "Flip a coin. If tails, this attack does nothing.",
    damage: "80",
    cost: 2,
  },
  {
    id: "gen-atk-guard",
    kind: "attack",
    category: "general",
    title: "Guard Up",
    body: "During your opponent’s next turn, this card takes 30 less damage.",
    damage: "20",
    cost: 1,
  },
  {
    id: "gen-atk-finale",
    kind: "attack",
    category: "general",
    title: "All In",
    body: "Discard an Energy from this card.",
    damage: "100",
    cost: 3,
  },
  {
    id: "gen-atk-heal",
    kind: "attack",
    category: "general",
    title: "Recover",
    body: "Heal 40 from this card.",
    damage: "10",
    cost: 1,
  },
  // General flavor
  {
    id: "gen-flavor-one",
    kind: "flavor",
    category: "general",
    title: "One of one",
    body: "Printed once. Kept forever.",
  },
  {
    id: "gen-flavor-moment",
    kind: "flavor",
    category: "general",
    title: "Caught mid-laugh",
    body: "The kind of moment you wish you could pause.",
  },
  {
    id: "gen-flavor-field",
    kind: "flavor",
    category: "general",
    title: "Enters the field",
    body: "A legendary presence enters the field.",
  },
  {
    id: "gen-flavor-proof",
    kind: "flavor",
    category: "general",
    title: "Proof of love",
    body: "Proof that someone was here, and it mattered.",
  },
  // More cat / dog / etc flavor & attacks for browsing density
  {
    id: "cat-flavor-box",
    kind: "flavor",
    category: "cat",
    title: "Box claim",
    body: "If it fits, it sits. Jurisdiction: the whole house.",
  },
  {
    id: "dog-flavor-door",
    kind: "flavor",
    category: "dog",
    title: "Door patrol",
    body: "Barked at the wind. Won anyway.",
  },
  {
    id: "partner-flavor-coffee",
    kind: "flavor",
    category: "partner",
    title: "Shared mug",
    body: "Knows your coffee order by heart.",
  },
  {
    id: "kid-flavor-cape",
    kind: "flavor",
    category: "kid",
    title: "Cape day",
    body: "Today’s outfit is a superpower.",
  },
  {
    id: "family-flavor-porch",
    kind: "flavor",
    category: "family",
    title: "Porch light",
    body: "The light that stays on until everyone’s home.",
  },
  {
    id: "cat-atk-purr",
    kind: "attack",
    category: "cat",
    title: "Purr Engine",
    body: "Heal 20 from this card. The room gets quieter.",
    damage: "10",
    cost: 1,
  },
  {
    id: "dog-atk-shake",
    kind: "attack",
    category: "dog",
    title: "Shake Dry",
    body: "Your opponent’s Active card can’t attack next turn (too wet).",
    damage: "40",
    cost: 2,
  },
  {
    id: "kid-atk-story",
    kind: "attack",
    category: "kid",
    title: "Story Time",
    body: "Draw 2 cards. One of them must be silly.",
    damage: "20",
    cost: 1,
  },
  {
    id: "partner-atk-handhold",
    kind: "attack",
    category: "partner",
    title: "Hand Hold",
    body: "Prevent all effects of attacks on this card next turn.",
    damage: "30",
    cost: 1,
  },
  {
    id: "family-atk-grouphug",
    kind: "attack",
    category: "family",
    title: "Group Hug",
    body: "Heal 20 from each of your cards in play.",
    damage: "40",
    cost: 2,
  },
];

function optionsFromPresets(): TextOption[] {
  const out: TextOption[] = [];
  for (const preset of TEXT_PRESETS) {
    out.push({
      id: `${preset.id}-ability`,
      kind: "ability",
      category: preset.category,
      title: preset.patch.ability.name,
      body: preset.patch.ability.description,
    });
    preset.patch.attacks.forEach((atk, i) => {
      if (!atk.name.trim()) return;
      out.push({
        id: `${preset.id}-atk-${i}`,
        kind: "attack",
        category: preset.category,
        title: atk.name,
        body: atk.description,
        damage: atk.damage,
        cost: atk.cost,
      });
    });
    if (preset.patch.flavor.trim()) {
      out.push({
        id: `${preset.id}-flavor`,
        kind: "flavor",
        category: preset.category,
        title: preset.label,
        body: preset.patch.flavor,
      });
    }
  }
  return out;
}

function dedupeOptions(options: TextOption[]): TextOption[] {
  const seen = new Set<string>();
  const result: TextOption[] = [];
  for (const opt of options) {
    const key = `${opt.kind}:${opt.title.toLowerCase()}:${opt.body.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(opt);
  }
  return result;
}

export const TEXT_OPTIONS: TextOption[] = dedupeOptions([
  ...optionsFromPresets(),
  ...EXTRA_TEXT_OPTIONS,
]);

export type TextOptionSort = "name" | "category" | "kind";

export function filterTextOptions(input: {
  kind?: TextOptionKind | "all";
  category?: TextOptionCategory | "all";
  query?: string;
  sort?: TextOptionSort;
}): TextOption[] {
  const kind = input.kind ?? "all";
  const category = input.category ?? "all";
  const q = (input.query ?? "").trim().toLowerCase();
  const sort = input.sort ?? "name";

  let list = TEXT_OPTIONS.filter((opt) => {
    if (kind !== "all" && opt.kind !== kind) return false;
    if (category !== "all" && opt.category !== category) return false;
    if (!q) return true;
    const hay = `${opt.title} ${opt.body} ${opt.category} ${opt.kind}`.toLowerCase();
    return hay.includes(q);
  });

  list = [...list].sort((a, b) => {
    if (sort === "category") {
      const c = a.category.localeCompare(b.category);
      if (c !== 0) return c;
      return a.title.localeCompare(b.title);
    }
    if (sort === "kind") {
      const k = a.kind.localeCompare(b.kind);
      if (k !== 0) return k;
      return a.title.localeCompare(b.title);
    }
    return a.title.localeCompare(b.title);
  });

  return list;
}

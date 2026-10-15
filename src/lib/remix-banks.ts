/* ════════════════════════════════════════════════════════════════════════
   BANKS FOR THE LIVE SESSION

   These exist so the room is never stuck. They are prompts for a human
   facilitator, not an answer generator — the session dies the moment a
   machine does the thinking instead of the audience.
   ════════════════════════════════════════════════════════════════════════ */

/** The theatrical bit. Deliberately far from anything sensible. */
export const wildcardIndustries = [
  "Theme park",
  "Michelin kitchen",
  "Record label",
  "Formula 1 pit crew",
  "Monastery",
  "Nightclub",
  "Art gallery",
  "Spy agency",
  "Circus",
  "Museum",
  "Music festival",
  "Streaming platform",
  "Private members' club",
  "Stand-up comedy club",
  "Parliament",
  "Football scouting",
  "Fashion house",
  "Cult",
  "Escape room",
  "Travel influencer",
  "Luxury car dealership",
  "Boutique hotel",
  "Wrestling promotion",
  "Auction house",
  "Tattoo studio",
  "Observatory",
  "Submarine crew",
  "Children's TV channel",
  "Perfume counter",
  "Library",
];

/** The safe ones. For when the wildcard is too big a leap for the room. */
export const adjacentIndustries = [
  "Coffee culture",
  "Gyms and fitness",
  "Fashion and streetwear",
  "Beauty and skincare",
  "Travel",
  "Homewares",
  "Wellness",
  "Food and restaurants",
  "Live music",
  "Podcasting",
  "Gaming",
  "Running clubs",
  "Craft and DIY",
  "Boutique retail",
  "Events and ticketing",
];

export type Lens = { key: string; label: string; question: string; hint: string };

/**
 * The rescue. Run these against the Y industry when free association stalls.
 * Seven is the limit of what a room will sit through before it feels like work.
 */
export const lenses: Lens[] = [
  {
    key: "look",
    label: "Look",
    question: "What does it look like?",
    hint: "The room, the kit, the colours, what people wear, what you see first.",
  },
  {
    key: "sound",
    label: "Sound",
    question: "What does it sound like?",
    hint: "The music, the volume, the language, what staff actually say to you.",
  },
  {
    key: "behave",
    label: "Behave",
    question: "What's the ritual?",
    hint: "What happens every single time. The greeting, the queue, the ending.",
  },
  {
    key: "money",
    label: "Money",
    question: "How do they make money?",
    hint: "Memberships, drops, tiers, add-ons. What's free and what's the expensive thing?",
  },
  {
    key: "place",
    label: "Place",
    question: "Where do they show up?",
    hint: "Events, platforms, physical spaces, times of day.",
  },
  {
    key: "people",
    label: "People",
    question: "Who's involved?",
    hint: "Who they collaborate with, who endorses them, who the regulars are.",
  },
  {
    key: "refuse",
    label: "Refuse",
    question: "What do they refuse to do?",
    hint: "The thing they won't offer. Often the most repeatable line in the room.",
  },
];

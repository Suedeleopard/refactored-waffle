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

/** The safe ones. Where a normal audience actually spends, for when the room is quiet. */
export const adjacentIndustries = [
  "Coffee culture",
  "Restaurants and food",
  "Live music",
  "Gyms and fitness",
  "Running clubs",
  "Fashion and streetwear",
  "Beauty and salons",
  "Interiors and furniture",
  "Travel",
  "Wellness",
  "Pets",
  "Books and bookshops",
  "Vinyl and record shops",
  "Pottery and craft classes",
  "Farmers markets",
  "Cycling",
  "Natural wine",
  "Gaming",
  "Podcasts",
  "Festivals",
];

/**
 * The audience card. Five fields the room fills in together so everyone is
 * picturing the same person before anyone suggests an industry.
 */
export type ProfileField = { key: string; label: string; placeholder: string };

export const profileFields: ProfileField[] = [
  { key: "age", label: "Age and life stage", placeholder: "Late twenties, renting, first proper job" },
  { key: "lives", label: "Where they live", placeholder: "Flat share in a city, no outdoor space" },
  { key: "values", label: "What they care about", placeholder: "Making a rented place feel like theirs" },
  { key: "follows", label: "Who they follow", placeholder: "Interiors accounts, a few chefs, local makers" },
  { key: "weekend", label: "A typical weekend", placeholder: "Coffee, a market, friends round for dinner" },
];

export type Lens = { key: string; label: string; question: string; hint: string };

/**
 * The unstickers. These prompt what goes in the LEFT column — things the
 * borrowed industry actually does. They are nudges for a quiet room, not a
 * form to work through in order.
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

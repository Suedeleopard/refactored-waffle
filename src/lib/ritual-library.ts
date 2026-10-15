/* ════════════════════════════════════════════════════════════════════════
   THE RITUAL LIBRARY

   Pick an industry and its behaviours appear instantly. No API, no cost,
   no way to fail in front of a room.

   These are PEAK behaviours, not average ones — what the industry is known
   for at its best. An average gym has a treadmill; a peak gym has a 6am
   class with a DJ and a queue. The peak version is what produces a remix
   worth saying out loud.

   Keys are matched case-insensitively against whatever the facilitator
   picked, so "Running clubs" and "running club" both resolve.
   ════════════════════════════════════════════════════════════════════════ */

export const ritualLibrary: Record<string, string[]> = {
  "running clubs": [
    "Free weekly meetup, same time, same place",
    "You earn the club kit, you can't just buy it",
    "Strava leaderboard everyone can see",
    "Post-run coffee is half the reason people come",
    "Pacers so nobody finishes last",
    "A race the whole club trains towards together",
    "Newcomers get walked through it by a regular",
  ],
  "coffee culture": [
    "The regular's order remembered without asking",
    "Single-origin with a tasting note card",
    "Loyalty stamps, tenth one free",
    "Beans sold to take home, with a brew guide",
    "Latte art as a small daily performance",
    "A seasonal special that disappears",
    "Baristas named on the board like staff you'd follow",
  ],
  "restaurants and food": [
    "A tasting menu that tells a story in order",
    "The chef comes out to explain one dish",
    "Specials written on a board, changed daily",
    "You book weeks ahead and that's part of the appeal",
    "Supplier names printed on the menu",
    "A signature dish people bring friends to try",
    "The last course arrives as a small gift",
  ],
  "live music": [
    "A line-up announced weeks out, headliner last",
    "Doors time, support act, main set, encore",
    "Merch table on the way out",
    "Tickets tiered: early bird, general, VIP",
    "Set lists shared afterwards",
    "A residency — same venue, several nights",
    "The crowd films it and does the marketing",
  ],
  "gyms and fitness": [
    "Monthly membership, cancel any time, rarely cancelled",
    "Classes with names and a schedule you plan around",
    "Instructors with their own followings",
    "Before and after as the proof",
    "A free trial session to get you through the door",
    "Personal training as the premium upsell",
    "The 6am crowd who all know each other",
  ],
  "fashion and streetwear": [
    "Drops on a fixed day, limited numbers",
    "Queues and a resale market doing the marketing",
    "Collaborations with people from other worlds",
    "Lookbooks shot like editorial",
    "Archive pieces that never come back",
    "Sizing that sells out as a status signal",
    "A logo people wear as membership",
  ],
  "beauty and salons": [
    "Standing appointment, same person every time",
    "Consultation before anything happens",
    "A drink in your hand within a minute",
    "Products sold to continue it at home",
    "Before and after photos with permission",
    "Referral rewards for bringing a friend",
    "The head massage nobody asked for and everybody remembers",
  ],
  "interiors and furniture": [
    "Room sets, so you see it in context not isolation",
    "Swatches and samples sent to your home free",
    "Made to order with a date you wait for",
    "Care instructions that assume you'll keep it decades",
    "Designer named like an author",
    "Showroom appointments rather than browsing",
    "A guarantee measured in years",
  ],
  travel: [
    "An itinerary that builds to one big day",
    "Packing list sent in advance",
    "A local guide rather than a company rep",
    "Small group sizes as a selling point",
    "Photos taken for you and sent after",
    "Returning guests get first refusal on dates",
    "The welcome drink on arrival",
  ],
  wellness: [
    "A ritual with a fixed order you don't deviate from",
    "Phones away, silence as a feature",
    "Practitioner remembers what you said last time",
    "Courses of sessions, not one-offs",
    "A take-home practice between visits",
    "Seasonal programmes tied to the calendar",
    "Low light, specific smell, the same every visit",
  ],
  pets: [
    "They know the animal's name before yours",
    "Treats at the counter, every visit",
    "Photos of regulars on the wall",
    "Subscription food deliveries timed to run out",
    "Birthday cards for the pet",
    "A vet or trainer who does a free first check",
    "Community noticeboard for lost and found",
  ],
  "books and bookshops": [
    "Staff picks with a handwritten card",
    "Shelf talkers arguing for a title",
    "Author events with signed copies",
    "A book club with a fixed monthly night",
    "If you liked this, try this",
    "Window display changed weekly like a gallery",
    "Pre-orders for things not out yet",
  ],
  "vinyl and record shops": [
    "New arrivals rack, flipped through weekly",
    "Listening station before you buy",
    "Record Store Day as a holiday",
    "Limited pressings, numbered",
    "Staff who argue with your choices",
    "In-store sets from local artists",
    "Second hand bought, graded and resold",
  ],
  "pottery and craft classes": [
    "You make one thing and take it home",
    "Beginner night designed for people who are nervous",
    "Your piece fired and collected two weeks later",
    "Aprons, clay under fingernails, the mess is the point",
    "Six-week courses with the same group",
    "Studio access for people who've done the course",
    "An end-of-term show of everyone's work",
  ],
  "farmers markets": [
    "Same stall, same pitch, every week",
    "Taste before you buy, always",
    "The grower is the person serving you",
    "Seasonal — things appear and vanish",
    "Cash, chat, and a recipe suggestion",
    "Sold out by midday as proof",
    "Regulars who skip the queue by name",
  ],
  cycling: [
    "Group rides graded by pace",
    "The café stop is the social centre",
    "Kit in club colours",
    "Bike fit as a paid, serious service",
    "Winter training plans towards a summer event",
    "Servicing reminders based on distance ridden",
    "A ride leader who waits at the top of every hill",
  ],
  "natural wine": [
    "The importer and grower named, not just the region",
    "Taste it open, buy it by the glass first",
    "Shelf notes written like opinions",
    "Cloudy, weird, and that's the selling point",
    "Monthly case subscription chosen for you",
    "Producer evenings with the winemaker on a video call",
    "A short list that changes rather than a long one that doesn't",
  ],
  gaming: [
    "Seasons with an end date and a reset",
    "Daily login streaks",
    "Cosmetic items that signal how long you've played",
    "Patch notes read like a newsletter",
    "Leaderboards and clans",
    "Early access for the most committed",
    "A free tier that's genuinely good",
  ],
  podcasts: [
    "Same day, same time, every week",
    "A format listeners can predict and rely on",
    "Guest episodes that bring new audiences",
    "Back catalogue as a library to binge",
    "Listener questions read out by name",
    "Live recordings as ticketed events",
    "Ad reads in the host's own voice",
  ],
  festivals: [
    "A line-up poster with hierarchy of names",
    "Tiered tickets released in waves",
    "Wristbands you keep on for weeks after",
    "Multiple stages, so you choose your own route",
    "Food as a destination in itself",
    "One shared moment everyone talks about after",
    "Next year's tickets on sale before you've gone home",
  ],
  "art gallery": [
    "Private view before the public opening",
    "Numbered editions that close",
    "Provenance and a certificate",
    "Wall text explaining the thinking",
    "Artist residencies with a start and end",
    "A permanent collection versus what's on loan",
    "Nothing has a price on it in the room",
  ],
  "michelin kitchen": [
    "Mise en place before service, every single day",
    "The pass, where one person checks every plate",
    "Chef's table where you watch it happen",
    "Suppliers chosen and named, relationships over decades",
    "Staff trained up and sent out to open their own",
    "A dish retired at the peak of its popularity",
    "Service as choreography, not hospitality",
  ],
  "private members' club": [
    "Application, not purchase",
    "A waiting list that is itself the marketing",
    "Members bring guests, and vouch for them",
    "House rules — no laptops after six",
    "Annual dues plus what you spend inside",
    "Events only members hear about",
    "Staff who know you without a badge",
  ],
  "record label": [
    "Artists signed and developed, not just released",
    "A release schedule announced in advance",
    "Back catalogue that keeps earning",
    "Merch as a second revenue line",
    "Tours that support the record",
    "A label night where the roster plays together",
    "A recognisable house sound across artists",
  ],
  "boutique hotel": [
    "Check-in with a drink, not a form",
    "Rooms named rather than numbered",
    "A playlist in the lobby you can take away",
    "Local recommendations from staff, not a leaflet rack",
    "Turndown — a small gesture you didn't ask for",
    "Toiletries people steal on purpose",
    "Returning guests remembered and upgraded",
  ],
};

/** Case and plural tolerant lookup, so what the room typed still matches. */
export function ritualsFor(industry: string): string[] {
  const key = industry.trim().toLowerCase();
  if (!key) return [];
  if (ritualLibrary[key]) return ritualLibrary[key];
  // "running club" → "running clubs", "Gyms" → "gyms and fitness", etc.
  const hit = Object.keys(ritualLibrary).find(
    (k) => k.startsWith(key) || key.startsWith(k) || k.includes(key) || key.includes(k)
  );
  return hit ? ritualLibrary[hit] : [];
}

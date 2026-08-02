/* ════════════════════════════════════════════════════════════════════════
   THE KIT — what someone gets for £39.

   This is the paid product. It renders behind the paywall on the dashboard.
   Three parts: the method, the worksheet, and the outreach templates. The
   swipe file lives in teardowns.ts and is public on purpose — it is the
   marketing, and giving it away is what makes the method credible.
   ════════════════════════════════════════════════════════════════════════ */

export type MethodStep = {
  n: number;
  title: string;
  body: string;
  /** The question to actually answer. Everything else is context. */
  prompt: string;
};

export const methodSteps: MethodStep[] = [
  {
    n: 1,
    title: "Who do they want to attract?",
    body: "Not who they currently serve. Who they wish they served. Choose an audience that is valuable to the business, credible for the brand to reach, and different enough from the current base that going after it counts as a decision.",
    prompt: "Which single audience would change this business if they won it?",
  },
  {
    n: 2,
    title: "Where do those people already spend their money?",
    body: "Do not guess and do not describe them in demographics. Follow the actual spending. Entertainment, fitness, food, travel, clothing, whatever it is. You are looking for categories that already have their attention and their card details.",
    prompt: "List every category this audience already pays for without hesitating.",
  },
  {
    n: 3,
    title: "Find the overlap",
    body: "Narrow the list to four. Three should be obvious enough that nobody argues with them. One should be a wildcard that makes the room sit up. The wildcard is where the interesting work usually comes from, but the obvious three are what make it defensible.",
    prompt: "Three obvious industries, one wildcard. Write them down.",
  },
  {
    n: 4,
    title: "Find the brands they already love",
    body: "Audiences do not buy from industries, they buy from brands. Name three to five specific ones in each category. Specific names, not sectors. Then ask what those brands have in common and what could be borrowed from each.",
    prompt: "Which named brands have already earned this audience's trust?",
  },
  {
    n: 5,
    title: "Study how they behave",
    body: "This is the step people skip and it is the one that does the work. Do not analyse everything. Collect only the behaviours that stand out, across four areas: how they show up, who they work with, what they create that people remember, and how they make money and keep people coming back.",
    prompt: "What does this brand do that your client's category would never think to do?",
  },
  {
    n: 6,
    title: "Bring it back",
    body: "Now ask the question the whole method has been building towards. Do not invent new ideas. Relocate existing ones. A run club inside a running brand is normal. A run club inside a drinks brand is interesting. The behaviour has not changed, only who is doing it.",
    prompt: "What if our client behaved like this?",
  },
  {
    n: 7,
    title: "Write the swap",
    body: "Say it in one line: a [X] behaving like a [Y]. If the line needs explaining, it is not the right line yet. The best ones are instantly picturable and slightly uncomfortable.",
    prompt: "Write the swap as a single sentence someone could repeat from memory.",
  },
  {
    n: 8,
    title: "Stress test it",
    body: "Three questions, honestly answered. Is it valuable, meaning would this audience actually matter to the client? Is it credible, meaning could this brand genuinely behave this way without it reading as a costume? Is it exciting enough to start a conversation?",
    prompt: "Valuable, credible, exciting. Which one is weakest, and can you fix it?",
  },
  {
    n: 9,
    title: "Build the world",
    body: "Stop treating it as a campaign and ask what would exist if this were simply how the business behaved. Products, experiences, partnerships, content, community. If the answers keep coming easily, you have found something worth building. If you run dry after two, go back to step three.",
    prompt: "If this were the business rather than a campaign, what would naturally exist?",
  },
  {
    n: 10,
    title: "Decide whether it is worth building",
    body: "Before you spend real time bringing it to life: is it valuable, is it credible, is it deliverable, is it exciting. If yes, go. If not, go back and pick a different world. Abandoning a pairing at this stage costs you an afternoon. Abandoning it after the pitch costs you the client.",
    prompt: "Would you bet your own money on this being commissioned?",
  },
  {
    n: 11,
    title: "Make it feel real",
    body: "You are not building the whole campaign, you are building belief. Create just enough for someone to imagine the rest. Leave deliberate space for them to add to it. If they start adding ideas of their own in the room, you have won.",
    prompt: "What is the smallest artefact that would make someone believe this could exist?",
  },
];

/** The one-page worksheet. Eight blanks, filled against one live opportunity. */
export const worksheetPrompts: string[] = [
  "Sell…",
  "Create experiences like…",
  "Collaborate with…",
  "Speak like…",
  "Show up in…",
  "Make money through…",
  "Attract…",
  "Stop doing…",
];

export type OutreachTemplate = {
  name: string;
  when: string;
  body: string;
};

export const outreachTemplates: OutreachTemplate[] = [
  {
    name: "The light touch",
    when: "Cold, or a long-dormant contact. Short enough to read on a phone.",
    body: `Subject: a thought about [company]

I had an idea about your business and it wouldn't leave me alone, so I'm sending it.

What if [company] behaved like [Y]?

[One sentence on what that would mean in practice.]

Probably nothing, but I thought you'd find it interesting. Worth exploring?`,
  },
  {
    name: "The problem first",
    when: "When you know the friction their customers feel, and can name it.",
    body: `Subject: the bit everyone puts up with

Most people buying [category] quietly accept [the friction]. It's been that way long enough that nobody questions it any more.

Meanwhile [Y industry] solved exactly this, years ago, with [the behaviour].

So: [company] behaving like [Y]. [One sentence on what changes for the customer.]

Shall we dig into it?`,
  },
  {
    name: "The reason to come back",
    when: "Keeping in touch. Send a new swap every few months to the same person.",
    body: `Subject: another one for you

Still thinking about [company]. This month's version:

[X] behaving like [Y].

[Two lines, no more.]

No agenda. I just enjoy the puzzle, and you're one of the businesses I keep coming back to.`,
  },
];

/* ════════════════════════════════════════════════════════════════════════
   👋 START HERE — THIS FILE IS YOUR PRODUCT.

   Everything in this file is a PLACEHOLDER for the TSC Starter demo. It's the
   one place your product's identity lives — name, marketing copy, support
   email, and pricing. Edit these values and the whole app becomes *yours*;
   once you've replaced them, nothing of "TSC Starter" remains on screen.

   Nothing here is locked in. The plans below are EXAMPLES that exist so you can
   see billing working out of the box — replace them with your own.
   ════════════════════════════════════════════════════════════════════════ */

export const siteConfig = {
  /** Your product's name. Shown in the nav, page titles, emails. */
  name: "X Behaving Like Y",
  /** One-line positioning, shown after the name in the browser tab. */
  tagline: "A method for not sounding like everyone else in the room.",
  /** Meta/OG description for search + social sharing. */
  description:
    "X Behaving Like Y is a method for winning work you shouldn't win. Borrow behaviour from an industry your client's audience already trusts, so your thinking lands as new enough to notice and familiar enough to say yes to.",
  /** Your public URL (no trailing slash). Set automatically from NEXT_PUBLIC_SITE_URL. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** The from/support address for emails. */
  supportEmail: "thad@thadcox.co.uk",
  /** PLACEHOLDER — your links. */
  links: {
    twitter: "https://twitter.com/",
    site: "https://example.com",
  },
} as const;

/* ── Marketing copy (the landing page) ────────────────────────────────────── */
export const marketing = {
  hero: {
    badge: "The method, the swipe file, the worksheet",
    headlineTop: "Everyone in the room",
    headlineAccent: "is saying the same thing.",
    subhead:
      "X Behaving Like Y is a method for borrowing behaviour from an industry your client's audience already trusts. New enough to get noticed. Familiar enough to get adopted. Built for the pitch you have to win, not for a brainstorm.",
  },
  features: [
    {
      title: "Same audience, different behaviour",
      body: "The whole method in one line. Borrow from where your client's customers already spend money and the risk of a bold idea drops away.",
    },
    {
      title: "Built for a live opportunity",
      body: "Not a creativity exercise. Run it against the thing you actually have to win, with a deadline attached.",
    },
    {
      title: "A swipe file you can read first",
      body: "Worked examples across sectors, so you can watch the method land before you trust it with your own pitch.",
    },
    {
      title: "One page, one sitting",
      body: "The worksheet turns eleven steps into a page you fill in. No workshop, no facilitator, no away day.",
    },
  ],
} as const;

/* ── The high-end tier (enquiry, not checkout) ────────────────────────────── */
export const sprint = {
  name: "The Pitch Sprint",
  priceLabel: "From £8,000",
  summary:
    "You are pitching for something that matters and you cannot afford to sound like the other four people in the process. Two weeks, fixed scope, one live opportunity.",
  deliverables: [
    "A behavioural angle nobody else in the process will bring",
    "The strategic spine of your pitch, built end to end",
    "A presentation section designed to be the thing they remember",
    "The evidence that makes a bold idea feel safe to approve",
  ],
} as const;

/* ── Pricing plans ──────────────────────────────────────────────────────────
   Both plans below are one-time purchases (mode: "payment") — pay once, own it
   forever. The setup wizard's "Create my plans" button builds whatever you
   define here in your own Stripe account. */
export type Plan = {
  id: string;
  name: string;
  description: string;
  priceLabel: string;
  /** Stripe Price ID (env-driven). */
  priceId?: string;
  features: string[];
  /** Highlight as the recommended plan in the pricing UI. */
  featured?: boolean;
  mode: "subscription" | "payment";
  /** Structured pricing — used by the wizard to create this plan in Stripe. */
  amount: number; // major units, e.g. 29 = £29.00
  currency: string; // ISO code, e.g. "gbp"
  /** Billing interval — only used when mode is "subscription". */
  interval?: "month" | "year";
  /** The env var this plan's Price ID is written to. */
  priceEnvKey: string;
};

export const plans: Plan[] = [
  {
    id: "kit",
    name: "The Kit",
    description:
      "The full method, the swipe file, and the worksheet. Everything you need to run X Behaving Like Y against a live opportunity on your own.",
    priceLabel: "£39",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER,
    mode: "payment",
    featured: true,
    amount: 39,
    currency: "gbp",
    priceEnvKey: "NEXT_PUBLIC_STRIPE_PRICE_STARTER",
    features: [
      "The eleven-step method, written out in full",
      "The swipe file of worked teardowns",
      "The one-page worksheet",
      "The outreach templates",
      "Yours forever, no subscription",
    ],
  },
];

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
  tagline: "The thinking tool that makes ordinary briefs behave like something worth remembering.",
  /** Meta/OG description for search + social sharing. */
  description:
    "A short, self-contained kit that teaches one creative framework mid-level freelancers can use on their very next brief — the method, a swipe file of worked examples, and a one-page worksheet.",
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
    badge: "A one-sitting creative kit",
    headlineTop: "Make it behave like",
    headlineAccent: "something worth remembering.",
    subhead:
      "A short, self-contained kit that teaches one creative framework mid-level freelancers can use on their very next brief — take a familiar thing and make it behave like something unexpected, so the work stops looking like everyone else's.",
  },
  features: [
    { title: "One method", body: "A single creative framework you can run on your very next brief." },
    { title: "Worked examples", body: "A swipe file showing the method applied to real briefs." },
    { title: "One-page worksheet", body: "Run it against a live project and see it work immediately." },
    { title: "Own it once", body: "Pay once, keep it forever — no subscription." },
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
      "The framework, the worked examples, and the worksheet. Everything a freelancer needs to apply it on Monday morning.",
    priceLabel: "£29",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER,
    mode: "payment",
    amount: 29,
    currency: "gbp",
    priceEnvKey: "NEXT_PUBLIC_STRIPE_PRICE_STARTER",
    features: ["The framework", "A swipe file of worked examples", "One-page worksheet"],
  },
  {
    id: "kit-vault",
    name: "The Kit + Vault",
    description:
      "Everything in The Kit, plus an expanded library of examples across sectors and a set of prompts to keep generating fresh angles.",
    priceLabel: "£49",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
    mode: "payment",
    featured: true,
    amount: 49,
    currency: "gbp",
    priceEnvKey: "NEXT_PUBLIC_STRIPE_PRICE_PRO",
    features: [
      "Everything in The Kit",
      "Expanded example library across sectors",
      "Reusable prompts for fresh angles",
    ],
  },
];

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
  /** PLACEHOLDER — your product's name. Shown in the nav, page titles, emails. */
  name: "TSC Starter",
  /** PLACEHOLDER — one-line positioning, shown after the name in the browser tab. */
  tagline: "Ship a microSaaS in a weekend",
  /** PLACEHOLDER — meta/OG description for search + social sharing. */
  description:
    "An off-the-shelf SaaS install — auth, billing, and a guided setup wizard, ready to make your own.",
  /** Your public URL (no trailing slash). Set automatically from NEXT_PUBLIC_SITE_URL. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** PLACEHOLDER — the from/support address for emails. Use a real one before launch. */
  supportEmail: "support@example.com",
  /** PLACEHOLDER — your links. */
  links: {
    twitter: "https://twitter.com/",
    site: "https://example.com",
  },
} as const;

/* ── Marketing copy (the landing page) ──────────────────────────────────────
   PLACEHOLDER copy that currently describes the TSC Starter itself. Replace it
   with copy for YOUR product — what it is and why someone should sign up. */
export const marketing = {
  hero: {
    badge: "Example landing page",
    headlineTop: "Your big idea,",
    headlineAccent: "live by the weekend.",
    subhead:
      "This is placeholder hero copy. Describe your product here — the outcome a customer gets — then point them at sign-up.",
  },
  /** PLACEHOLDER feature cards. Swap these for your product's real benefits. */
  features: [
    { title: "Auth, done", body: "Email + social login and protected routes, wired in." },
    { title: "Billing, done", body: "Stripe checkout, the customer portal, and subscription sync." },
    { title: "Guided setup", body: "A built-in wizard connects your services without env spelunking." },
    { title: "One product slot", body: "Build your feature into a clean, opinionated foundation." },
  ],
} as const;

/* ── Pricing plans ──────────────────────────────────────────────────────────
   ⚠️ EXAMPLE PLANS — PLACEHOLDERS. These "Basic / Pro" plans exist only to
   demonstrate that billing works end-to-end. They are NOT your real pricing,
   and they are NOT a fee to use TSC Starter. Replace them with the plans YOUR
   customers will pay for. The setup wizard's "Create my plans" button builds
   whatever you define here in your own Stripe account. */
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
  amount: number; // major units, e.g. 19 = $19.00
  currency: string; // ISO code, e.g. "usd"
  interval: "month" | "year";
  /** The env var this plan's Price ID is written to. */
  priceEnvKey: string;
};

export const plans: Plan[] = [
  {
    id: "basic",
    name: "Basic", // EXAMPLE plan name — replace with your own
    description: "Example plan — replace with your own.",
    priceLabel: "$19/mo",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER,
    mode: "subscription",
    amount: 19,
    currency: "usd",
    interval: "month",
    priceEnvKey: "NEXT_PUBLIC_STRIPE_PRICE_STARTER",
    features: ["Example feature one", "Example feature two", "Email support"],
  },
  {
    id: "pro",
    name: "Pro", // EXAMPLE plan name — replace with your own
    description: "Example plan — replace with your own.",
    priceLabel: "$49/mo",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
    mode: "subscription",
    featured: true,
    amount: 49,
    currency: "usd",
    interval: "month",
    priceEnvKey: "NEXT_PUBLIC_STRIPE_PRICE_PRO",
    features: [
      "Everything in Basic",
      "Example feature three",
      "Priority support",
      "Example feature four",
    ],
  },
];

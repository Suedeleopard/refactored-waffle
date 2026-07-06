# TSC Starter

The Scalable Creative's off-the-shelf SaaS install. Auth, billing, transactional
email, and a **guided setup wizard** — ready to stamp into your next microSaaS.
Build the spine once; launch products in a weekend.

**Stack:** Next.js 16 (App Router, TS) · Supabase (Postgres + auth) · Stripe ·
Tailwind v4 · Resend · Vercel.

> **Everything you see on screen is a placeholder.** The name, copy, and the
> example "Basic / Pro" plans are demo content to prove the app works — they're
> *not* your real product or pricing. **[CUSTOMIZE.md](CUSTOMIZE.md)** is the
> crystal-clear map of what to change (mostly one file: `src/lib/config.ts`).

## What you get

- 🔐 **Auth** — email/password, magic links, password reset, protected routes
- 💳 **Billing** — Stripe Checkout, customer portal, webhook → DB sync
- 🚦 **Paywall** — subscription entitlement helper + a worked paywall example
- 🧙 **Setup wizard** — connects Supabase/Stripe/Resend with live validation; even
  creates your Stripe plans for you and verifies your database
- ✉️ **Email** — Resend wired, with a one-time welcome email as the example
- 🎨 **Marketing** — landing page, pricing, legal pages — all driven by one config
- 🧩 **Product slot** — re-skin the whole thing from a single file

## Two ways to set up

**A. With Claude Code (agent-driven).** Open this repo in
[Claude Code](https://claude.com/claude-code) and run **`/setup`**. It interviews
you, makes the app yours, connects Supabase + Stripe, runs the schema, and gets
it running — doing the work for you and only asking for the things only you can
provide (accounts + keys).

**B. With the web wizard (manual).**

```bash
npm install
cp .env.example .env.local   # leave it empty — the wizard fills it in
npm run dev
```

Open <http://localhost:3000>. With no keys set, you're routed to **`/setup`** — the
onboarding wizard. It walks you through each service, explains what it's for,
checks your keys live, and writes them to `.env.local` for you. No manual editing.

In the wizard you'll:
1. **Connect Supabase**, then run the database schema (one copy-paste, the wizard
   verifies it worked).
2. **Connect Stripe** (optional) and click **"Create my plans"** to generate your
   products and prices automatically.
3. **Finish** — and you're in the app.

> Prefer to wire it by hand? Everything maps to [`.env.example`](.env.example).

## Going live

See **[DEPLOY.md](DEPLOY.md)** for the full path to a live site on Vercel
(~15 min, no terminal needed for the production webhook).

## How it's structured

```
src/
  lib/config.ts          ← THE PRODUCT SLOT. Name, copy, pricing. Edit this first.
  lib/env.ts             ← env access + setup detection (drives the wizard)
  lib/subscription.ts    ← entitlement helpers (the paywall layer)
  lib/supabase/          ← browser / server / middleware / admin clients
  lib/stripe.ts, billing.ts, email.ts, welcome.ts
  proxy.ts               ← setup-gate + protected-route auth
  app/page.tsx           ← marketing landing
  app/(auth)/            ← login / signup / forgot + update password
  app/(legal)/           ← privacy / terms
  app/(app)/dashboard/   ← protected app — your feature plugs in here (with paywall)
  app/(app)/account/     ← billing & plan management
  app/setup/             ← onboarding wizard
  app/api/stripe/        ← checkout / portal / webhook
  app/api/setup/         ← validation, plan creation, schema check, env writing
supabase/migrations/     ← database schema
docs/                    ← design spec + the installer-journey map
```

## Launching a new product from this starter

1. Use this repo as a **GitHub template** → new repo.
2. Edit `src/lib/config.ts` (name, tagline, pricing).
3. Replace the product slot in `src/app/(app)/dashboard/page.tsx`.
4. Run the setup wizard, then deploy (see [DEPLOY.md](DEPLOY.md)).

## Scripts

```bash
npm run dev      # local dev
npm run build    # production build
npm test         # unit tests (node --test)
npm run lint     # eslint
```

## Local Stripe webhooks (developers, optional)

Production uses a Dashboard webhook (see DEPLOY.md). To test checkout on your own
machine, use the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Paste the printed `whsec_…` into `STRIPE_WEBHOOK_SECRET`.

---

Built on the TSC Starter.

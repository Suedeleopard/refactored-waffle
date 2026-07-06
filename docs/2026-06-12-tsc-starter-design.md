# TSC Starter — Design Spec

**Date:** 2026-06-12
**Status:** Spine built (this session)
**Owner:** Tom Gamblin / The Scalable Creative

## Goal

A reusable, off-the-shelf SaaS install ("ship fast") that the team builds once
and stamps into many microSaaS products. **ScoreStudio is product #1**, built
from this starter in a later session.

## Distribution model

GitHub **template repo** (ShipFast pattern). Each new product = a fresh repo
stamped from `tsc-starter`, customised via one config file, deployed to Vercel.
Chosen over a monorepo because the goal is *many* small products, not a few
tightly-shared ones.

## Stack

Next.js 16 (App Router, TS) · Supabase (Postgres, auth, storage) · Stripe
(Checkout + portal + webhooks) · Tailwind v4 + hand-rolled shadcn-style UI ·
Resend (email) · Vercel (deploy). Brand: dark-first, `#F9C80E` primary,
`#0147FF` secondary, Poppins (sans/display) + Anonymous Pro (mono) type.

## Architecture

Two layers in one repo:

- **Reusable spine** — auth, billing, account, marketing shell, setup wizard,
  middleware. Inherited free by every product.
- **Product slot** — `src/lib/config.ts` (branding/pricing) +
  `src/app/(app)/dashboard/page.tsx` (the feature). The only files a new
  product must touch.

### Key components

| Unit | Responsibility |
|---|---|
| `lib/config.ts` | Product identity + plans (the slot) |
| `lib/env.ts` | Env access + per-integration setup detection |
| `lib/supabase/*` | client / server / middleware / admin (service-role) |
| `lib/stripe.ts`, `billing.ts` | Lazy Stripe client; customer mapping |
| `middleware.ts` | Setup-gate when unconfigured; auth-gate protected routes |
| `app/setup` + `api/setup` | Onboarding wizard; writes `.env.local` in dev |
| `app/api/stripe/*` | checkout / portal / webhook (syncs subs → DB) |

### The onboarding wizard (differentiator)

Boots with empty env. Middleware funnels first-run users to `/setup`, a guided
**stepper** (welcome → Supabase → Stripe → Resend → done) that for each service
explains *what it does / why you need it / what happens if you skip*, gives a
numbered walkthrough (create project → run schema via copy button → copy keys),
then **tests the credentials live** (`/api/setup/validate` makes a real call to
each service) before saving. Keys are collected in the client and written to
`.env.local` once, at Finish, to avoid a mid-flow dev-server restart; the wizard
then polls until the new env is live and enters the app. In production, writes
are refused and the wizard shows host-env instructions instead. Step + non-secret
values persist to `localStorage` so a refresh resumes where you left off. Makes
the starter installable by non-experts.

### Data model

- `profiles` (1:1 with `auth.users`, holds `stripe_customer_id`; auto-created
  by trigger on signup).
- `subscriptions` (Stripe state mirror, keyed by user; written only by the
  webhook via service role; RLS read-own).

## Error handling

Integrations degrade gracefully when unconfigured: Stripe client returns null,
email no-ops with a warning, the app routes to `/setup`. No crash-on-missing-key.

## Out of scope (this session)

ScoreStudio itself; teams/multi-tenancy; OAuth providers beyond email/magic-link;
usage metering; admin panel. These come after the spine is proven by product #1.

## Next steps

1. Connect Supabase + run migration; verify auth end-to-end.
2. Connect Stripe; verify checkout + webhook subscription sync.
3. Publish as a GitHub template; deploy to Vercel.
4. Stamp ScoreStudio from it (separate spec).

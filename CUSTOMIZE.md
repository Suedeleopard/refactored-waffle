# Make it yours

Everything you see on screen in TSC Starter is a **placeholder** — example
content that's there to prove the app works. This guide lists exactly what to
change, what's safe to ignore, and what's just plumbing you'll never touch.

## First, the one thing to understand about pricing

The app ships with example plans called **"Basic" and "Pro" ($19 / $49/mo)**.

> **These are NOT a fee to use TSC Starter, and they are NOT your real prices.**
> They're a working demo of the subscription system. *Your* customers will pay
> *your* plans. Replace these with your own pricing in `src/lib/config.ts`.

You buy TSC Starter once. Your customers subscribe to the product *you* build with it.

## The one file that makes it yours: `src/lib/config.ts`

Open it — it's labelled top to bottom. Everything there is a placeholder:

| What | Change it to |
|---|---|
| `siteConfig.name` | Your product's name (shows in nav, titles, emails) |
| `siteConfig.tagline` / `description` | Your positioning + meta description |
| `siteConfig.supportEmail` / `links` | Your real support address and links |
| `marketing.hero` | Your landing-page headline + subhead |
| `marketing.features` | Your product's real benefits |
| `plans` | **Your real pricing** (replaces the Basic/Pro examples) |

When you've edited this file, nothing of "TSC Starter" remains on screen.

## Other things you'll see (and should replace)

- **Logo / brand** — `src/components/logo.tsx` (the wordmark) and the colours +
  fonts in `src/app/globals.css`.
- **Legal pages** — `src/app/(legal)/privacy` and `/terms` are placeholder text
  that say so at the top. Replace with your real policies before launch.
- **Welcome email** — `src/lib/welcome.ts` has example copy.
- **Favicon / OG image** — `src/app/favicon.ico` and your social share image.

## The "you're running the demo" banner

While developing you'll see a thin banner: *"Example content — edit
src/lib/config.ts."* It's **dev-only and disappears in production**
(`src/components/demo-banner.tsx`) — delete it once you don't need the reminder.

## What's just plumbing (you'll never see or touch it)

These power the app and aren't customisation points — leave them alone unless
you're extending features:

- `src/lib/supabase/*`, `src/lib/stripe.ts`, `src/lib/billing.ts` — service clients
- `src/app/api/*` — checkout, webhook, setup endpoints
- `src/proxy.ts` — auth + setup gating
- `supabase/migrations/*` — the database schema

## Where your actual product goes

The dashboard at `src/app/(app)/dashboard/page.tsx` has a clearly-marked
**product slot** ("Your product goes here") behind the paywall. That's where you
build the thing customers are paying for. Everything around it — sign-up, login,
billing, account — is already done.

## Quick checklist

- [ ] Edit `src/lib/config.ts` (name, copy, **real pricing**)
- [ ] Replace logo, colours, fonts
- [ ] Rewrite the legal pages
- [ ] Update the welcome email
- [ ] Swap favicon + OG image
- [ ] Build your feature into the dashboard product slot
- [ ] Delete the demo banner
- [ ] Follow [DEPLOY.md](DEPLOY.md) to go live

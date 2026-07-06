# TSC Starter — The Installer Journey

**Date:** 2026-06-14
**Purpose:** Map the exact end-to-end path a real person takes to launch a
microSaaS from TSC Starter, and mark where it's genuinely self-serve vs. where
it still quietly assumes "a developer with a terminal" (or an agent on their
machine). This is the reference for what to build to make the starter truly
off-the-shelf.

## Two installers

The starter must serve both, but they have very different needs:

- **Developer** — comfortable with Node, a terminal, GitHub. Happy to run it
  locally first. *Well covered today.*
- **Non-technical founder** — wants the product **deployed and live**, ideally
  without ever opening a terminal. *This is who the "off-the-shelf" promise is
  really for, and where the gaps are.*

## The hard manual floor (cannot be automated, for anyone)

These need the installer's identity or billing, so no wizard/agent can remove
them. The goal is to make *everything else* one-click.

- Creating the accounts: Supabase, Stripe, Vercel (and Resend if used).
- Authorising GitHub ↔ Vercel (their OAuth).
- Pasting the **first** secret key from each service (secrets can't be read back
  programmatically — that's the point of them).

## The journey, stage by stage

Legend: ✅ self-serve today · ⚠️ works but manual / fragile · ❌ missing

| # | Stage | What happens | Status | Gap → Fix |
|---|---|---|---|---|
| 0 | **Get the starter** | Copy the repo ("Use this template" → their own repo) | ❌ | Not published as a GitHub template yet → push + mark as template; README as the front door |
| 1 | **Create accounts** | Supabase, Stripe, Vercel, (Resend) | ⚠️ | Unavoidable, but surprising mid-flow → add a one-screen **pre-flight checklist** ("you'll need these free accounts") up front |
| 2a | **Run locally** | clone → `npm install` → `npm run dev` → wizard | ⚠️ | Needs Node + terminal → **developer-only**. Fine for devs; a wall for founders |
| 2b | **Run via deploy** | Import repo to Vercel → app live on a URL | ❌ | Friendlier for non-tech, but undocumented, and the wizard can't write env in prod (see 3f) |
| 3a | **Supabase keys** | Paste + live validation | ✅ | — |
| 3b | **Database schema** | Copy SQL → Supabase SQL editor → Run | ✅ verified (2026-06-14) | Was: silent-fail risk. Now the wizard **verifies the tables exist and blocks until they do**. NOTE: true *auto-run* isn't done with the service key (it can't run DDL); that needs an account-wide token (security smell) or the DB password (network-fragile) — deferred |
| 3c | **Stripe keys** | Paste + live validation | ✅ | — |
| 3d | **Stripe plans** | "Create my plans" → products + Price IDs | ✅ | — |
| 3e | **Stripe webhook** | local: Stripe CLI · prod: Dashboard endpoint | ⚠️ | CLI is terminal-heavy and **most people shouldn't do it** → make Dashboard-after-deploy the *only* documented path; drop CLI from the main flow |
| 3f | **Finish** | Writes `.env.local` | ✅ local / ⚠️ prod | Auto-write is **local only**. In prod the wizard just shows instructions → see Stage 4 |
| 4 | **Deploy to production** | Vercel: set env vars (the keys), redeploy; add prod webhook; (domain) | ❌ | The real friction for founders. No guided flow → **deploy checklist + generated env-var list**, optionally a Vercel Deploy button |
| 5 | **Verify it's live** | Sign up, test checkout, confirm sync | ❌ | No guided check → post-deploy **health checklist** |
| 6 | **Make it theirs** | Edit `src/lib/config.ts`, the dashboard product slot | ✅ | The "product slot" design already covers this |

## The one strategic decision underneath all of this

**The wizard is currently a *local-development* configuration tool** — its magic
(validate keys, create plans, auto-write `.env.local`) only fully works on the
installer's own machine. But the "launch a microSaaS" journey is
**deployment-centric**. That mismatch is the root of the "how does this work for
other people" question.

Two ways to resolve it:

- **A — Local-first (cheaper):** keep the wizard as a dev tool. Non-technical
  founders deploy first, and the wizard's job in prod becomes *generating the
  exact env-var list to paste into Vercel* + a deploy checklist. Honest, manual
  paste step remains.
- **B — Deploy-aware wizard (more work, more magic):** teach the wizard to write
  configuration to the host directly via the **Vercel API** (and auto-create the
  production Stripe webhook). Closes almost the whole gap, at the cost of a
  Vercel integration/token step.

Recommendation: **ship A's quick wins now, design toward B.** A removes the
silent-failure (schema) and terminal (webhook) traps for everyone immediately;
B is the bigger bet that makes deployment itself feel hands-off.

## Prioritised build backlog

1. ✅ **Schema verification** — wizard checks the tables exist and blocks the
   Supabase step until they do. *Done 2026-06-14.* (True auto-run deferred — see 3b.)
2. ✅ **Webhook: Dashboard-only in the main flow**; CLI demoted to a README
   footnote. *Done 2026-06-14.*
3. **Publish as a GitHub template** + README front door + pre-flight account
   checklist. *Small.*
4. **Deploy path:** a Vercel deploy guide + a "copy these env vars" screen the
   wizard generates from the entered keys. *Medium.*
5. **(Stretch / Path B)** Wizard writes prod env via the Vercel API and
   auto-creates the production webhook. *Large.* Optional: opt-in schema auto-run
   via a Supabase access token or DB password (dev-only).

## What this means for the current build

Nothing already built is wasted — the wizard, live validation, and "Create my
plans" are exactly the self-serve core. The work ahead is mostly (a) removing two
traps (schema, CLI webhook) and (b) extending the same guided pattern across the
**deploy** boundary, which today just isn't covered.

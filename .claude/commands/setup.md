---
description: Guided setup — make this starter yours and connect Supabase + Stripe
---

You are setting up a new microSaaS built on the **TSC Starter** for the person
running this command. Drive the whole thing yourself, conversationally, and only
ask them for things **only they can provide** (creating accounts, pasting secret
keys). Assume they may be non-technical — be clear, encouraging, one step at a
time. This is the Claude Code equivalent of the app's web setup wizard (`/setup`
route); you may reuse its API endpoints.

## What you'll get them to by the end
A running, branded app with auth + billing, connected to their own Supabase
(and Stripe, if they want payments now).

## The hard floor — only the user can do these
- **Create the accounts**: Supabase (required); Stripe (only if charging now).
- **Paste the secret keys** — secrets can't be read back programmatically.
Everything else, you do for them.

## Ground rules
- Write secret values **straight into `.env.local`** — never echo them back in chat.
- `.env.local` is gitignored. **Never commit secrets.**
- After writing `.env.local`, the dev server must be (re)started to pick it up.
- If a step fails, **debug it** — don't hand-wave. Read the error, fix the cause.

---

## Step 1 — Make it theirs
Ask for their **product name**, a **one-line tagline**, and (if they know) their
**plan names + prices**. Edit `src/lib/config.ts`:
- `siteConfig.name`, `tagline`, `description`, `supportEmail`, `links`
- `marketing.hero` + `marketing.features`
- `plans` (replace the example Basic/Pro with theirs; set `amount`/`interval`)

Show them what changed. Reassure them everything in that file was a placeholder.

## Step 2 — Connect Supabase (required: database + auth)
1. Have them create a project at https://supabase.com/dashboard (free).
2. Two ways to proceed — offer both:
   - **Simple:** they paste their **Project URL**, **anon** key, and
     **service_role** key (Settings → API). Write these to `.env.local`
     (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
     `SUPABASE_SERVICE_ROLE_KEY`). Then have them run the schema:
     copy `supabase/migrations/0001_init.sql` and run it in their Supabase
     **SQL Editor**.
   - **Hands-off:** they paste a **Supabase access token** (`sbp_…` from
     https://supabase.com/dashboard/account/tokens). Then you can do it all via
     the Management API: list projects (`GET /v1/projects`), fetch keys
     (`GET /v1/projects/{ref}/api-keys?reveal=true`), and run the schema
     (`POST /v1/projects/{ref}/database/query` with `{"query": <0001_init.sql>}`).
     Remind them to **revoke the token** when done.
3. Restart the dev server, then verify the tables exist — either query them, or
   start the app and POST to `/api/setup/supabase/check-schema` with the url+key.
   Both `profiles` and `subscriptions` must be present.

## Step 3 — Connect Stripe (optional: payments)
Only if they want to charge now (they can skip and do it later).
1. Have them open a **Sandbox** (account menu, top-left) and copy the **Secret**
   and **Publishable** keys (Developers → API keys). Write to `.env.local`.
2. **Create their plans automatically:** with the dev server running, POST their
   secret key to `/api/setup/stripe/create-plans`. It creates the products +
   prices defined in `config.ts` and returns the Price IDs — write those to
   `.env.local` (`NEXT_PUBLIC_STRIPE_PRICE_*`).
3. The production webhook is set up **after deploy** (Stripe Dashboard → Webhooks
   → endpoint at `/api/stripe/webhook`). Tell them to leave `STRIPE_WEBHOOK_SECRET`
   blank for now.

## Step 4 — Run and verify
Start `npm run dev`. Confirm the app boots past the setup gate (the landing page
loads instead of redirecting to `/setup`). If they want, create a confirmed test
user via the Supabase admin API and confirm signup → dashboard works.

## Step 5 — What's next
Point them at **CUSTOMIZE.md** (logo, colours, legal pages, welcome email) and
**DEPLOY.md** (going live on Vercel). Congratulate them — their SaaS runs.

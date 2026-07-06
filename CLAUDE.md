@AGENTS.md

# TSC Starter

This repo is the **TSC Starter** — an off-the-shelf microSaaS boilerplate
(Next.js 16 + Supabase + Stripe + Tailwind v4 + Resend). Someone has cloned it to
build their own product. Auth, billing, a subscription paywall, transactional
email, and a guided setup wizard are already built.

## If the user wants to set up / install

Run the **`/setup`** command — it's the guided, agent-driven install (connect
Supabase + Stripe, make the app theirs). It's the Claude Code equivalent of the
web wizard at the `/setup` route.

## Key facts when working here

- **Everything on screen is a placeholder.** Product name, copy, and the example
  "Basic / Pro" plans are demo content — NOT the user's real product, and NOT a
  fee to use the starter. The single source of truth is `src/lib/config.ts`. See
  **CUSTOMIZE.md** for the full what-to-change map.
- **The product slot** — `src/app/(app)/dashboard/page.tsx` (behind the paywall)
  is where the user's actual feature goes.
- **Secrets** live only in `.env.local` (gitignored). Never commit them; never
  echo pasted keys back into chat — write them straight to `.env.local`.
- **Setup backend** the agent can reuse: `/api/setup/validate`,
  `/api/setup/stripe/create-plans`, `/api/setup/supabase/check-schema`.
- **Going live:** see **DEPLOY.md**.

## Commands

```bash
npm run dev      # local dev (http://localhost:3000)
npm run build    # production build
npm test         # unit tests (node --test)
npm run lint     # eslint
```

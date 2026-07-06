# Deploying your microSaaS

This takes you from a working local app to a live site on **Vercel**. ~15 minutes.
You'll need free accounts at [GitHub](https://github.com), [Vercel](https://vercel.com),
plus the Supabase and Stripe projects you already set up.

## 1. Push your code to GitHub

If you started from the template, you already have a repo. Otherwise create one
and push:

```bash
git init && git add -A && git commit -m "Initial commit"
gh repo create my-saas --private --source=. --push
```

## 2. Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import your repo.
2. Framework preset auto-detects **Next.js** — leave the defaults.
3. **Before deploying**, add your environment variables (next step).

## 3. Set environment variables

In the import screen (or **Project → Settings → Environment Variables**), paste the
variables the setup wizard gave you. The wizard's final screen has a **"Copy env"**
button that produces exactly this list:

```
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_STRIPE_PRICE_STARTER=...
NEXT_PUBLIC_STRIPE_PRICE_PRO=...
RESEND_API_KEY=...
STRIPE_WEBHOOK_SECRET=...   # added in step 5
```

> Set `NEXT_PUBLIC_SITE_URL` to your real domain — Stripe redirects and emails use it.

Then click **Deploy**.

## 4. Run your database schema (if you haven't)

In Supabase → **SQL Editor**, paste the contents of
[`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) and run it.

## 5. Add the production Stripe webhook

Local development used the Stripe CLI; production uses a real endpoint — **no terminal**.

1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**.
2. Endpoint URL: `https://your-domain.com/api/stripe/webhook`
3. Select events: `checkout.session.completed`, `customer.subscription.created`,
   `customer.subscription.updated`, `customer.subscription.deleted`.
4. Copy the **Signing secret** (`whsec_…`) into Vercel as `STRIPE_WEBHOOK_SECRET`,
   then redeploy.

## 6. Verify

- Visit your domain, sign up, confirm you reach the dashboard.
- Subscribe with a [Stripe test card](https://docs.stripe.com/testing) (`4242 4242 4242 4242`).
- Confirm the dashboard unlocks and the account page shows the active plan.

## Custom domain

Vercel → **Project → Settings → Domains** → add your domain and follow the DNS steps.
Remember to update `NEXT_PUBLIC_SITE_URL` and your Stripe webhook URL to match.

## Going from test to live (Stripe)

When you're ready to charge real money, swap your Stripe **test** keys for **live**
keys, recreate your products/prices in live mode, and add a live-mode webhook. Keep
test keys in a Vercel Preview environment if you want a staging setup.

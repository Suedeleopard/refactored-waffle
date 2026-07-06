# TSC Starter — The Storefront (how a customer buys & receives it)

**Date:** 2026-06-15
**Purpose:** Map the *commercial* layer — sales, payment, delivery, access — that
turns the finished product into something a customer can actually buy. The
*install* half (what they do after they have the code) is already built and
smoke-tested; this is the missing other half.

## The commercial journey

```
Discover → Buy → Claim access → Install → Use & update
```

1. **Discover** — a sales page for TSC Starter (what's inside, live demo, pricing, FAQ).
2. **Buy** — one-time payment (boilerplates aren't subscriptions). Capture email.
3. **Claim access** — buyer submits their **GitHub username**; we grant repo access automatically and email them.
4. **Install** — "Use this template" → their repo → the setup wizard → deploy. *(Already built.)*
5. **Use & update** — they keep read access to pull future improvements.

## Components needed

| Component | Purpose | Build or buy | Status |
|---|---|---|---|
| **Sales page** | Convert visitors → buyers | Build (one page) | ❌ |
| **Live demo** | Let them click the real product before buying | Deploy an instance | ❌ (product is ready to deploy) |
| **Checkout** | Take the one-time payment | Buy (Lemon Squeezy) or build (Stripe) | ❌ |
| **GitHub-username capture** | Know who to grant access to | Build (form / checkout field) | ❌ |
| **Delivery automation** | Grant repo access on payment | Build (webhook → GitHub API) | ❌ |
| **Access management** | Track buyers; revoke on refund/chargeback | Build (DB + small admin) | ❌ |
| **Post-purchase email** | Send the invite + getting-started | Resend (already wired in the product) | ⚠️ reuse |
| **The product itself** | What they install | — | ✅ done |

## The delivery mechanism (the core piece)

This is what makes it "automatic". The pattern:

1. Keep the finished product as a **private GitHub template repo** (`tsc-starter`).
2. On payment, a webhook receives the buyer's email + GitHub username.
3. Call the **GitHub API** to grant them **read access** — cleanest via a GitHub
   **org + team** (add member to the team that has read on the repo), rather than
   per-repo outside collaborators (which get unwieldy at volume).
4. Email them the accept-invite link + "Use this template" instructions.
5. They click **Use this template** → they own a fresh repo; read access is enough
   to clone and to pull your updates later.
6. On refund/chargeback → remove them from the team (revokes access).

Refund-proofing and update delivery both fall out of "access = team membership".

## Two build paths

**Path A — Lemon Squeezy (recommended fast-start).**
List TSC Starter as a digital product. Lemon Squeezy hosts checkout, **acts as
merchant of record (handles global tax/VAT for you — a real headache otherwise)**,
sends receipts, and fires a webhook on purchase. Your only build is a tiny
function: receive the webhook → take the GitHub username (a Lemon Squeezy custom
checkout field) → call the GitHub API → done. Live in days.
*Trade-off:* they take ~5% + fees; checkout is on their domain.

**Path B — Self-built storefront (Stripe).**
Your own sales page + Stripe one-time Checkout + webhook + GitHub API + buyer DB.
Full control and branding, keeps all revenue, **but you own tax/VAT compliance**
and more build. Notably, this storefront could itself be built on TSC Starter —
dogfooding — but the delivery/access logic is custom either way.

**Recommendation:** Launch on **Path A** to validate demand and stay tax-compliant
from day one; graduate to **Path B** once volume justifies the build and the saved
fees.

## What you already have that helps

- **The product is the demo.** Deploy one instance to Vercel and that's your live
  demo *and* proof it works — high-leverage, low effort.
- **Resend is wired**, so post-purchase email reuses existing code.
- **Stripe integration is proven** (smoke-tested), if you go Path B.

## Open decisions (before building)

1. **Pricing** — one-time only, or one-time + optional "updates/support" renewal? Tiers?
2. **Repo structure** — single private template repo + a buyers' GitHub org/team.
3. **Updates** — how buyers pull improvements (documented `git remote` + pull, or a sync script).
4. **Refund policy** — window + automatic access revocation.
5. **Buyer type** — *deferred*: technical self-serve vs. non-technical done-for-you. This
   still ultimately shapes pricing and how much hand-holding the storefront promises.

## Recommended MVP sequence

1. **Publish** the finished repo as a private GitHub template (+ make a buyers' org/team).
2. **Deploy a live demo** to Vercel.
3. **Lemon Squeezy product** + checkout with a "GitHub username" field.
4. **Delivery function** — webhook → GitHub API invite → Resend welcome email.
5. **Sales page** (one page; copy via the brand/voice pipeline).
6. Soft-launch to the TSC audience, watch where buyers get stuck, iterate.

Everything here is net-new on top of a finished, verified product — the hard
engineering (the thing they install) is done.

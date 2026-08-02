import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { plans, type Plan } from "@/lib/config";

/*
  One-click plan creation. Using the submitted (not-yet-saved) Stripe secret
  key, create the products + recurring prices defined in config.ts and return
  their Price IDs so the wizard can fill them in. Idempotent: re-running reuses
  a matching product/price (found by metadata) instead of duplicating.
*/

export async function POST(request: NextRequest) {
  const { secretKey } = (await request.json()) as { secretKey?: string };
  const key = secretKey?.trim();
  if (!key) {
    return NextResponse.json(
      { ok: false, message: "Enter your Stripe secret key in the box first." },
      { status: 200 }
    );
  }

  const stripe = new Stripe(key);
  const created: { name: string; envKey: string; priceId: string; reused: boolean }[] = [];

  try {
    for (const plan of plans) {
      const result = await ensurePlan(stripe, plan);
      created.push({ name: plan.name, envKey: plan.priceEnvKey, ...result });
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Stripe rejected the request — check your secret key.";
    return NextResponse.json({ ok: false, message }, { status: 200 });
  }

  const values: Record<string, string> = {};
  for (const c of created) values[c.envKey] = c.priceId;

  return NextResponse.json({ ok: true, created, values });
}

/** Find-or-create the product and a matching recurring price for a plan. */
async function ensurePlan(
  stripe: Stripe,
  plan: Plan
): Promise<{ priceId: string; reused: boolean }> {
  const product = await findOrCreateProduct(stripe, plan);

  const unitAmount = Math.round(plan.amount * 100);
  const isRecurring = plan.mode === "subscription";
  const prices = await stripe.prices.list({ product: product.id, active: true, limit: 100 });
  const match = prices.data.find(
    (p) =>
      p.unit_amount === unitAmount &&
      p.currency === plan.currency &&
      (isRecurring ? p.recurring?.interval === plan.interval : !p.recurring)
  );
  if (match) return { priceId: match.id, reused: true };

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: unitAmount,
    currency: plan.currency,
    ...(isRecurring ? { recurring: { interval: plan.interval! } } : {}),
    metadata: { tsc_plan_id: plan.id },
  });
  return { priceId: price.id, reused: false };
}

async function findOrCreateProduct(stripe: Stripe, plan: Plan): Promise<Stripe.Product> {
  // Prefer search (exact metadata match); fall back to a list scan if the
  // search index isn't ready or available on this account.
  try {
    const found = await stripe.products.search({
      query: `metadata['tsc_plan_id']:'${plan.id}' AND active:'true'`,
      limit: 1,
    });
    if (found.data[0]) return found.data[0];
  } catch {
    const list = await stripe.products.list({ active: true, limit: 100 });
    const hit = list.data.find((p) => p.metadata?.tsc_plan_id === plan.id);
    if (hit) return hit;
  }

  return stripe.products.create({
    name: plan.name,
    description: plan.description,
    metadata: { tsc_plan_id: plan.id },
  });
}

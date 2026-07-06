import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";

/**
 * Stripe webhook. Verifies the signature, then syncs subscription state into
 * the `subscriptions` table (keyed by Supabase user id) so the app always
 * reflects the source of truth in Stripe.
 *
 * Locally: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
 */
export async function POST(request: NextRequest) {
  const stripe = getStripe();
  if (!stripe || !env.stripeWebhookSecret) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 400 });
  }
  // Writing subscription rows needs the service-role key; fail cleanly if absent
  // rather than throwing when the admin client is constructed.
  if (!env.supabaseServiceRole) {
    return NextResponse.json({ error: "supabase_admin_not_configured" }, { status: 400 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, env.stripeWebhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "invalid_signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = createAdminClient();

  async function upsertSubscription(sub: Stripe.Subscription) {
    const userId =
      (sub.metadata?.supabase_user_id as string | undefined) ?? null;
    if (!userId) return;

    const item = sub.items.data[0];
    await supabase.from("subscriptions").upsert(
      {
        user_id: userId,
        stripe_subscription_id: sub.id,
        stripe_customer_id: sub.customer as string,
        status: sub.status,
        price_id: item?.price.id ?? null,
        current_period_end: item?.current_period_end
          ? new Date(item.current_period_end * 1000).toISOString()
          : null,
      },
      { onConflict: "user_id" }
    );
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await upsertSubscription(event.data.object as Stripe.Subscription);
      break;
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.subscription) {
        // Persist the user mapping onto the Stripe subscription itself, so every
        // later subscription event already carries it. (Checkout also sets this
        // via subscription_data.metadata — this makes it authoritative.)
        const sub = session.client_reference_id
          ? await stripe.subscriptions.update(session.subscription as string, {
              metadata: { supabase_user_id: session.client_reference_id },
            })
          : await stripe.subscriptions.retrieve(session.subscription as string);
        await upsertSubscription(sub);
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, getOrCreateCustomer } from "@/lib/billing";
import { siteConfig } from "@/lib/config";

/** Create a Stripe Checkout session for the selected price and redirect to it. */
export async function POST(request: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.redirect(new URL("/setup", request.url), { status: 303 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }

  const form = await request.formData();
  const priceId = String(form.get("priceId") ?? "");
  if (!priceId) {
    return NextResponse.redirect(new URL("/account?error=missing_price", request.url), {
      status: 303,
    });
  }

  const customerId = await getOrCreateCustomer(stripe, user.id, user.email!);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteConfig.url}/account?checkout=success`,
    cancel_url: `${siteConfig.url}/account?checkout=cancelled`,
    client_reference_id: user.id,
    subscription_data: { metadata: { supabase_user_id: user.id } },
  });

  if (!session.url) {
    return NextResponse.redirect(new URL("/account?error=checkout_failed", request.url), {
      status: 303,
    });
  }
  return NextResponse.redirect(session.url, { status: 303 });
}

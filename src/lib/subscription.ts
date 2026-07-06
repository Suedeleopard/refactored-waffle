import { createClient } from "@/lib/supabase/server";
import { plans } from "@/lib/config";

/*
  Subscription / entitlement helpers — the paywall layer.

  Read the current user's subscription and answer "can they use paid features?".
  Products built on the starter call hasActiveSubscription() (or getPlan()) to
  gate features. This is the one place entitlement logic lives.
*/

const ACTIVE_STATUSES = ["active", "trialing"];

export type Subscription = {
  status: string | null;
  price_id: string | null;
  current_period_end: string | null;
};

/** The current user's subscription row, or null if none. */
export async function getSubscription(): Promise<Subscription | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("subscriptions")
    .select("status, price_id, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle<Subscription>();

  return data ?? null;
}

/** True when the user has a usable (active or trialing) subscription. */
export async function hasActiveSubscription(): Promise<boolean> {
  const sub = await getSubscription();
  return Boolean(sub && ACTIVE_STATUSES.includes(sub.status ?? ""));
}

/** The plan (from config) the user is currently on, or null. */
export async function getPlan() {
  const sub = await getSubscription();
  if (!sub || !ACTIVE_STATUSES.includes(sub.status ?? "")) return null;
  return plans.find((p) => p.priceId && p.priceId === sub.price_id) ?? null;
}

export { ACTIVE_STATUSES };

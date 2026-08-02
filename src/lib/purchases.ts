import { createClient } from "@/lib/supabase/server";
import { plans } from "@/lib/config";

/*
  Purchase / entitlement helpers — the paywall layer for one-time payments.

  Read the current user's purchases and answer "what do they own?". Products
  built on the starter call hasPurchased() (or getOwnedPlan()) to gate
  features. This is the one place one-time-purchase entitlement logic lives.
*/

export type Purchase = {
  plan_id: string;
  price_id: string | null;
  created_at: string;
};

/** All one-time purchases the current user has made. */
export async function getPurchases(): Promise<Purchase[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("purchases")
    .select("plan_id, price_id, created_at")
    .eq("user_id", user.id);

  return data ?? [];
}

/** True when the user owns the given plan, or owns anything at all if omitted. */
export async function hasPurchased(planId?: string): Promise<boolean> {
  const purchases = await getPurchases();
  if (!planId) return purchases.length > 0;
  return purchases.some((p) => p.plan_id === planId);
}

/** The highest-value plan (from config) the user owns, or null. */
export async function getOwnedPlan() {
  const purchases = await getPurchases();
  const owned = plans.filter((p) => purchases.some((pur) => pur.plan_id === p.id));
  if (owned.length === 0) return null;
  return owned.reduce((best, p) => (p.amount > best.amount ? p : best));
}

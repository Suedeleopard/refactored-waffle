import Stripe from "stripe";
import { env } from "@/lib/env";

/**
 * Lazily-constructed Stripe client. Returns null when Stripe isn't configured
 * yet, so the app boots without keys and the setup wizard can guide connection.
 */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!env.stripeSecretKey) return null;
  if (!_stripe) {
    _stripe = new Stripe(env.stripeSecretKey, {
      // Pin via the account's default API version.
      typescript: true,
    });
  }
  return _stripe;
}

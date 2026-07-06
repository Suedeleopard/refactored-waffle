import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Service-role Supabase client. Bypasses RLS — use ONLY in trusted server
 * contexts (e.g. Stripe webhooks) where there is no user session to act on
 * behalf of. Never import this into client code.
 */
export function createAdminClient() {
  return createSupabaseClient(env.supabaseUrl!, env.supabaseServiceRole!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

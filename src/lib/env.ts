/*
  Environment + setup detection.

  Instead of crashing on missing keys, the starter detects what's configured
  and routes first-run installers to /setup. This is what makes the install
  "off the shelf" — you can boot the app with an empty .env and be guided
  through connecting Supabase, Stripe, and Resend.

  Secrets are only read on the server. Never import this into a client component
  expecting secret values — use getSetupStatus() shape via a server action/route.
*/

function has(value: string | undefined | null): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export const env = {
  // Supabase (NEXT_PUBLIC_* are safe in the browser; service role is server-only)
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceRole: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,

  // Resend (transactional email)
  resendApiKey: process.env.RESEND_API_KEY,

  // Anthropic — optional. Powers the suggest buttons on /play. Absent means
  // those buttons hide and the seeded library still runs the session.
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,

  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export type IntegrationKey = "supabase" | "stripe" | "resend";

export type IntegrationStatus = {
  key: IntegrationKey;
  label: string;
  /** Required for the app to function at all. */
  required: boolean;
  configured: boolean;
  /** Which env vars this integration needs, and whether each is present. */
  vars: { name: string; present: boolean; public: boolean }[];
};

/** Per-integration setup status. Safe to return to the client (booleans only). */
export function getSetupStatus(): IntegrationStatus[] {
  return [
    {
      key: "supabase",
      label: "Supabase",
      required: true,
      configured: has(env.supabaseUrl) && has(env.supabaseAnonKey),
      vars: [
        { name: "NEXT_PUBLIC_SUPABASE_URL", present: has(env.supabaseUrl), public: true },
        { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", present: has(env.supabaseAnonKey), public: true },
        { name: "SUPABASE_SERVICE_ROLE_KEY", present: has(env.supabaseServiceRole), public: false },
      ],
    },
    {
      key: "stripe",
      label: "Stripe",
      required: false,
      configured: has(env.stripeSecretKey) && has(env.stripePublishableKey),
      vars: [
        { name: "STRIPE_SECRET_KEY", present: has(env.stripeSecretKey), public: false },
        { name: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", present: has(env.stripePublishableKey), public: true },
        { name: "STRIPE_WEBHOOK_SECRET", present: has(env.stripeWebhookSecret), public: false },
      ],
    },
    {
      key: "resend",
      label: "Resend",
      required: false,
      configured: has(env.resendApiKey),
      vars: [{ name: "RESEND_API_KEY", present: has(env.resendApiKey), public: false }],
    },
  ];
}

/** True once every required integration is connected. */
export function isAppConfigured(): boolean {
  return getSetupStatus()
    .filter((s) => s.required)
    .every((s) => s.configured);
}

export const isSupabaseConfigured = () => has(env.supabaseUrl) && has(env.supabaseAnonKey);
export const isStripeConfigured = () => has(env.stripeSecretKey) && has(env.stripePublishableKey);

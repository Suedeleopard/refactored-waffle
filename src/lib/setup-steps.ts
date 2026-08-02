/*
  Onboarding content — the guided setup flow.

  Plain-English framing for someone who has never used these tools. We keep the
  exact button/field names they must find in each dashboard (e.g. "service_role",
  "Publishable key", "Price ID") but explain everything around them in human terms.
  The wizard (src/components/setup-wizard.tsx) renders this; validation lives in
  src/app/api/setup/validate/route.ts.
*/

export type SetupField = {
  /** Env var name written to .env.local. */
  name: string;
  label: string;
  placeholder: string;
  secret: boolean;
  required: boolean;
  /**
   * When set, the field is rendered as a fixed prefix + editable middle + fixed
   * suffix (e.g. https:// | project-id | .supabase.co). The user only types the
   * middle; the stored value is the assembled whole. Makes opaque values like
   * the Supabase Project URL obvious to fill in.
   */
  assemble?: { prefix: string; suffix: string; hint: string };
};

export type WalkthroughStep = {
  title: string;
  body: string;
  link?: { url: string; label: string };
  /** Render a copy button for the setup code under this step. */
  copySql?: boolean;
};

export type SetupStepDef = {
  key: "supabase" | "stripe" | "resend";
  label: string;
  required: boolean;
  tagline: string;
  what: string;
  why: string;
  /** Consequence of skipping — shown only for optional steps. */
  skip?: string;
  estimate: string;
  walkthrough: WalkthroughStep[];
  fields: SetupField[];
};

export const SETUP_STEPS: SetupStepDef[] = [
  {
    key: "supabase",
    label: "Supabase",
    required: true,
    tagline: "Where your accounts and data live",
    what: "Supabase is the secure place your app keeps its information — the list of people who sign up and the details tied to each account. It also runs the login screen, so people can create an account and sign back in.",
    why: "This is the one piece your app can't run without. Without it, no one can sign up or log in, and there's nowhere to keep their information.",
    estimate: "about 3 minutes",
    walkthrough: [
      {
        title: "Create your project",
        body: "Open Supabase and click “New project”. Give it a name, set a password and save it somewhere safe (you'll rarely need it, but it can't be recovered), choose the location closest to you, and create it. It takes a minute or two to get ready.",
        link: { url: "https://supabase.com/dashboard/projects", label: "Open Supabase" },
      },
      {
        title: "Set up your tables",
        body: "This builds the structure your app needs to store accounts and payments. Open the “SQL Editor” from the menu on the left, click “New query”, press the Copy button below, paste it in, and click “Run”. You don't need to understand the code — it just sets everything up for you.",
        link: { url: "https://supabase.com/dashboard/project/_/sql/new", label: "Open the SQL Editor" },
        copySql: true,
      },
      {
        title: "Find your project ID",
        body: "The quickest way: look at your browser's address bar while you're in the project. It reads supabase.com/dashboard/project/abcd1234… — that code after “project/” is your project ID. Paste just that into the first box below. (You'll also find it under Settings → API as the “Project URL”, where it sits between https:// and .supabase.co.)",
        link: { url: "https://supabase.com/dashboard/project/_/settings/api", label: "Open Settings → API" },
      },
      {
        title: "Copy your two keys",
        body: "On that same Settings → API page, copy the two keys into the boxes below. The first is the public one (“anon public”, or “publishable” on newer projects). The second is the private one (“service_role”, or “secret”) — it's only ever used behind the scenes, so keep it safe.",
        link: { url: "https://supabase.com/dashboard/project/_/settings/api", label: "Open Settings → API" },
      },
    ],
    fields: [
      {
        name: "NEXT_PUBLIC_SUPABASE_URL",
        label: "Your project ID",
        placeholder: "your-project-id",
        secret: false,
        required: true,
        assemble: {
          prefix: "https://",
          suffix: ".supabase.co",
          hint: "Just the ID — we'll build the full address around it.",
        },
      },
      {
        name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        label: "Public key (marked “anon public” or “publishable”)",
        placeholder: "starts with eyJ… or sb_publishable_…",
        secret: false,
        required: true,
      },
      {
        name: "SUPABASE_SERVICE_ROLE_KEY",
        label: "Secret key (marked “service_role” or “secret”)",
        placeholder: "starts with eyJ… or sb_secret_… — keep private",
        secret: true,
        required: true,
      },
    ],
  },
  {
    key: "stripe",
    label: "Stripe",
    required: false,
    tagline: "How you get paid",
    what: "Stripe takes care of payments. It shows the checkout screen, charges cards automatically for monthly or yearly plans, and gives customers their own page to change or cancel. Your app stays in step with Stripe, so each person's plan is always up to date.",
    why: "Connect this when you're ready to charge money. You can build and try everything else without it.",
    skip: "Skipping is fine for now — the pricing and account pages will show a small “payments not connected yet” note, and you can come back here any time before you launch.",
    estimate: "about 5 minutes",
    walkthrough: [
      {
        title: "Open a test sandbox and copy your keys",
        body: "Stripe gives you a safe “Sandbox” to try things without moving real money. Open the account menu at the top-left of the Stripe dashboard and pick (or create) a Sandbox. (Some older accounts show a “Test mode” toggle near the top-right instead — it does the same job.) Then go to Developers → API keys and copy the two keys below.",
        link: { url: "https://dashboard.stripe.com/apikeys", label: "Open Stripe → API keys" },
      },
      {
        title: "Create your plans and copy each Price ID",
        body: "Easiest way: once your secret key is in the box, use the “Create my plans in Stripe” button below and the app builds them for you and fills in the Price IDs — skip the rest of this step. Prefer to do it by hand? Open “Products” → “Add product”, name it, set the amount, pick “One time” (or “Recurring” if your plan renews), and save. Then open the product, click the price you made, and copy the “Price ID” from the top-right of the price page — it starts with price_ (not prod_, which won't work).",
        link: { url: "https://dashboard.stripe.com/products", label: "Open Stripe → Products" },
      },
      {
        title: "Keep subscriptions in sync (set this up after you deploy)",
        body: "This keeps your app's plan records in step with Stripe. You only need it once you're taking real payments, and it's a no-terminal, two-minute job once your site is live: go to Developers → Webhooks → “Add endpoint”, paste your live address followed by /api/stripe/webhook (e.g. https://yoursite.com/api/stripe/webhook), choose the subscription events, and copy the signing secret (starts with whsec_) into the box below. For now, leave it blank and skip — nothing else needs it. (Developers who want to test checkout locally can use the Stripe CLI instead — see the README.)",
        link: { url: "https://dashboard.stripe.com/webhooks", label: "Open Stripe → Webhooks" },
      },
    ],
    fields: [
      {
        name: "STRIPE_SECRET_KEY",
        label: "Secret key",
        placeholder: "sk_test_…",
        secret: true,
        required: true,
      },
      {
        name: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
        label: "Publishable key",
        placeholder: "pk_test_…",
        secret: false,
        required: true,
      },
      {
        name: "NEXT_PUBLIC_STRIPE_PRICE_STARTER",
        label: "The Kit — Price ID",
        placeholder: "price_… (not prod_…)",
        secret: false,
        required: false,
      },
      {
        name: "NEXT_PUBLIC_STRIPE_PRICE_PRO",
        label: "The Kit + Vault — Price ID",
        placeholder: "price_… (not prod_…)",
        secret: false,
        required: false,
      },
      {
        name: "STRIPE_WEBHOOK_SECRET",
        label: "Webhook signing secret",
        placeholder: "whsec_… (leave blank until you deploy)",
        secret: true,
        required: false,
      },
    ],
  },
  {
    key: "resend",
    label: "Resend",
    required: false,
    tagline: "Sending emails",
    what: "Resend sends the emails your app needs to send — things like login links and receipts — reliably, and from your own name.",
    why: "Optional while you're building. During setup, login emails are sent for you, so you don't need this yet.",
    skip: "Safe to skip for now. Any email your app would send simply waits until you add a key. Connect it before you launch so emails come from you.",
    estimate: "about 2 minutes",
    walkthrough: [
      {
        title: "Create a key",
        body: "Sign up at Resend, open “API Keys”, and create one that's allowed to send. Copy it (it starts with re_) into the box below.",
        link: { url: "https://resend.com/api-keys", label: "Open Resend → API Keys" },
      },
      {
        title: "Use your own email address (later)",
        body: "To send from your own web address instead of a test one, add and confirm your domain under “Domains”. You can do this any time after you launch.",
        link: { url: "https://resend.com/domains", label: "Open Resend → Domains" },
      },
    ],
    fields: [
      {
        name: "RESEND_API_KEY",
        label: "API key",
        placeholder: "re_…",
        secret: true,
        required: true,
      },
    ],
  },
];

/** The setup code the Supabase walkthrough offers as a copy button. */
export const MIGRATION_SQL = `-- TSC Starter — initial schema
-- Profiles (1:1 with auth.users) and subscriptions (Stripe state mirror).

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  stripe_customer_id text unique,
  welcomed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by their owner"
  on public.profiles for select using (auth.uid() = id);

create policy "Profiles are updatable by their owner"
  on public.profiles for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stripe_subscription_id text unique,
  stripe_customer_id text,
  status text,
  price_id text,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Subscriptions are viewable by their owner"
  on public.subscriptions for select using (auth.uid() = user_id);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan_id text not null,
  price_id text,
  stripe_customer_id text,
  stripe_checkout_session_id text unique,
  amount_total integer,
  currency text,
  created_at timestamptz not null default now()
);

alter table public.purchases enable row level security;

create policy "Purchases are viewable by their owner"
  on public.purchases for select using (auth.uid() = user_id);

-- Role privileges (required on top of RLS). service_role bypasses RLS and needs
-- these so the Stripe webhook can write subscription/purchase rows.
grant select, insert, update, delete on public.profiles to anon, authenticated, service_role;
grant select, insert, update, delete on public.subscriptions to anon, authenticated, service_role;
grant select, insert, update, delete on public.purchases to anon, authenticated, service_role;
`;

-- TSC Starter — initial schema
-- Profiles (1:1 with auth.users) and subscriptions (Stripe state mirror).
-- Run this in the Supabase SQL editor, or via `supabase db push`.

-- ─────────────────────────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  stripe_customer_id text unique,
  welcomed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by their owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles are updatable by their owner"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
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

-- ─────────────────────────────────────────────────────────────
-- subscriptions  (written only by the Stripe webhook via service role)
-- ─────────────────────────────────────────────────────────────
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
  on public.subscriptions for select
  using (auth.uid() = user_id);
-- No insert/update/delete policies: only the service role (webhook) writes here.

-- ─────────────────────────────────────────────────────────────
-- purchases  (one-time payments, written only by the Stripe webhook)
-- ─────────────────────────────────────────────────────────────
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
  on public.purchases for select
  using (auth.uid() = user_id);
-- No insert/update/delete policies: only the service role (webhook) writes here.

-- ─────────────────────────────────────────────────────────────
-- Role privileges
-- RLS above controls *row* access for anon/authenticated. These table-level
-- grants are still required on top of RLS — and service_role (which bypasses
-- RLS) needs them so the Stripe webhook can write subscription/purchase rows.
-- Without these, writes fail with "permission denied for table".
-- ─────────────────────────────────────────────────────────────
grant select, insert, update, delete on public.profiles to anon, authenticated, service_role;
grant select, insert, update, delete on public.subscriptions to anon, authenticated, service_role;
grant select, insert, update, delete on public.purchases to anon, authenticated, service_role;

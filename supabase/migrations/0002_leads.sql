-- Leads captured from the public site.
--
-- Two sources feed this table:
--   'swap-sheet' — the free one-page download, email only.
--   'sprint'     — a Pitch Sprint enquiry, with the opportunity details.
--
-- Written only by the service role (the /api/leads route). There are no RLS
-- policies below on purpose: that denies all access to anon and authenticated
-- clients, so nobody can read the list back out through the public API.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('swap-sheet', 'sprint')),
  email text not null,
  name text,
  company text,
  -- What they're pitching for. Free text; only set for 'sprint'.
  opportunity text,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

-- One row per email per source. A repeat submission updates nothing and errors
-- cleanly, which the API route treats as success (see onConflict handling).
create unique index if not exists leads_kind_email_idx on public.leads (kind, lower(email));

create index if not exists leads_created_at_idx on public.leads (created_at desc);

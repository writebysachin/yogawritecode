-- Yoga Write Code: new billing + credits + Google migrations (paste whole file, Run)

-- ===================================================================
-- supabase/migrations/20261013000000_profiles_credits_referrals.sql
-- ===================================================================
-- Credits + referral foundation for $9/$19/$40 tiers.
-- No-card trial stays default; card add and referrals grant bonuses with caps.

alter table public.profiles
  add column if not exists ai_credits_balance integer not null default 50,
  add column if not exists card_bonus_claimed boolean not null default false,
  add column if not exists referral_code text,
  add column if not exists referred_by text,
  add column if not exists free_months_earned integer not null default 0;

create unique index if not exists profiles_referral_code_idx
  on public.profiles (referral_code) where referral_code is not null;

-- ===================================================================
-- supabase/migrations/20261014000000_credit_ledger.sql
-- ===================================================================
-- Per-step credit ledger for real-time usage tracking.
-- Every reserve/refund/claim appends a row with the model that served it.

create table if not exists public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  delta integer not null,
  balance_after integer,
  reason text not null,
  step text,
  model text,
  created_at timestamptz not null default now()
);

create index if not exists credit_ledger_user_id_idx on public.credit_ledger (user_id);
create index if not exists credit_ledger_user_created_idx on public.credit_ledger (user_id, created_at desc);

alter table public.credit_ledger enable row level security;

drop policy if exists credit_ledger_select_own on public.credit_ledger;
create policy credit_ledger_select_own on public.credit_ledger for select using (auth.uid() = user_id);
drop policy if exists credit_ledger_insert_own on public.credit_ledger;
create policy credit_ledger_insert_own on public.credit_ledger for insert with check (auth.uid() = user_id);

-- ===================================================================
-- supabase/migrations/20261015000000_google_connections.sql
-- ===================================================================
-- Google OAuth connections (Search Console + Analytics read-only).
-- Refresh tokens are stored AES-256-GCM encrypted, never in plain text.

create table if not exists public.google_connections (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  google_email text,
  refresh_token_enc text not null,
  scopes text not null default '',
  connected_at timestamptz not null default now()
);

alter table public.google_connections enable row level security;

drop policy if exists google_connections_select_own on public.google_connections;
create policy google_connections_select_own on public.google_connections for select using (auth.uid() = user_id);
drop policy if exists google_connections_insert_own on public.google_connections;
create policy google_connections_insert_own on public.google_connections for insert with check (auth.uid() = user_id);
drop policy if exists google_connections_update_own on public.google_connections;
create policy google_connections_update_own on public.google_connections for update using (auth.uid() = user_id);


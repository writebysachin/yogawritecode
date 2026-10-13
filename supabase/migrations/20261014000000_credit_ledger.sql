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

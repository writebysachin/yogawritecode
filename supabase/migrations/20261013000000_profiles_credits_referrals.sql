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

-- Store which paid plan the customer is currently on.
-- The Dodo webhook writes this from metadata_plan on every activating event.
-- Falls back to null for free / legacy rows that pre-date this column.

alter table public.profiles
  add column if not exists current_plan text;

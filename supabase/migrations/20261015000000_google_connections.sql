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

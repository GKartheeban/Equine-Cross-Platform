-- EquineTrade update 010: buyers can save (shortlist) horses.
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.

create table if not exists public.saved_listings (
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

alter table public.saved_listings enable row level security;

-- Each person can only see, add and remove their own saved horses
drop policy if exists "Users view own saved" on public.saved_listings;
create policy "Users view own saved"
  on public.saved_listings for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users save horses" on public.saved_listings;
create policy "Users save horses"
  on public.saved_listings for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users unsave horses" on public.saved_listings;
create policy "Users unsave horses"
  on public.saved_listings for delete to authenticated
  using (user_id = auth.uid());

notify pgrst, 'reload schema';

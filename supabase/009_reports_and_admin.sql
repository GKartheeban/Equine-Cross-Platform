-- EquineTrade update 009: listing reports + admin (you) can remove listings.
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.

-------------------------------------------------------------
-- 1. Admins: people allowed to open /admin and remove listings
-------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
-- No policies: nobody can read or change this table through the website.

-- True if the logged-in user is an admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- >>> Make YOUR login an admin. Change the number to the one you log in with
-- >>> (91 + 10-digit mobile number, no + or spaces). Test number shown here.
insert into public.admins (user_id)
select id from auth.users where phone = '919876543210'
on conflict do nothing;

-------------------------------------------------------------
-- 2. Admins can see and change every listing (e.g. mark as removed)
-------------------------------------------------------------
drop policy if exists "Admins can view all listings" on public.listings;
create policy "Admins can view all listings"
  on public.listings for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins can update any listing" on public.listings;
create policy "Admins can update any listing"
  on public.listings for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-------------------------------------------------------------
-- 3. Reports from buyers
-------------------------------------------------------------
create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references public.listings (id) on delete cascade,
  reporter_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  reason      text not null check (reason in (
                'Fake or misleading listing',
                'Horse already sold',
                'Wrong price or details',
                'Sick, injured or underage horse',
                'Scam or asked for advance payment',
                'Other')),
  details     text check (char_length(details) <= 500),
  status      text not null default 'open' check (status in ('open', 'resolved')),
  created_at  timestamptz not null default now(),
  unique (listing_id, reporter_id)  -- one report per person per listing
);
create index if not exists reports_status_idx on public.reports (status, created_at desc);

alter table public.reports enable row level security;

drop policy if exists "Users can report listings" on public.reports;
create policy "Users can report listings"
  on public.reports for insert to authenticated
  with check (reporter_id = auth.uid() and status = 'open');

drop policy if exists "Admins can view reports" on public.reports;
create policy "Admins can view reports"
  on public.reports for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins can update reports" on public.reports;
create policy "Admins can update reports"
  on public.reports for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

notify pgrst, 'reload schema';

-- EquineTrade update 005: listings go live immediately (no approval step).
-- Adds a "removed" status for listings you take down, and a daily posting limit.
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.

-- 1. Allowed statuses: 'removed' = taken down by you (admin)
alter table public.listings drop constraint if exists listings_status_check;
alter table public.listings
  add constraint listings_status_check
  check (status in ('pending', 'live', 'sold', 'expired', 'rejected', 'removed'));

-- 2. New listings are live by default; publish any test listings waiting for approval
alter table public.listings alter column status set default 'live';
update public.listings set status = 'live' where status = 'pending';

-- 3. Sellers can post straight to live
drop policy if exists "Sellers can create pending listings" on public.listings;
drop policy if exists "Sellers can create live listings" on public.listings;
create policy "Sellers can create live listings"
  on public.listings for insert to authenticated
  with check (seller_id = auth.uid() and status = 'live');

-- 4. Sellers can edit their own listings and mark them sold,
--    but can't touch a listing you removed, or restore it
drop policy if exists "Sellers can update own listings" on public.listings;
create policy "Sellers can update own listings"
  on public.listings for update to authenticated
  using (seller_id = auth.uid() and status <> 'removed')
  with check (seller_id = auth.uid() and status in ('live', 'sold'));

-- 5. Anti-spam: max 5 new listings per seller in any 24 hours
create or replace function public.limit_daily_listings()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (
    select count(*) from public.listings
    where seller_id = new.seller_id
      and created_at > now() - interval '24 hours'
  ) >= 5 then
    raise exception 'DAILY_LIMIT: You can post up to 5 horses per day. Please try again tomorrow.';
  end if;
  return new;
end $$;

drop trigger if exists listings_daily_limit on public.listings;
create trigger listings_daily_limit
  before insert on public.listings
  for each row execute function public.limit_daily_listings();

-- Tell Supabase's API about the changes straight away
notify pgrst, 'reload schema';

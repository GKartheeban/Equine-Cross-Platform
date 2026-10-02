-- EquineTrade update 008: number of live horses per district,
-- used to show the busiest districts first on the Home page.
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.

create or replace view public.live_district_counts
with (security_invoker = true)  -- respects the listings security rules (only live horses count)
as
select district, count(*)::int as horses
from public.listings
where status = 'live'
group by district;

grant select on public.live_district_counts to anon, authenticated;

notify pgrst, 'reload schema';

-- EquineTrade update 014: data for the admin dashboards.
--  * Records when a horse is marked sold (to measure "days to sell")
--  * One function that returns all dashboard numbers at once (admins only)
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.

-------------------------------------------------------------
-- 1. When was a horse sold?
-------------------------------------------------------------
alter table public.listings add column if not exists sold_at timestamptz;

create or replace function public.set_sold_at()
returns trigger language plpgsql as $$
begin
  if new.status = 'sold' and old.status is distinct from 'sold' then
    new.sold_at := now();
  elsif new.status <> 'sold' then
    new.sold_at := null;
  end if;
  return new;
end $$;

drop trigger if exists listings_set_sold_at on public.listings;
create trigger listings_set_sold_at
  before update of status on public.listings
  for each row execute function public.set_sold_at();

-- Horses already marked sold before this update: use their last change time
update public.listings set sold_at = updated_at where status = 'sold' and sold_at is null;

-------------------------------------------------------------
-- 2. All dashboard numbers in one call (last p_days days for activity)
-------------------------------------------------------------
create or replace function public.admin_dashboard(p_days int default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, auth
as $$
declare
  since timestamptz := now() - make_interval(days => p_days);
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'Not allowed';
  end if;

  select jsonb_build_object(
    'days', p_days,

    'totals', jsonb_build_object(
      'live',          (select count(*) from listings where status = 'live'),
      'sold',          (select count(*) from listings where status = 'sold'),
      'removed',       (select count(*) from listings where status = 'removed'),
      'users',         (select count(*) from auth.users),
      'newUsers',      (select count(*) from auth.users where created_at >= since),
      'newListings',   (select count(*) from listings where created_at >= since),
      'soldInPeriod',  (select count(*) from listings where sold_at >= since),
      'views',         (select count(*) from events where type = 'view' and created_at >= since),
      'contacts',      (select count(*) from events where type in ('call', 'whatsapp') and created_at >= since),
      'calls',         (select count(*) from events where type = 'call' and created_at >= since),
      'whatsapps',     (select count(*) from events where type = 'whatsapp' and created_at >= since),
      'saves',         (select count(*) from events where type = 'save' and created_at >= since),
      'searches',      (select count(*) from events where type = 'search' and created_at >= since),
      'visitors',      (select count(distinct session_id) from events where created_at >= since),
      'openReports',   (select count(*) from reports where status = 'open')
    ),

    -- One row per day: views, contacts, new listings, new users
    'daily', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'day', to_char(d, 'YYYY-MM-DD'),
        'views',    (select count(*) from events e where e.type = 'view' and e.created_at::date = d),
        'contacts', (select count(*) from events e where e.type in ('call', 'whatsapp') and e.created_at::date = d),
        'listings', (select count(*) from listings l where l.created_at::date = d),
        'users',    (select count(*) from auth.users u where u.created_at::date = d)
      ) order by d), '[]'::jsonb)
      from generate_series((now() - make_interval(days => p_days - 1))::date, now()::date, interval '1 day') as g(d)
    ),

    'devices', (
      select coalesce(jsonb_object_agg(coalesce(device, 'unknown'), n), '{}'::jsonb)
      from (select device, count(*) n from events where created_at >= since group by device) x
    ),
    'locales', (
      select coalesce(jsonb_object_agg(coalesce(locale, 'unknown'), n), '{}'::jsonb)
      from (select locale, count(*) n from events where created_at >= since group by locale) x
    ),

    -- What buyers search for (breed / district slugs)
    'searchBreeds', (
      select coalesce(jsonb_agg(jsonb_build_object('key', k, 'n', n) order by n desc), '[]'::jsonb)
      from (select props->>'breed' k, count(*) n from events
            where type = 'search' and created_at >= since and coalesce(props->>'breed', '') <> ''
            group by 1 order by 2 desc limit 10) x
    ),
    'searchDistricts', (
      select coalesce(jsonb_agg(jsonb_build_object('key', k, 'n', n) order by n desc), '[]'::jsonb)
      from (select props->>'district' k, count(*) n from events
            where type = 'search' and created_at >= since and coalesce(props->>'district', '') <> ''
            group by 1 order by 2 desc limit 38) x
    ),
    -- Searches that found nothing: demand you aren't meeting yet
    'unmet', (
      select coalesce(jsonb_agg(jsonb_build_object('breed', b, 'district', dist, 'n', n) order by n desc), '[]'::jsonb)
      from (select coalesce(props->>'breed', '') b, coalesce(props->>'district', '') dist, count(*) n from events
            where type = 'search' and created_at >= since and props->>'results' = '0'
            group by 1, 2 order by 3 desc limit 8) x
    ),

    -- Trade by breed: live, sold, median asking price
    'byBreed', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'breed', breed, 'live', live, 'sold', sold, 'medianPrice', median_price, 'minPrice', min_price, 'maxPrice', max_price
      ) order by live + sold desc), '[]'::jsonb)
      from (
        select breed,
               count(*) filter (where status = 'live') live,
               count(*) filter (where status = 'sold') sold,
               round(percentile_cont(0.5) within group (order by price_inr)) median_price,
               min(price_inr) min_price,
               max(price_inr) max_price
        from listings where status in ('live', 'sold')
        group by breed
      ) x
    ),

    -- Trade by district: supply (listings) vs interest (views, contacts)
    'byDistrict', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'district', district, 'live', live, 'sold', sold, 'views', views, 'contacts', contacts
      ) order by live + sold desc), '[]'::jsonb)
      from (
        select l.district,
               count(*) filter (where l.status = 'live') live,
               count(*) filter (where l.status = 'sold') sold,
               coalesce(sum(ev.views), 0) views,
               coalesce(sum(ev.contacts), 0) contacts
        from listings l
        left join lateral (
          select count(*) filter (where e.type = 'view') views,
                 count(*) filter (where e.type in ('call', 'whatsapp')) contacts
          from events e where e.listing_id = l.id and e.created_at >= since
        ) ev on true
        where l.status in ('live', 'sold')
        group by l.district
      ) x
    ),

    -- Trade by age group
    'byAge', (
      select coalesce(jsonb_agg(jsonb_build_object('group', g, 'live', live, 'sold', sold, 'medianPrice', mp) order by ord), '[]'::jsonb)
      from (
        select case when age_years <= 2 then '0-2' when age_years <= 5 then '3-5'
                    when age_years <= 10 then '6-10' else '11+' end g,
               min(case when age_years <= 2 then 1 when age_years <= 5 then 2 when age_years <= 10 then 3 else 4 end) ord,
               count(*) filter (where status = 'live') live,
               count(*) filter (where status = 'sold') sold,
               round(percentile_cont(0.5) within group (order by price_inr)) mp
        from listings where status in ('live', 'sold')
        group by 1
      ) x
    ),

    -- Live horses by price range
    'byPrice', (
      select coalesce(jsonb_agg(jsonb_build_object('range', r, 'n', n) order by ord), '[]'::jsonb)
      from (
        select case when price_inr < 50000 then '0-50000' when price_inr < 100000 then '50000-100000'
                    when price_inr < 300000 then '100000-300000' else '300000-' end r,
               min(case when price_inr < 50000 then 1 when price_inr < 100000 then 2
                        when price_inr < 300000 then 3 else 4 end) ord,
               count(*) n
        from listings where status = 'live'
        group by 1
      ) x
    ),

    -- How fast horses sell
    'daysToSell', (
      select jsonb_build_object(
        'count', count(*),
        'median', round(percentile_cont(0.5) within group (order by extract(epoch from sold_at - created_at) / 86400)::numeric, 1),
        'average', round(avg(extract(epoch from sold_at - created_at) / 86400)::numeric, 1)
      )
      from listings where status = 'sold' and sold_at is not null
    ),

    -- Most viewed live horses in the period
    'topHorses', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'slug', slug, 'breed', breed, 'gender', gender, 'district', district, 'price', price_inr,
        'views', views, 'contacts', contacts
      ) order by views desc), '[]'::jsonb)
      from (
        select l.slug, l.breed, l.gender, l.district, l.price_inr,
               count(*) filter (where e.type = 'view') views,
               count(*) filter (where e.type in ('call', 'whatsapp')) contacts
        from listings l join events e on e.listing_id = l.id and e.created_at >= since
        where l.status = 'live'
        group by l.id
        order by 6 desc
        limit 5
      ) x
    )
  ) into result;

  return result;
end $$;

revoke all on function public.admin_dashboard(int) from public, anon;
grant execute on function public.admin_dashboard(int) to authenticated;

notify pgrst, 'reload schema';

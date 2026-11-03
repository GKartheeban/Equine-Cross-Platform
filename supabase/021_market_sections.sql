-- HorseMart update 021: six more sections next to horses.
--   transport  (horse transport services)     -> /transport
--   event      (shows, fairs, races, auctions) -> /events
--   job        (grooms, riders, trainers…)    -> /jobs
--   shop       (tack, feed, equipment)        -> /shop
--   farm       (stud farms)                   -> /stud-farms
--   stud       (stallions for breeding)       -> /studs
-- All six share ONE table, market_posts. Each post has the common fields
-- (title, district, town, price, photos, description) plus a "details" list
-- with the fields that belong to its section (e.g. vehicle type for transport).
-- Like horses: free to post, live straight away, buyers call or WhatsApp.
-- Needs 015 (admin levels and log) to have been run first.
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.

-------------------------------------------------------------
-- 1. The table
-------------------------------------------------------------
create table if not exists public.market_posts (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  section     text not null check (section in ('transport', 'event', 'job', 'shop', 'farm', 'stud')),
  slug        text not null unique,
  -- live = shown; closed = sold / job filled / no longer offered; removed = taken down by an admin
  status      text not null default 'live' check (status in ('live', 'closed', 'removed')),
  title       text not null check (char_length(title) between 3 and 100),
  description text check (char_length(description) <= 2000),
  district    text not null check (char_length(district) <= 40),
  town        text not null check (char_length(town) between 2 and 60),
  price_inr   integer check (price_inr between 0 and 100000000),
  -- how to read the price: fixed, per km, per day, per month, per trip, per cover (stud fee),
  -- free, or "ask" (price on request)
  price_unit  text not null default 'fixed'
                check (price_unit in ('fixed', 'per_km', 'per_day', 'per_month', 'per_trip', 'per_cover', 'free', 'ask')),
  details     jsonb not null default '{}'::jsonb,
  media       jsonb not null default '[]'::jsonb,  -- photos only: [{"type":"photo","path":"..."}]
  starts_on   date,  -- events only
  ends_on     date,  -- events only (optional)
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  check (ends_on is null or starts_on is not null and ends_on >= starts_on),
  check (section <> 'event' or starts_on is not null)
);

create index if not exists market_posts_section_idx on public.market_posts (section, status, created_at desc);
create index if not exists market_posts_owner_idx on public.market_posts (owner_id, created_at desc);
create index if not exists market_posts_event_idx on public.market_posts (starts_on) where section = 'event';

drop trigger if exists market_posts_updated_at on public.market_posts;
create trigger market_posts_updated_at
  before update on public.market_posts
  for each row execute function public.set_updated_at();

-------------------------------------------------------------
-- 2. Rules checked on every save: photos and daily limit
-------------------------------------------------------------
create or replace function public.check_market_post()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if jsonb_typeof(new.media) is distinct from 'array' then
    raise exception 'MEDIA_RULES: media must be a list';
  end if;
  if jsonb_array_length(new.media) > 8 then
    raise exception 'MEDIA_RULES: at most 8 photos';
  end if;
  if exists (
    select 1 from jsonb_array_elements(new.media) e
    where e ->> 'type' <> 'photo' or coalesce(e ->> 'path', '') = ''
  ) then
    raise exception 'MEDIA_RULES: photos only';
  end if;
  if jsonb_typeof(new.details) is distinct from 'object' then
    raise exception 'DETAILS: details must be an object';
  end if;

  -- Anti-spam: at most 5 new posts per person in any 24 hours (all six sections together)
  if tg_op = 'INSERT' and (
    select count(*) from public.market_posts
    where owner_id = new.owner_id and created_at > now() - interval '24 hours'
  ) >= 5 then
    raise exception 'DAILY_LIMIT: You can post up to 5 times per day. Please try again tomorrow.';
  end if;
  return new;
end $$;

drop trigger if exists market_posts_check on public.market_posts;
create trigger market_posts_check
  before insert or update of media, details on public.market_posts
  for each row execute function public.check_market_post();

-------------------------------------------------------------
-- 3. Who can see and change what
-------------------------------------------------------------
alter table public.market_posts enable row level security;

drop policy if exists "Anyone can view live posts" on public.market_posts;
create policy "Anyone can view live posts"
  on public.market_posts for select
  using (status = 'live');

drop policy if exists "Owners view own posts" on public.market_posts;
create policy "Owners view own posts"
  on public.market_posts for select to authenticated
  using (owner_id = auth.uid());

drop policy if exists "Admins view all posts" on public.market_posts;
create policy "Admins view all posts"
  on public.market_posts for select to authenticated
  using (public.is_admin());

drop policy if exists "Owners create live posts" on public.market_posts;
create policy "Owners create live posts"
  on public.market_posts for insert to authenticated
  with check (owner_id = auth.uid() and status = 'live');

-- Owners edit, close and re-open their posts, but can't touch one an admin removed
drop policy if exists "Owners update own posts" on public.market_posts;
create policy "Owners update own posts"
  on public.market_posts for update to authenticated
  using (owner_id = auth.uid() and status <> 'removed')
  with check (owner_id = auth.uid() and status in ('live', 'closed'));

drop policy if exists "Owners delete own posts" on public.market_posts;
create policy "Owners delete own posts"
  on public.market_posts for delete to authenticated
  using (owner_id = auth.uid());

-------------------------------------------------------------
-- 4. The poster's mobile number: only for logged-in users, only for live posts
--    (same rule as horses, see 007)
-------------------------------------------------------------
create or replace function public.get_post_phone(p_post_id uuid)
returns text
language sql
stable
security definer
set search_path = public, auth
as $$
  select u.phone
  from public.market_posts p
  join auth.users u on u.id = p.owner_id
  where p.id = p_post_id and p.status = 'live';
$$;
revoke all on function public.get_post_phone(uuid) from public, anon;
grant execute on function public.get_post_phone(uuid) to authenticated;

-------------------------------------------------------------
-- 5. Admins remove / restore posts (recorded in the action log)
-------------------------------------------------------------
alter table public.admin_actions drop constraint if exists admin_actions_action_check;
alter table public.admin_actions add constraint admin_actions_action_check check (action in (
  'remove_listing', 'restore_listing', 'dismiss_reports',
  'remove_photo', 'remove_name',
  'add_admin', 'change_level', 'remove_admin',
  'reset_password',
  'remove_post', 'restore_post'));

create or replace function public.mod_set_post_status(p_post_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  p public.market_posts;
begin
  if not public.is_admin() then raise exception 'Not allowed'; end if;
  if p_status not in ('removed', 'live') then raise exception 'Bad status'; end if;

  select * into p from public.market_posts where id = p_post_id;
  if not found then raise exception 'Post not found'; end if;
  if p_status = 'live' and p.status <> 'removed' then raise exception 'Only removed posts can be restored'; end if;

  update public.market_posts set status = p_status where id = p_post_id;

  perform public.log_admin_action(
    case when p_status = 'removed' then 'remove_post' else 'restore_post' end,
    null, p.owner_id,
    initcap(p.section) || ': ' || p.title || ' · ' || p.district);
end $$;
revoke all on function public.mod_set_post_status(uuid, text) from public, anon;
grant execute on function public.mod_set_post_status(uuid, text) to authenticated;

-------------------------------------------------------------
-- 6. Number of live posts in each section (for the Explore page)
-------------------------------------------------------------
create or replace view public.live_section_counts
with (security_invoker = true) as
  select section, count(*)::int as posts
  from public.market_posts
  where status = 'live'
    and (section <> 'event' or coalesce(ends_on, starts_on) >= current_date)
  group by section;

grant select on public.live_section_counts to anon, authenticated;

notify pgrst, 'reload schema';

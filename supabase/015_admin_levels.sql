-- EquineTrade update 015: two admin levels + an action log.
--  * L1 (owner): everything. Adds/removes admins, sees the full dashboard and the action log.
--  * L2 (moderator): handles reports and seller profiles, sees a smaller dashboard.
--    L2 cannot see who the admins are, the action log, or the business numbers.
--  * Every moderation action (remove/restore listing, dismiss reports, clear a
--    seller's photo or name, admin changes) is recorded with who did it.
--  * Admins can no longer change listings/reports/profiles directly; only through
--    the functions below, so nothing can skip the log.
-- Needs 009, 012, 013 and 014 to have been run first.
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- NOTE: after this, do NOT run 014 again (it would give L2 the full dashboard).

-------------------------------------------------------------
-- 1. Admin levels. Admins that already exist (you) become L1.
-------------------------------------------------------------
alter table public.admins add column if not exists level smallint not null default 1;
alter table public.admins alter column level set default 2;
alter table public.admins drop constraint if exists admins_level_check;
alter table public.admins add constraint admins_level_check check (level in (1, 2));
alter table public.admins add column if not exists added_by uuid references auth.users (id) on delete set null;

-- 0 = not an admin, 1 = L1, 2 = L2 (only tells you your OWN level)
create or replace function public.admin_level()
returns int
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select level::int from public.admins where user_id = auth.uid()), 0);
$$;
revoke all on function public.admin_level() from public, anon;
grant execute on function public.admin_level() to authenticated;

create or replace function public.is_l1()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid() and level = 1);
$$;
revoke all on function public.is_l1() from public, anon;
grant execute on function public.is_l1() to authenticated;

-------------------------------------------------------------
-- 2. Action log (only L1 can read it; only the functions below write it)
-------------------------------------------------------------
create table if not exists public.admin_actions (
  id             bigint generated always as identity primary key,
  admin_id       uuid references auth.users (id) on delete set null,
  action         text not null check (action in (
                   'remove_listing', 'restore_listing', 'dismiss_reports',
                   'remove_photo', 'remove_name',
                   'add_admin', 'change_level', 'remove_admin')),
  listing_id     uuid references public.listings (id) on delete set null,
  target_user_id uuid references auth.users (id) on delete set null,
  note           text,  -- e.g. "Marwari mare · Madurai" or the removed name
  created_at     timestamptz not null default now()
);
create index if not exists admin_actions_created_idx on public.admin_actions (created_at desc);
alter table public.admin_actions enable row level security;

drop policy if exists "L1 reads admin actions" on public.admin_actions;
create policy "L1 reads admin actions"
  on public.admin_actions for select to authenticated
  using (public.is_l1());

create or replace function public.log_admin_action(
  p_action text, p_listing_id uuid default null, p_target uuid default null, p_note text default null
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.admin_actions (admin_id, action, listing_id, target_user_id, note)
  values (auth.uid(), p_action, p_listing_id, p_target, p_note);
$$;
-- Only called from inside the other functions, never from the website
revoke all on function public.log_admin_action(text, uuid, uuid, text) from public, anon, authenticated;

-------------------------------------------------------------
-- 3. Admins change things only through these functions (L1 and L2)
-------------------------------------------------------------
drop policy if exists "Admins can update any listing" on public.listings;
drop policy if exists "Admins can update reports" on public.reports;
drop policy if exists "Admins update any profile" on public.profiles;

-- Remove a listing (also closes its reports) or put a removed listing back live
create or replace function public.mod_set_listing_status(p_listing_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  l public.listings;
begin
  if not public.is_admin() then raise exception 'Not allowed'; end if;
  if p_status not in ('removed', 'live') then raise exception 'Bad status'; end if;

  select * into l from public.listings where id = p_listing_id;
  if not found then raise exception 'Listing not found'; end if;
  if p_status = 'live' and l.status <> 'removed' then raise exception 'Only removed listings can be restored'; end if;

  update public.listings set status = p_status where id = p_listing_id;
  if p_status = 'removed' then
    update public.reports set status = 'resolved' where listing_id = p_listing_id and status = 'open';
  end if;

  perform public.log_admin_action(
    case when p_status = 'removed' then 'remove_listing' else 'restore_listing' end,
    p_listing_id, l.seller_id,
    l.breed || ' ' || lower(l.gender) || ' · ' || l.district);
end $$;

-- Close a listing's reports without removing it
create or replace function public.mod_dismiss_reports(p_listing_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  l public.listings;
  n int;
begin
  if not public.is_admin() then raise exception 'Not allowed'; end if;
  select * into l from public.listings where id = p_listing_id;
  update public.reports set status = 'resolved' where listing_id = p_listing_id and status = 'open';
  get diagnostics n = row_count;
  perform public.log_admin_action(
    'dismiss_reports', p_listing_id, l.seller_id,
    coalesce(l.breed || ' ' || lower(l.gender) || ' · ' || l.district, '') || ' (' || n || ' reports)');
end $$;

-- Clear a seller's profile photo or name (fake, offensive, impersonation).
-- Returns the old photo's storage path so the page can delete the file.
create or replace function public.mod_clear_profile(p_user_id uuid, p_what text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  p public.profiles;
begin
  if not public.is_admin() then raise exception 'Not allowed'; end if;
  select * into p from public.profiles where id = p_user_id;
  if not found then raise exception 'Profile not found'; end if;

  if p_what = 'photo' then
    update public.profiles set avatar_path = null where id = p_user_id;
    perform public.log_admin_action('remove_photo', null, p_user_id, p.full_name);
    return p.avatar_path;
  elsif p_what = 'name' then
    update public.profiles set full_name = null where id = p_user_id;
    perform public.log_admin_action('remove_name', null, p_user_id, p.full_name);
    return null;
  end if;
  raise exception 'Bad option';
end $$;

-- Name rule update: when an admin clears someone's name, skip the 30-day limit
-- and don't start a new 30-day lock (the seller can set a proper name right away).
create or replace function public.guard_name_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  by_admin boolean := auth.uid() is distinct from new.id and public.is_admin();
begin
  if coalesce(new.full_name, '') is distinct from coalesce(old.full_name, '') then
    if not by_admin
       and old.full_name is not null
       and old.name_changed_at is not null
       and old.name_changed_at > now() - interval '30 days' then
      raise exception 'NAME_LIMIT: You can change your name again on %.',
        to_char(old.name_changed_at + interval '30 days', 'DD Mon YYYY');
    end if;

    insert into public.profile_name_history (user_id, old_name, new_name)
    values (new.id, old.full_name, new.full_name);

    if old.full_name is not null and not by_admin then
      new.name_changed_at := now();
    end if;
  end if;
  return new;
end $$;

revoke all on function public.mod_set_listing_status(uuid, text) from public, anon;
revoke all on function public.mod_dismiss_reports(uuid) from public, anon;
revoke all on function public.mod_clear_profile(uuid, text) from public, anon;
grant execute on function public.mod_set_listing_status(uuid, text) to authenticated;
grant execute on function public.mod_dismiss_reports(uuid) to authenticated;
grant execute on function public.mod_clear_profile(uuid, text) to authenticated;

-------------------------------------------------------------
-- 4. Team (L1 only): list, add, change level, remove admins
-------------------------------------------------------------
create or replace function public.admin_team()
returns table (user_id uuid, phone text, name text, level smallint, added_at timestamptz, is_me boolean)
language plpgsql
stable
security definer
set search_path = public, auth
as $$
begin
  if not public.is_l1() then raise exception 'Not allowed'; end if;
  return query
    select a.user_id, u.phone::text, p.full_name, a.level, a.created_at, a.user_id = auth.uid()
    from public.admins a
    join auth.users u on u.id = a.user_id
    left join public.profiles p on p.id = a.user_id
    order by a.level, a.created_at;
end $$;

-- Add an admin by mobile number (they must have logged in once), or change their level
create or replace function public.admin_add(p_phone text, p_level int)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_phone text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  v_user uuid;
  v_old smallint;
begin
  if not public.is_l1() then raise exception 'Not allowed'; end if;
  if p_level not in (1, 2) then raise exception 'Bad level'; end if;
  if length(v_phone) = 10 then v_phone := '91' || v_phone; end if;
  if v_phone !~ '^91[6-9][0-9]{9}$' then raise exception 'BAD_PHONE'; end if;

  select id into v_user from auth.users where phone = v_phone;
  if v_user is null then raise exception 'NO_USER'; end if;

  select level into v_old from public.admins where user_id = v_user;
  if v_old = p_level then return; end if;
  if v_old = 1 and p_level = 2 and (select count(*) from public.admins where level = 1) <= 1 then
    raise exception 'LAST_L1';
  end if;

  insert into public.admins (user_id, level, added_by) values (v_user, p_level, auth.uid())
  on conflict (user_id) do update set level = excluded.level;

  perform public.log_admin_action(
    case when v_old is null then 'add_admin' else 'change_level' end,
    null, v_user, '+' || v_phone || ' as L' || p_level);
end $$;

create or replace function public.admin_remove(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_level smallint;
  v_phone text;
begin
  if not public.is_l1() then raise exception 'Not allowed'; end if;
  select level into v_level from public.admins where user_id = p_user_id;
  if v_level is null then return; end if;
  if v_level = 1 and (select count(*) from public.admins where level = 1) <= 1 then
    raise exception 'LAST_L1';
  end if;
  select phone into v_phone from auth.users where id = p_user_id;
  delete from public.admins where user_id = p_user_id;
  perform public.log_admin_action('remove_admin', null, p_user_id, '+' || v_phone || ' (was L' || v_level || ')');
end $$;

-- The action log with who did each action (L1 only)
create or replace function public.admin_log(p_limit int default 100)
returns table (
  id bigint, created_at timestamptz, action text, note text,
  admin_name text, admin_phone text, admin_level smallint, listing_slug text
)
language plpgsql
stable
security definer
set search_path = public, auth
as $$
begin
  if not public.is_l1() then raise exception 'Not allowed'; end if;
  return query
    select x.id, x.created_at, x.action, x.note,
           p.full_name, u.phone::text, a.level, l.slug
    from public.admin_actions x
    left join auth.users u on u.id = x.admin_id
    left join public.profiles p on p.id = x.admin_id
    left join public.admins a on a.user_id = x.admin_id
    left join public.listings l on l.id = x.listing_id
    order by x.created_at desc
    limit least(greatest(p_limit, 1), 500);
end $$;

revoke all on function public.admin_team() from public, anon;
revoke all on function public.admin_add(text, int) from public, anon;
revoke all on function public.admin_remove(uuid) from public, anon;
revoke all on function public.admin_log(int) from public, anon;
grant execute on function public.admin_team() to authenticated;
grant execute on function public.admin_add(text, int) to authenticated;
grant execute on function public.admin_remove(uuid) to authenticated;
grant execute on function public.admin_log(int) to authenticated;

-------------------------------------------------------------
-- 5. Raw activity data: L1 only (L2 gets its numbers from the dashboard below)
-------------------------------------------------------------
drop policy if exists "Admins read events" on public.events;
drop policy if exists "L1 reads events" on public.events;
create policy "L1 reads events"
  on public.events for select to authenticated
  using (public.is_l1());

-------------------------------------------------------------
-- 6. Dashboard: L1 gets everything, L2 gets the moderation part only.
--    The full version from 014 is kept under a new name and can't be called directly.
-------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'admin_dashboard_full'
  ) then
    alter function public.admin_dashboard(int) rename to admin_dashboard_full;
  end if;
end $$;
revoke all on function public.admin_dashboard_full(int) from public, anon, authenticated;

create or replace function public.admin_dashboard(p_days int default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  lvl int := public.admin_level();
  v_all jsonb;
begin
  if lvl = 0 then raise exception 'Not allowed'; end if;
  v_all := public.admin_dashboard_full(p_days);
  if lvl = 1 then
    return v_all || jsonb_build_object('level', 1);
  end if;

  return jsonb_build_object(
    'level', 2,
    'days', v_all -> 'days',
    'totals', (v_all -> 'totals') - array['users', 'newUsers', 'sold', 'soldInPeriod', 'removed', 'visitors'],
    'daily', coalesce(
      (select jsonb_agg(d.value - 'users' order by d.ord)
       from jsonb_array_elements(v_all -> 'daily') with ordinality as d(value, ord)),
      '[]'::jsonb),
    'searchBreeds', v_all -> 'searchBreeds',
    'searchDistricts', v_all -> 'searchDistricts',
    'unmet', v_all -> 'unmet'
  );
end $$;
revoke all on function public.admin_dashboard(int) from public, anon;
grant execute on function public.admin_dashboard(int) to authenticated;

notify pgrst, 'reload schema';





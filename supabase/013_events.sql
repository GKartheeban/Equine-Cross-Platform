-- EquineTrade update 013: count activity for the admin dashboards
-- (horse page views, Call/WhatsApp taps, saves, searches).
-- Totals only: no names or phone numbers are stored with events.
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.

create table if not exists public.events (
  id         bigint generated always as identity primary key,
  type       text not null check (type in ('view', 'call', 'whatsapp', 'save', 'search')),
  listing_id uuid references public.listings (id) on delete set null,
  user_id    uuid references auth.users (id) on delete set null, -- only if logged in
  session_id text check (char_length(session_id) <= 40),         -- random code per device
  device     text check (device in ('mobile', 'desktop')),
  locale     text check (locale in ('en', 'ta')),
  props      jsonb not null default '{}'::jsonb,                 -- e.g. search filters
  created_at timestamptz not null default now()
);

create index if not exists events_type_created_idx on public.events (type, created_at desc);
create index if not exists events_listing_idx on public.events (listing_id, type);

alter table public.events enable row level security;

-- Nobody can write to the table directly; only the track_event function below.
-- Only admins can read it.
drop policy if exists "Admins read events" on public.events;
create policy "Admins read events"
  on public.events for select to authenticated
  using (public.is_admin());

-- Records one event. Anyone (even logged out) can call it.
create or replace function public.track_event(
  p_type text,
  p_listing_id uuid default null,
  p_session_id text default null,
  p_device text default null,
  p_locale text default null,
  p_props jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_type not in ('view', 'call', 'whatsapp', 'save', 'search') then
    return;
  end if;

  insert into public.events (type, listing_id, user_id, session_id, device, locale, props)
  values (
    p_type,
    p_listing_id,
    auth.uid(),
    left(p_session_id, 40),
    case when p_device in ('mobile', 'desktop') then p_device end,
    case when p_locale in ('en', 'ta') then p_locale end,
    coalesce(p_props, '{}'::jsonb)
  );

  -- Keep the simple view counter on the listing up to date
  if p_type = 'view' and p_listing_id is not null then
    update public.listings set views = views + 1 where id = p_listing_id and status = 'live';
  end if;
end $$;

revoke all on function public.track_event(text, uuid, text, text, text, jsonb) from public;
grant execute on function public.track_event(text, uuid, text, text, text, jsonb) to anon, authenticated;

notify pgrst, 'reload schema';

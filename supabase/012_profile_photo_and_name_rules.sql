-- EquineTrade update 012: profile photo + safer name changes.
--  * Profile photo (stored in a public "avatars" bucket, max 2 MB)
--  * Name can be changed once every 30 days; every change is recorded
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.

-------------------------------------------------------------
-- 1. New profile columns
-------------------------------------------------------------
alter table public.profiles add column if not exists avatar_path text;
alter table public.profiles add column if not exists name_changed_at timestamptz;

-------------------------------------------------------------
-- 2. Name history (only admins can read it)
-------------------------------------------------------------
create table if not exists public.profile_name_history (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  old_name   text,
  new_name   text,
  changed_at timestamptz not null default now()
);
alter table public.profile_name_history enable row level security;

drop policy if exists "Admins view name history" on public.profile_name_history;
create policy "Admins view name history"
  on public.profile_name_history for select to authenticated
  using (public.is_admin());

-------------------------------------------------------------
-- 3. Name change rules
--    First name: free. After that: once every 30 days. Every change is logged.
-------------------------------------------------------------
create or replace function public.guard_name_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if coalesce(new.full_name, '') is distinct from coalesce(old.full_name, '') then
    if old.full_name is not null
       and old.name_changed_at is not null
       and old.name_changed_at > now() - interval '30 days' then
      raise exception 'NAME_LIMIT: You can change your name again on %.',
        to_char(old.name_changed_at + interval '30 days', 'DD Mon YYYY');
    end if;

    insert into public.profile_name_history (user_id, old_name, new_name)
    values (new.id, old.full_name, new.full_name);

    -- Setting a name for the first time doesn't count as a "change"
    if old.full_name is not null then
      new.name_changed_at := now();
    end if;
  end if;
  return new;
end $$;

drop trigger if exists profiles_guard_name on public.profiles;
create trigger profiles_guard_name
  before update on public.profiles
  for each row execute function public.guard_name_change();

-------------------------------------------------------------
-- 4. Profile photo storage: avatars/<user id>/photo-....jpg
-------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/*'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users upload own avatar" on storage.objects;
create policy "Users upload own avatar"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users view own avatar files" on storage.objects;
create policy "Users view own avatar files"
  on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users delete own avatar" on storage.objects;
create policy "Users delete own avatar"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Admins can remove any profile photo (e.g. fake or offensive) and clear the profile field
drop policy if exists "Admins delete any avatar" on storage.objects;
create policy "Admins delete any avatar"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and public.is_admin());

drop policy if exists "Admins update any profile" on public.profiles;
create policy "Admins update any profile"
  on public.profiles for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

notify pgrst, 'reload schema';

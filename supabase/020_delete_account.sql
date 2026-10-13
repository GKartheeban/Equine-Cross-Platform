-- EquineTrade update 020: "Delete my account" and a record of every deletion.
--  * Users can delete their own account from My profile (after typing their password).
--    Their listings, photos, videos, vet certificates, profile photo, saved horses,
--    reports, recovery code and login are all removed.
--  * A separate table, account_deletions, keeps the timeline of each deletion:
--      requested -> files removed -> completed   (or failed, with the reason)
--    It keeps only a masked mobile number (e.g. +91 98XXXXXX10) and a scrambled
--    (hashed) copy that can spot the same number again, never the number itself.
--    Only L1 admins can read it (Admin -> Deletions).
--  * Admin accounts can't delete themselves here: remove them from the team first.
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.

-------------------------------------------------------------
-- 1. The deletion timeline
-------------------------------------------------------------
create table if not exists public.account_deletions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null,          -- the deleted account's ID (the account itself is gone)
  phone_masked       text,                   -- e.g. +91 98XXXXXX10
  phone_hash         text,                   -- SHA-256 of the number, to spot repeat abuse
  account_created_at timestamptz,            -- when the account was first made
  reason             text check (reason in ('sold', 'not_useful', 'too_many_calls', 'privacy', 'other')),
  listings_count     int not null default 0, -- listings deleted with the account
  files_count        int not null default 0, -- photos, videos and documents deleted
  deleted_by         text not null default 'self' check (deleted_by in ('self', 'admin')),
  status             text not null default 'requested'
                       check (status in ('requested', 'files_removed', 'completed', 'failed')),
  requested_at       timestamptz not null default now(),
  files_removed_at   timestamptz,
  completed_at       timestamptz,
  failed_at          timestamptz,
  error              text check (char_length(error) <= 500)
);
create index if not exists account_deletions_requested_idx on public.account_deletions (requested_at desc);
create index if not exists account_deletions_hash_idx on public.account_deletions (phone_hash);

alter table public.account_deletions enable row level security;

-- Only L1 admins can read it. Nobody can write to it directly (only the functions below).
drop policy if exists "L1 admins read deletions" on public.account_deletions;
create policy "L1 admins read deletions"
  on public.account_deletions for select to authenticated
  using (public.is_l1());

-------------------------------------------------------------
-- 2. Step 1: start a deletion (returns its ID)
-------------------------------------------------------------
create or replace function public.start_account_deletion(p_reason text default null)
returns uuid
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_uid   uuid := auth.uid();
  v_phone text;
  v_made  timestamptz;
  v_id    uuid;
begin
  if v_uid is null then raise exception 'Not logged in'; end if;
  if exists (select 1 from public.admins where user_id = v_uid) then raise exception 'IS_ADMIN'; end if;

  select phone, created_at into v_phone, v_made from auth.users where id = v_uid;

  -- Retry after a failed attempt: reuse the open record instead of making a new one
  select id into v_id from public.account_deletions
  where user_id = v_uid and status in ('requested', 'files_removed', 'failed')
  order by requested_at desc limit 1;

  if v_id is not null then
    update public.account_deletions
    set status = 'requested', reason = coalesce(p_reason, reason), failed_at = null, error = null
    where id = v_id;
    return v_id;
  end if;

  insert into public.account_deletions (user_id, phone_masked, phone_hash, account_created_at, reason, listings_count)
  values (
    v_uid,
    case when length(v_phone) = 12
      then '+91 ' || substr(v_phone, 3, 2) || 'XXXXXX' || substr(v_phone, 11, 2)
      else null end,
    case when v_phone is not null then encode(extensions.digest(v_phone, 'sha256'), 'hex') end,
    v_made,
    p_reason,
    (select count(*) from public.listings where seller_id = v_uid)
  )
  returning id into v_id;
  return v_id;
end $$;

-------------------------------------------------------------
-- 3. Step 2: the website has deleted the user's files
-------------------------------------------------------------
create or replace function public.mark_deletion_files_removed(p_id uuid, p_files int)
returns void
language sql
security definer
set search_path = public
as $$
  update public.account_deletions
  set status = 'files_removed', files_count = greatest(coalesce(p_files, 0), 0), files_removed_at = now()
  where id = p_id and user_id = auth.uid() and status = 'requested';
$$;

-------------------------------------------------------------
-- 4. Step 3: delete the account itself
--    Everything linked to it (profile, listings, saved horses, reports,
--    recovery code, name history) is removed with it automatically.
-------------------------------------------------------------
create or replace function public.complete_account_deletion(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_uid   uuid := auth.uid();
  v_phone text;
begin
  if v_uid is null then raise exception 'Not logged in'; end if;
  if exists (select 1 from public.admins where user_id = v_uid) then raise exception 'IS_ADMIN'; end if;
  if not exists (
    select 1 from public.account_deletions
    where id = p_id and user_id = v_uid and status in ('requested', 'files_removed')
  ) then
    raise exception 'NO_REQUEST';
  end if;

  select phone into v_phone from auth.users where id = v_uid;

  update public.account_deletions
  set status = 'completed',
      completed_at = now(),
      listings_count = (select count(*) from public.listings where seller_id = v_uid)
  where id = p_id;

  -- Security records that contain the full number
  delete from public.recovery_attempts where phone = v_phone;

  -- The login itself (and, through it, everything linked to the account)
  delete from auth.users where id = v_uid;
end $$;

-------------------------------------------------------------
-- 5. If something goes wrong, the website records why
-------------------------------------------------------------
create or replace function public.fail_account_deletion(p_id uuid, p_error text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.account_deletions
  set status = 'failed', failed_at = now(), error = left(coalesce(p_error, 'unknown'), 500)
  where id = p_id and user_id = auth.uid() and status in ('requested', 'files_removed');
$$;

-------------------------------------------------------------
-- 6. Lets the website clear its page cache right after a deletion
--    (true only for a deletion completed in the last 10 minutes)
-------------------------------------------------------------
create or replace function public.deletion_just_completed(p_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.account_deletions
    where id = p_id and status = 'completed' and completed_at > now() - interval '10 minutes'
  );
$$;

revoke all on function public.start_account_deletion(text) from public, anon;
revoke all on function public.mark_deletion_files_removed(uuid, int) from public, anon;
revoke all on function public.complete_account_deletion(uuid) from public, anon;
revoke all on function public.fail_account_deletion(uuid, text) from public, anon;
revoke all on function public.deletion_just_completed(uuid) from public;
grant execute on function public.start_account_deletion(text) to authenticated;
grant execute on function public.mark_deletion_files_removed(uuid, int) to authenticated;
grant execute on function public.complete_account_deletion(uuid) to authenticated;
grant execute on function public.fail_account_deletion(uuid, text) to authenticated;
grant execute on function public.deletion_just_completed(uuid) to anon, authenticated;

notify pgrst, 'reload schema';

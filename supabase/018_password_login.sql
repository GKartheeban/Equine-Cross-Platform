-- EquineTrade update 018: mobile number + password login (no SMS codes).
--  * L2 admins can set a temporary password for a user who forgot theirs.
--    The user must choose a new password the next time they log in.
--  * Every reset is recorded in the admin action log (L1 can see it).
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- Also in Supabase: Authentication -> Sign In / Providers -> Phone:
--   keep Phone ON, and turn OFF phone confirmation (so sign-up needs no SMS).

-------------------------------------------------------------
-- 1. "Must change password" flag
-------------------------------------------------------------
alter table public.profiles add column if not exists must_change_password boolean not null default false;

-------------------------------------------------------------
-- 2. Allow "reset_password" in the admin action log
-------------------------------------------------------------
alter table public.admin_actions drop constraint if exists admin_actions_action_check;
alter table public.admin_actions add constraint admin_actions_action_check check (action in (
  'remove_listing', 'restore_listing', 'dismiss_reports',
  'remove_photo', 'remove_name',
  'add_admin', 'change_level', 'remove_admin',
  'reset_password'));

-------------------------------------------------------------
-- 3. L2 admin: set a temporary password for a mobile number
-------------------------------------------------------------
create or replace function public.admin_reset_password(p_phone text, p_password text)
returns void
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_phone text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  v_user  uuid;
begin
  if public.admin_level() <> 2 then raise exception 'Not allowed'; end if;
  if length(v_phone) = 10 then v_phone := '91' || v_phone; end if;
  if v_phone !~ '^91[6-9][0-9]{9}$' then raise exception 'BAD_PHONE'; end if;
  if char_length(coalesce(p_password, '')) not between 6 and 72 then raise exception 'BAD_PASSWORD'; end if;

  select id into v_user from auth.users where phone = v_phone;
  if v_user is null then raise exception 'NO_USER'; end if;
  -- Admins' passwords can only be changed by themselves
  if exists (select 1 from public.admins where user_id = v_user) then raise exception 'IS_ADMIN'; end if;

  update auth.users
  set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')),
      updated_at = now()
  where id = v_user;

  update public.profiles set must_change_password = true where id = v_user;

  perform public.log_admin_action('reset_password', null, v_user, '+' || v_phone);
end $$;

revoke all on function public.admin_reset_password(text, text) from public, anon;
grant execute on function public.admin_reset_password(text, text) to authenticated;

notify pgrst, 'reload schema';

-------------------------------------------------------------
-- 4. ONE-TIME: give YOUR existing account (made with SMS codes) a password.
--    Accounts created before this update have no password yet.
--    Replace the number and password below, select only these 4 lines, and Run.
-------------------------------------------------------------
-- update auth.users
-- set encrypted_password = extensions.crypt('YourNewPassword', extensions.gen_salt('bf')),
--     updated_at = now()
-- where phone = '91XXXXXXXXXX';

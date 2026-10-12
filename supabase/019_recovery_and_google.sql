-- EquineTrade update 019: ways to get back into an account without SMS.
--  * Recovery code: shown once at sign-up (e.g. K7P2-9XQM). With mobile number + code,
--    the user sets a new password. The code is stored scrambled (like a password),
--    works once, and a new one can be made any time from the profile page.
--    Max 5 wrong tries per number per hour.
--  * Google: users can link Google in their profile and then "Continue with Google".
--    A Google login that isn't linked to a mobile account is removed straight away.
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.

-------------------------------------------------------------
-- 1. Tables (no website access; only the functions below use them)
-------------------------------------------------------------
create table if not exists public.recovery_codes (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  code_hash  text not null,
  created_at timestamptz not null default now()
);
alter table public.recovery_codes enable row level security;

create table if not exists public.recovery_attempts (
  id         bigint generated always as identity primary key,
  phone      text not null,
  success    boolean not null,
  created_at timestamptz not null default now()
);
create index if not exists recovery_attempts_phone_idx on public.recovery_attempts (phone, created_at desc);
alter table public.recovery_attempts enable row level security;

-------------------------------------------------------------
-- 2. Make a new recovery code for the logged-in user (old one stops working)
-------------------------------------------------------------
create or replace function public.create_recovery_code()
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; -- no 0/O or 1/I look-alikes
  bytes bytea := extensions.gen_random_bytes(8);
  raw   text := '';
  i     int;
begin
  if auth.uid() is null then raise exception 'Not logged in'; end if;
  for i in 0..7 loop
    raw := raw || substr(alphabet, (get_byte(bytes, i) % length(alphabet)) + 1, 1);
  end loop;

  insert into public.recovery_codes (user_id, code_hash, created_at)
  values (auth.uid(), extensions.crypt(raw, extensions.gen_salt('bf')), now())
  on conflict (user_id) do update set code_hash = excluded.code_hash, created_at = now();

  return substr(raw, 1, 4) || '-' || substr(raw, 5, 4);
end $$;

-- When the logged-in user's current code was made (null = none)
create or replace function public.recovery_code_created_at()
returns timestamptz
language sql
stable
security definer
set search_path = public
as $$
  select created_at from public.recovery_codes where user_id = auth.uid();
$$;

revoke all on function public.create_recovery_code() from public, anon;
revoke all on function public.recovery_code_created_at() from public, anon;
grant execute on function public.create_recovery_code() to authenticated;
grant execute on function public.recovery_code_created_at() to authenticated;

-------------------------------------------------------------
-- 3. Forgot password: mobile number + recovery code -> new password
--    Returns 'ok', 'bad_phone', 'bad_password', 'wrong' or 'too_many'.
-------------------------------------------------------------
create or replace function public.recover_with_code(p_phone text, p_code text, p_password text)
returns text
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_phone text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  v_code  text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  v_user  uuid;
  v_hash  text;
begin
  if length(v_phone) = 10 then v_phone := '91' || v_phone; end if;
  if v_phone !~ '^91[6-9][0-9]{9}$' then return 'bad_phone'; end if;
  if char_length(coalesce(p_password, '')) not between 6 and 72 then return 'bad_password'; end if;

  if (select count(*) from public.recovery_attempts
      where phone = v_phone and not success and created_at > now() - interval '1 hour') >= 5 then
    return 'too_many';
  end if;

  select u.id, r.code_hash into v_user, v_hash
  from auth.users u join public.recovery_codes r on r.user_id = u.id
  where u.phone = v_phone;

  if v_user is null or extensions.crypt(v_code, v_hash) <> v_hash then
    insert into public.recovery_attempts (phone, success) values (v_phone, false);
    return 'wrong';
  end if;

  update auth.users
  set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')),
      updated_at = now()
  where id = v_user;
  delete from public.recovery_codes where user_id = v_user;  -- each code works once
  update public.profiles set must_change_password = false where id = v_user;
  insert into public.recovery_attempts (phone, success) values (v_phone, true);
  return 'ok';
end $$;

revoke all on function public.recover_with_code(text, text, text) from public;
grant execute on function public.recover_with_code(text, text, text) to anon, authenticated;

-------------------------------------------------------------
-- 4. Google login that isn't linked to a mobile account: remove it
--    (accounts here always need a mobile number, so buyers can contact sellers)
-------------------------------------------------------------
create or replace function public.discard_unlinked_google_account()
returns void
language sql
security definer
set search_path = public, auth
as $$
  delete from auth.users
  where id = auth.uid()
    and coalesce(phone, '') = ''
    and created_at > now() - interval '15 minutes';
$$;

revoke all on function public.discard_unlinked_google_account() from public, anon;
grant execute on function public.discard_unlinked_google_account() to authenticated;

notify pgrst, 'reload schema';

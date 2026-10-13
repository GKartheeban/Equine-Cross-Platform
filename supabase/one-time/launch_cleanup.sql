-- HorseMart: ONE-TIME launch cleanup. Removes all test data so the site starts fresh.
--
-- KEEPS:   admin accounts (and their profiles, names, photos, recovery codes),
--          all tables, functions, security rules and settings.
-- REMOVES: ALL listings (including admins' test horses), every non-admin account,
--          reports, saved horses, activity counts, action log, recovery attempts
--          and the deleted-accounts record.
--
-- BEFORE YOU RUN IT:
--   1. Make a fresh backup: GitHub -> Actions -> Database backup -> Run workflow.
--   2. Run PART 1 alone (select it, then Run) and check the numbers.
--   3. Then run PART 2 alone. It is one transaction: all of it happens, or none.
--   4. Then do PART 3 (photos and videos) in the Supabase Storage screen.
-- This cannot be undone (except by restoring the backup).

-------------------------------------------------------------
-- PART 1: PREVIEW (changes nothing)
-------------------------------------------------------------
select 'admin accounts kept'          as what, count(*) as how_many from public.admins
union all select 'accounts to delete',   count(*) from auth.users where id not in (select user_id from public.admins)
union all select 'listings to delete',   count(*) from public.listings
union all select 'reports to delete',    count(*) from public.reports
union all select 'saved horses to delete', count(*) from public.saved_listings
union all select 'activity events to delete', count(*) from public.events
union all select 'admin log entries to delete', count(*) from public.admin_actions
union all select 'deletion records to delete', count(*) from public.account_deletions;

-- The admins who will be kept (check this is right!)
select a.level, u.phone, p.full_name
from public.admins a
join auth.users u on u.id = a.user_id
left join public.profiles p on p.id = a.user_id
order by a.level;

-------------------------------------------------------------
-- PART 2: CLEAN UP (run only after checking PART 1)
-------------------------------------------------------------
begin;

-- Safety: stop if there are no admins (you would lock yourself out)
do $$
begin
  if (select count(*) from public.admins) = 0 then
    raise exception 'No admin accounts found. Nothing was deleted.';
  end if;
end $$;

-- All listings (reports and saved horses go with them)
delete from public.listings;

-- Every non-admin account (profiles, name history, recovery codes go with them)
delete from auth.users where id not in (select user_id from public.admins);

-- Test activity and logs
delete from public.events;
delete from public.reports;
delete from public.saved_listings;
delete from public.admin_actions;
delete from public.recovery_attempts;
delete from public.account_deletions;

commit;

-- Check: everything should be 0 except the admin count
select 'admins' as what, count(*) from public.admins
union all select 'accounts', count(*) from auth.users
union all select 'listings', count(*) from public.listings
union all select 'events', count(*) from public.events;

-------------------------------------------------------------
-- PART 3: PHOTOS AND VIDEOS (in the Supabase dashboard, not SQL)
-- Supabase does not allow deleting files with SQL, so:
--   Storage -> "listing-media" bucket -> select all folders -> Delete
--   Storage -> "documents" bucket     -> select all folders -> Delete
--   Storage -> "avatars" bucket       -> delete every folder EXCEPT the admins'
--     (each folder is named after an account ID; the admins' IDs are listed below)
-------------------------------------------------------------
select user_id as admin_folder_to_keep_in_avatars from public.admins;

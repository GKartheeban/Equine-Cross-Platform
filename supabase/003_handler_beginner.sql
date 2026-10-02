-- EquineTrade update 003: Handler's Experience options are now Beginner / Intermediate / Expert.
-- Only needed if you ALREADY ran 002 before this change.
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.

alter table public.listings drop constraint if exists listings_handler_experience_check;

update public.listings set handler_experience = 'Beginner' where handler_experience = 'Fresher';
update public.listings set handler_experience = 'Expert' where handler_experience = 'Experienced';

alter table public.listings
  add constraint listings_handler_experience_check
  check (handler_experience in ('Beginner', 'Intermediate', 'Expert'));

-- Tell Supabase's API about the changes straight away
notify pgrst, 'reload schema';

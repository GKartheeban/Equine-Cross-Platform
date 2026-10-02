-- EquineTrade update 004: "About the horse" (description) is now optional.
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.

alter table public.listings alter column description drop not null;

alter table public.listings drop constraint if exists listings_description_check;
alter table public.listings
  add constraint listings_description_check check (char_length(description) <= 1000);

-- Tell Supabase's API about the changes straight away
notify pgrst, 'reload schema';

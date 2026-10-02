-- EquineTrade update 002:
--  * Training level options changed
--  * "Temperament" replaced by "Handler's Experience"
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- Safe to run even if you already posted test listings: old values are converted.

-- 1. Remove the old allowed-value rules
alter table public.listings drop constraint if exists listings_training_level_check;
alter table public.listings drop constraint if exists listings_temperament_check;

-- 2. Convert any existing training levels to the new options
update public.listings
set training_level = case training_level
  when 'Halter-broken' then 'Untrained'
  when 'Show / race trained' then 'Race'
  else training_level
end
where training_level in ('Halter-broken', 'Show / race trained');

-- 3. Rename temperament -> handler_experience and convert old values
alter table public.listings rename column temperament to handler_experience;

update public.listings
set handler_experience = case handler_experience
  when 'Calm' then 'Beginner'
  when 'Spirited' then 'Intermediate'
  when 'Needs experienced rider' then 'Expert'
  else handler_experience
end;

-- 4. New allowed-value rules
alter table public.listings
  add constraint listings_training_level_check
  check (training_level in ('Untrained', 'Ridden', 'Cart', 'Ridden and cart', 'Race', 'Dance only', 'All'));

alter table public.listings
  add constraint listings_handler_experience_check
  check (handler_experience in ('Beginner', 'Intermediate', 'Expert'));

-- 5. Colour is now typed by the seller (Tamil or English): just limit the length
alter table public.listings drop constraint if exists listings_colour_check;
alter table public.listings
  add constraint listings_colour_check check (char_length(colour) between 1 and 40);

-- Tell Supabase's API about the changes straight away
notify pgrst, 'reload schema';

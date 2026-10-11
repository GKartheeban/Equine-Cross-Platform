-- EquineTrade update 017: training as tick boxes (more than one allowed).
--  * New column training_levels, e.g. {Ridden,Cart,Race}
--    Allowed: Untrained, Ridden, Cart, Race, Dance. "Untrained" can't be combined with others.
--  * Existing listings are converted: "Ridden and cart" -> {Ridden,Cart}, "Dance only" -> {Dance},
--    "All" -> {Ridden,Cart,Race,Dance}.
--  * The old single training_level column is kept for history but no longer used.
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.

alter table public.listings add column if not exists training_levels text[] not null default '{}';

-- Convert existing listings (only those not converted yet)
update public.listings
set training_levels = case training_level
  when 'Ridden and cart' then array['Ridden', 'Cart']
  when 'Dance only'      then array['Dance']
  when 'All'             then array['Ridden', 'Cart', 'Race', 'Dance']
  else array[training_level]
end
where cardinality(training_levels) = 0 and training_level is not null;

-- The old column is no longer filled in for new listings
alter table public.listings alter column training_level drop not null;

-- Rules
alter table public.listings drop constraint if exists listings_training_levels_check;
alter table public.listings
  add constraint listings_training_levels_check
  check (
    cardinality(training_levels) between 1 and 5
    and training_levels <@ array['Untrained', 'Ridden', 'Cart', 'Race', 'Dance']
    and not ('Untrained' = any (training_levels) and cardinality(training_levels) > 1)
  );

notify pgrst, 'reload schema';

-- EquineTrade update 016: flexible photos and videos.
--  * A listing keeps an ordered list of media (photos and videos) in one column, "media":
--      [{"type": "photo", "path": "..."}, {"type": "video", "path": "...", "seconds": 18}, ...]
--    The first photo in the list is the cover photo.
--  * Rules (checked here, so nothing can skip them):
--      - at most 10 files: at most 8 photos and at most 2 videos
--      - at least 2 photos, or at least 1 video (any mix is fine)
--      - every video is 20 seconds or less
--  * Existing listings are converted automatically (5 photos + walking video -> media list).
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.

-------------------------------------------------------------
-- 1. The new column
-------------------------------------------------------------
alter table public.listings add column if not exists media jsonb not null default '[]'::jsonb;

-------------------------------------------------------------
-- 2. Convert existing listings (only those not converted yet)
-------------------------------------------------------------
update public.listings l
set media = (
  select coalesce(jsonb_agg(item order by ord), '[]'::jsonb)
  from (
    -- the 5 old photos, in their old order (front = cover)
    select jsonb_build_object('type', 'photo', 'path', l.photo_paths ->> k) as item, o as ord
    from unnest(array['front', 'left', 'right', 'rear', 'teeth']) with ordinality as s(k, o)
    where l.photo_paths ? k
    union all
    -- then the walking video
    select jsonb_build_object('type', 'video', 'path', l.video_path, 'seconds', coalesce(l.video_seconds, 20)), 100
    where l.video_path is not null
  ) x
)
where l.media = '[]'::jsonb
  and (l.photo_paths <> '{}'::jsonb or l.video_path is not null);

-------------------------------------------------------------
-- 3. The rules, checked whenever media is saved
-------------------------------------------------------------
create or replace function public.check_listing_media()
returns trigger
language plpgsql
as $$
declare
  photos int;
  videos int;
  total  int;
begin
  if jsonb_typeof(new.media) is distinct from 'array' then
    raise exception 'MEDIA_RULES: media must be a list';
  end if;

  select count(*) filter (where e ->> 'type' = 'photo'),
         count(*) filter (where e ->> 'type' = 'video'),
         count(*)
    into photos, videos, total
  from jsonb_array_elements(new.media) e;

  if total <> photos + videos then
    raise exception 'MEDIA_RULES: unknown media type';
  end if;
  if exists (select 1 from jsonb_array_elements(new.media) e where coalesce(e ->> 'path', '') = '') then
    raise exception 'MEDIA_RULES: every file needs a path';
  end if;
  if total > 10 or photos > 8 or videos > 2 then
    raise exception 'MEDIA_RULES: at most 8 photos and 2 videos';
  end if;
  if photos < 2 and videos < 1 then
    raise exception 'MEDIA_RULES: add at least 2 photos or 1 video';
  end if;
  -- small margin for rounding (a 20.4-second clip is fine)
  if exists (
    select 1 from jsonb_array_elements(new.media) e
    where e ->> 'type' = 'video' and coalesce((e ->> 'seconds')::numeric, 999) > 21
  ) then
    raise exception 'MEDIA_RULES: videos must be 20 seconds or less';
  end if;

  return new;
end $$;

drop trigger if exists listings_check_media on public.listings;
create trigger listings_check_media
  before insert or update of media on public.listings
  for each row execute function public.check_listing_media();

notify pgrst, 'reload schema';

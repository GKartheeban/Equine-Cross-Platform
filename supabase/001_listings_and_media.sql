-- EquineTrade: listings table, media storage and security rules.
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.

-------------------------------------------------------------
-- 1. Listings table
-------------------------------------------------------------
create table if not exists public.listings (
  id                   uuid primary key default gen_random_uuid(),
  seller_id            uuid not null default auth.uid() references auth.users (id) on delete cascade,
  slug                 text not null unique,
  status               text not null default 'pending'
                       check (status in ('pending', 'live', 'rejected', 'sold', 'expired')),

  -- Horse details
  breed                text not null,
  gender               text not null check (gender in ('Mare', 'Stallion', 'Gelding', 'Colt', 'Filly')),
  age_years            smallint not null check (age_years between 0 and 40),
  height_inches        smallint not null check (height_inches between 30 and 80),
  colour               text not null,
  markings             text check (char_length(markings) <= 120),

  -- Health & training
  vaccinated           boolean not null,
  vet_certificate_path text,
  training_level       text not null
                       check (training_level in ('Untrained', 'Halter-broken', 'Ridden', 'Show / race trained')),
  temperament          text not null
                       check (temperament in ('Calm', 'Spirited', 'Needs experienced rider')),
  pregnant             boolean,

  -- Price & location
  price_inr            integer not null check (price_inr >= 1000),
  negotiable           boolean not null default true,
  district             text not null,
  town                 text not null check (char_length(town) between 1 and 60),
  description          text not null check (char_length(description) between 20 and 1000),

  -- Media (paths inside the storage bucket)
  photo_paths          jsonb not null default '{}'::jsonb,  -- {"front": "...", "left": "...", ...}
  video_path           text,
  video_seconds        smallint,

  views                integer not null default 0,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists listings_status_created_idx on public.listings (status, created_at desc);
create index if not exists listings_district_idx on public.listings (district);
create index if not exists listings_breed_idx on public.listings (breed);
create index if not exists listings_seller_idx on public.listings (seller_id);

-- Keep updated_at current on every edit
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists listings_set_updated_at on public.listings;
create trigger listings_set_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

-------------------------------------------------------------
-- 2. Who can see and change listings (Row Level Security)
-------------------------------------------------------------
alter table public.listings enable row level security;

-- Everyone (even logged out) can see approved listings
drop policy if exists "Anyone can view live listings" on public.listings;
create policy "Anyone can view live listings"
  on public.listings for select
  using (status = 'live');

-- Sellers can always see their own listings (pending, rejected, sold…)
drop policy if exists "Sellers can view own listings" on public.listings;
create policy "Sellers can view own listings"
  on public.listings for select to authenticated
  using (seller_id = auth.uid());

-- Logged-in users can create listings, only as themselves and only as 'pending'
drop policy if exists "Sellers can create pending listings" on public.listings;
create policy "Sellers can create pending listings"
  on public.listings for insert to authenticated
  with check (seller_id = auth.uid() and status = 'pending');

-- Sellers can edit their own listings, but can never approve them (no 'live')
drop policy if exists "Sellers can update own listings" on public.listings;
create policy "Sellers can update own listings"
  on public.listings for update to authenticated
  using (seller_id = auth.uid())
  with check (seller_id = auth.uid() and status in ('pending', 'sold'));

-- Sellers can delete their own listings
drop policy if exists "Sellers can delete own listings" on public.listings;
create policy "Sellers can delete own listings"
  on public.listings for delete to authenticated
  using (seller_id = auth.uid());

-------------------------------------------------------------
-- 3. Storage buckets
-------------------------------------------------------------
-- Photos and walking videos: public to view (50 MB max per file)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-media', 'listing-media', true, 52428800, array['image/*', 'video/*'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Vet certificates: private (only the seller, and later the admin, can see them)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documents', 'documents', false, 10485760, array['image/*', 'application/pdf'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-------------------------------------------------------------
-- 4. Who can upload files
--    Each user may only upload into a folder named after their own user id:
--    listing-media/<user id>/<listing id>/front.jpg
-------------------------------------------------------------
drop policy if exists "Users upload own listing media" on storage.objects;
create policy "Users upload own listing media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'listing-media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users change own listing media" on storage.objects;
create policy "Users change own listing media"
  on storage.objects for update to authenticated
  using (bucket_id = 'listing-media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users delete own listing media" on storage.objects;
create policy "Users delete own listing media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'listing-media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users upload own documents" on storage.objects;
create policy "Users upload own documents"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users view own documents" on storage.objects;
create policy "Users view own documents"
  on storage.objects for select to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

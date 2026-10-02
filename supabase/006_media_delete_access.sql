-- EquineTrade update 006: lets sellers delete their own photos and videos
-- (used by "Delete" in My listings). Supabase needs read access to a file
-- before it can delete it, so this adds that for each seller's own folder.
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.

drop policy if exists "Users view own listing media" on storage.objects;
create policy "Users view own listing media"
  on storage.objects for select to authenticated
  using (bucket_id = 'listing-media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users delete own documents" on storage.objects;
create policy "Users delete own documents"
  on storage.objects for delete to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

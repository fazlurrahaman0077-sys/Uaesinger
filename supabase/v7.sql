-- ============================================================================
-- UAESinger v7 — creator profile photos. Run after v6.sql.
-- ============================================================================

alter table public.artists add column if not exists photo_path text;

-- Public images bucket (10 MB, image types).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('creator-photos', 'creator-photos', true, 10485760,
        array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public = true, file_size_limit = 10485760,
      allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "creator_photos_public_read" on storage.objects;
create policy "creator_photos_public_read"
  on storage.objects for select using (bucket_id = 'creator-photos');

drop policy if exists "creator_photos_owner_insert" on storage.objects;
create policy "creator_photos_owner_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'creator-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "creator_photos_owner_delete" on storage.objects;
create policy "creator_photos_owner_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'creator-photos' and (storage.foldername(name))[1] = auth.uid()::text);

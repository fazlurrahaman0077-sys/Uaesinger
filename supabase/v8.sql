-- ============================================================================
-- UAESinger v8 — creator photo galleries (multiple photos). Run after v7.sql.
-- Reuses the creator-photos bucket. artists.photo_path stays the cover image;
-- extra photos live here.
-- ============================================================================

create table if not exists public.artist_photos (
  id           uuid primary key default gen_random_uuid(),
  artist_id    uuid not null references public.artists(id) on delete cascade,
  owner_id     uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  created_at   timestamptz not null default now()
);
create index if not exists artist_photos_artist_idx on public.artist_photos(artist_id);

alter table public.artist_photos enable row level security;

drop policy if exists "artist_photos_public_read" on public.artist_photos;
create policy "artist_photos_public_read"
  on public.artist_photos for select
  using (
    owner_id = auth.uid()
    or exists (select 1 from public.artists a where a.id = artist_id and a.is_published)
  );

drop policy if exists "artist_photos_owner_write" on public.artist_photos;
create policy "artist_photos_owner_write"
  on public.artist_photos for all
  using (
    owner_id = auth.uid()
    and exists (select 1 from public.artists a where a.id = artist_id and a.owner_id = auth.uid())
  )
  with check (
    owner_id = auth.uid()
    and exists (select 1 from public.artists a where a.id = artist_id and a.owner_id = auth.uid())
  );

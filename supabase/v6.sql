-- ============================================================================
-- UAESinger v6 — creator video reels (Supabase Storage). Run after v5.sql.
-- ============================================================================

-- 1. Public storage bucket for creator videos (100 MB cap, video types only).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('creator-videos', 'creator-videos', true, 104857600,
        array['video/mp4','video/webm','video/quicktime'])
on conflict (id) do update
  set public = true,
      file_size_limit = 104857600,
      allowed_mime_types = array['video/mp4','video/webm','video/quicktime'];

-- Storage RLS: anyone can read; a user may write/delete only inside their own
-- top-level folder ("{user_id}/..."), so nobody can touch another user's files.
drop policy if exists "creator_videos_public_read" on storage.objects;
create policy "creator_videos_public_read"
  on storage.objects for select
  using (bucket_id = 'creator-videos');

drop policy if exists "creator_videos_owner_insert" on storage.objects;
create policy "creator_videos_owner_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'creator-videos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "creator_videos_owner_delete" on storage.objects;
create policy "creator_videos_owner_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'creator-videos' and (storage.foldername(name))[1] = auth.uid()::text);

-- 2. Video metadata, linked to an artist listing.
create table if not exists public.artist_videos (
  id           uuid primary key default gen_random_uuid(),
  artist_id    uuid not null references public.artists(id) on delete cascade,
  owner_id     uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  title        text,
  created_at   timestamptz not null default now()
);
create index if not exists artist_videos_artist_idx on public.artist_videos(artist_id);

alter table public.artist_videos enable row level security;

-- Public can see videos for published artists; owners always see their own.
drop policy if exists "artist_videos_public_read" on public.artist_videos;
create policy "artist_videos_public_read"
  on public.artist_videos for select
  using (
    owner_id = auth.uid()
    or exists (select 1 from public.artists a where a.id = artist_id and a.is_published)
  );

-- Owners manage videos only for artists they own.
drop policy if exists "artist_videos_owner_write" on public.artist_videos;
create policy "artist_videos_owner_write"
  on public.artist_videos for all
  using (
    owner_id = auth.uid()
    and exists (select 1 from public.artists a where a.id = artist_id and a.owner_id = auth.uid())
  )
  with check (
    owner_id = auth.uid()
    and exists (select 1 from public.artists a where a.id = artist_id and a.owner_id = auth.uid())
  );

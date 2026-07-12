-- v14: video by link (embed) — no upload size limit
alter table public.artist_videos add column if not exists url text;
alter table public.artist_videos alter column storage_path drop not null;

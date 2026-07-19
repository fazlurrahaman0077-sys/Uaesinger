-- v26: thumbs-up on a video, sitting beside the existing heart.
-- Same shape as video_likes (v21) and artist_thumbs (v22): heart = save/
-- favourite, thumb = upvote, kept as separate reactions with their own counts.

create table if not exists public.video_thumbs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  video_id   uuid not null references public.artist_videos(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, video_id)
);
create index if not exists video_thumbs_video_idx on public.video_thumbs(video_id);

alter table public.video_thumbs enable row level security;
drop policy if exists "video_thumbs_select_own" on public.video_thumbs;
create policy "video_thumbs_select_own" on public.video_thumbs for select using (auth.uid() = user_id);
drop policy if exists "video_thumbs_insert_own" on public.video_thumbs;
create policy "video_thumbs_insert_own" on public.video_thumbs for insert with check (auth.uid() = user_id);
drop policy if exists "video_thumbs_delete_own" on public.video_thumbs;
create policy "video_thumbs_delete_own" on public.video_thumbs for delete using (auth.uid() = user_id);

alter table public.artist_videos add column if not exists thumbs_count int not null default 0;

create or replace function public.bump_video_thumbs() returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    update public.artist_videos set thumbs_count = thumbs_count + 1 where id = new.video_id;
  elsif tg_op = 'DELETE' then
    update public.artist_videos set thumbs_count = greatest(thumbs_count - 1, 0) where id = old.video_id;
  end if;
  return null;
end $$;

drop trigger if exists video_thumbs_count on public.video_thumbs;
create trigger video_thumbs_count after insert or delete on public.video_thumbs
  for each row execute function public.bump_video_thumbs();

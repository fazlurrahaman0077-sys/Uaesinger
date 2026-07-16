-- ============================================================================
-- UAESinger v23 — anchor reviews to the reviewer's email, not a typed name.
-- v22 let the form supply author_name, so a reviewer could type any name and
-- impersonate anyone; full_name isn't unique either (two live accounts are both
-- "Micah"). Identity is now the email, snapshotted server-side from the session.
-- Run after v22.sql.
-- ============================================================================

alter table public.artist_reviews add column if not exists author_email text;

-- author_email is identity/audit only. Reviews are publicly readable, so it must
-- never reach the public profile — hirer emails are private (same posture as the
-- contact paywall). Table-level SELECT implies every column in Postgres, so the
-- grant is rebuilt column by column, omitting author_email. PostgREST honours it:
-- selecting author_email as anon/authenticated now errors instead of leaking.
revoke select on public.artist_reviews from anon, authenticated;
grant select (id, artist_id, user_id, author_name, rating, body, created_at)
  on public.artist_reviews to anon, authenticated;

-- author_name stays as the public display label, but is set server-side from
-- profiles.full_name (falling back to the email local-part) — never from the form.

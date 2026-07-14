-- ============================================================================
-- UAESinger v20 — blog cover images. Run after v19.sql.
-- ============================================================================
alter table public.posts add column if not exists cover_url text;

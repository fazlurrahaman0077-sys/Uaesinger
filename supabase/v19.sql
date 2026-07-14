-- ============================================================================
-- UAESinger v19 — confidential contacts: creator shares their card on consent.
-- The artist's phone is no longer public. When a hirer enquires, the creator
-- taps "Send my card"; we snapshot their contact into the booking so the hirer
-- can read it (they already RLS-own their own booking rows). Run after v18.sql.
-- ============================================================================
alter table public.bookings add column if not exists shared_card jsonb;

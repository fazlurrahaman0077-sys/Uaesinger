-- ============================================================================
-- UAESinger v9 — full category taxonomy, subcategories, tags & search. Run after v8.
-- ============================================================================

-- 1. Subcategory + searchable tags on artists.
alter table public.artists add column if not exists subcategory text;
alter table public.artists add column if not exists tags text[] not null default '{}';
create index if not exists artists_tags_idx on public.artists using gin (tags);
create index if not exists artists_subcategory_idx on public.artists (subcategory);

-- 2. Seed all main categories (idempotent).
insert into public.categories (slug, label, emoji, blurb, sort_order) values
  ('singers','Singers','🎤','Wedding vocalists, jazz, Arabic & Bollywood singers, cover artists.',1),
  ('djs-bands','DJs & Bands','🎧','Club DJs, live bands and instrumental ensembles.',2),
  ('musicians','Musicians','🎻','Guitarists, pianists, violinists, oud & tabla players.',3),
  ('dancers','Dancers','💃','Bollywood, belly, contemporary and troupe performers.',4),
  ('mcs-hosts','MCs & Hosts','🎙️','Bilingual hosts and masters of ceremony.',5),
  ('comedians','Comedians','😂','Stand-up, improv and corporate comedy acts.',6),
  ('magicians','Magicians','🪄','Close-up, stage magicians, mentalists and illusionists.',7),
  ('photographers','Photographers','📷','Wedding, event, corporate and fashion coverage.',8),
  ('videographers','Videographers','📹','Cinematic, drone, reels and live-streaming creators.',9),
  ('wedding-performers','Wedding Performers','💐','Bridal entry, henna artists, wedding MCs and packages.',10),
  ('cultural','Cultural Performers','🌍','Emirati, Tanoura, Arabic and international cultural shows.',11),
  ('corporate-artists','Corporate Artists','🏢','Keynote speakers, live painters, brand ambassadors.',12),
  ('entertainers','Entertainers','🎪','Stilt walkers, mascots, mime and street performers.',13),
  ('fire-specialty','Fire & Specialty Acts','🔥','Fire dancers, LED shows, aerialists and acrobats.',14),
  ('kids','Kids Entertainers','🧒','Clowns, face painters, magic and puppet shows.',15),
  ('models','Models & Promoters','👗','Event models, hostesses, brand ambassadors, influencers.',16),
  ('cooking','Live Cooking & Experiences','🧑‍🍳','Celebrity chefs, mixologists and live food shows.',17),
  ('drum-lyre','Drum & Lyre Corps','🥁','Marching drum & lyre corps for parades and national days.',18)
on conflict (slug) do update set label=excluded.label, emoji=excluded.emoji, blurb=excluded.blurb, sort_order=excluded.sort_order;

-- Required reference data: the fixed category taxonomy (FK target for artists).
-- Emoji/blurb live in the app code (src/lib/artists.ts CATEGORIES), so only
-- slug + label are stored here. Run once.
insert into public.categories (slug, label, sort_order) values
  ('singers',       'Singers',       1),
  ('djs-bands',     'DJs & Bands',   2),
  ('dancers',       'Dancers',       3),
  ('mcs-hosts',     'MCs & Hosts',   4),
  ('photographers', 'Photographers', 5),
  ('entertainers',  'Entertainers',  6),
  ('drum-lyre',     'Drum & Lyre Corps', 7)
on conflict (slug) do nothing;

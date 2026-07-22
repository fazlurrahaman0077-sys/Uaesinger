# Discovery & social proof — design

Four changes, all client-visible: blog search, a fire-dance subcategory, real
reviews with motion, and like/thumb counts on artist cards.

## 1. Fire dance subcategory

Add `"Fire Dancers"` to `SUBCATEGORIES.dancers` and `"Fire Performers"` to
`SUBCATEGORIES.entertainers` in `src/lib/artists.ts`.

Fire shows are booked both as dance and as general entertainment, so the term
belongs in both lists. `subcategory` is a free-text column, so no migration.
The onboarding select, the browse chips on `/artists`, and the
`?subcategory=` filter all read the static array, so one edit reaches all
three.

## 2. Blog search

`/blog` already fetches up to 60 published posts and holds them in memory. A
new client component filters that array on `title`, `excerpt` and `category`,
case-insensitively, as the visitor types.

- `filterPosts(posts, query)` — a pure function in `src/lib/blog.ts`, so it is
  testable without a browser.
- `BlogSearch` — a client component owning the input and the filtered render.
- The page stays a server component; ISR caching is untouched.

Client-side filtering costs no round trip and no cache invalidation. It stops
working once the index outgrows the 60-post fetch; at that point the input
moves to a `?q=` search param backed by Supabase `ilike`. A `ponytail:`
comment records that ceiling.

## 3. Artist card stats

`ArtistCard` shows only `★ rating` today, with a heart floating over the photo
where it reads as decoration.

Replace both with one stats row in the card body, under the subcategory:

```
Aisha Khan                    ★ 4.9
Fire Dancer
♥ 128    👍 43    12 reviews
```

The heart and thumb stay interactive — `LikeButton` already calls
`preventDefault` for the enclosing card link and redirects signed-out visitors
to `/signin`. `thumbsCount` is already on the `Artist` type and in the `COLS`
projection, so no query changes.

Cards still pass `initialLiked={false}`: the grid does no per-user lookup, so
a heart the visitor filled on a previous visit renders empty until they click
it. That is pre-existing (documented in `LikeButton`) and out of scope here.

## 4. Reviews and motion

### Real reviews on the homepage

`listRecentReviews(limit)` in `src/lib/reviews.ts` returns the newest reviews
rated 4 or better, embedding `artists(name, slug)` so each card can link to
the profile. The rating floor keeps a single angry review off the homepage;
`author_email` stays unselected, as v23 requires.

`Testimonials` leads with the real reviews and tops the rail up from the
curated list to ten cards, so the section stays full while reviews trickle in
and a run of one-word reviews ("nice") never makes up the whole section. The
curated list grows from three entries to sixteen.

Review bodies are unbounded user text and the rail is a flex row, which
stretches every card to the tallest one — a single 1,300-character review made
the whole section thousands of pixels tall. Card text is clamped to five lines,
which bounds the tallest card and keeps the rail uniform.

### Marquee

The section becomes a horizontally scrolling track: the card list rendered
twice inside a flex row, translated by -50% over a linear infinite animation,
so the seam is invisible. Hover pauses it via `animation-play-state`. Under
`prefers-reduced-motion` the animation is disabled and the track scrolls
manually with `overflow-x: auto`.

CSS only — no carousel dependency, no JS, no state.

### Reveal on static sections

The homepage `Cities`, `Stats` and `FAQ` sections and the blog index cards pop
in with no motion while their neighbours fade up. Wrap each in the existing
`Reveal` component with staggered delays. `Reveal` already short-circuits to
visible under reduced motion.

### Admin post search

The admin blog list gets the same instant filter, but its rows contain
server-action `<form>`s, so turning the list into a client component would mean
threading every action through props. Instead `FilterRows` wraps the
server-rendered list, each row carries a lowercased `data-search` attribute,
and the client component toggles `hidden` on the misses. Safe because the rows
never re-render — the search term lives in the wrapper's state, not in them.

## Verification

`src/lib/blog.check.ts` asserts `filterPosts`: matches on title, matches on
excerpt, matches on category, is case-insensitive, ignores surrounding
whitespace, returns everything for an empty query, and returns nothing for a
term that appears in no field. Run with `node src/lib/blog.check.ts`, matching
the existing `validate.check.ts` pattern — no framework.

The rest is markup, CSS and a single Supabase query; `next build` and a look
at the running app cover those.

## Out of scope

Per-user liked state on the grid, review pagination, blog category facets,
and server-side blog search.

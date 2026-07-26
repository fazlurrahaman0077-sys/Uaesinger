import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import type { Artist } from "@/lib/artists";
import { normalizeText } from "@/lib/format";
import { toVideo, type Video, type VideoRow } from "@/lib/videos";

// DB row -> display shape used by the components.
type Row = {
  id: string;
  slug: string;
  name: string;
  category_slug: string;
  owner_id: string | null;
  city: string;
  tagline: string | null;
  bio: string | null;
  rating: number;
  reviews: number;
  gigs: number;
  languages: string[];
  genres: string[];
  availability: string;
  response_rate: number;
  featured_tag: string | null;
  price_min: number | null;
  price_max: number | null;
  photo_path: string | null;
  subcategory: string | null;
  tags: string[] | null;
  gender: string | null;
  nationality: string | null;
  likes_count: number | null;
  thumbs_count: number | null;
  experience_years: number | null;
  skills: string[] | null;
};

const COLS =
  "id, slug, name, category_slug, owner_id, city, tagline, bio, rating, reviews, gigs, languages, genres, availability, response_rate, featured_tag, price_min, price_max, photo_path, subcategory, tags, gender, nationality, likes_count, thumbs_count, experience_years, skills";

function toArtist(r: Row): Artist & { id: string } {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    category: r.category_slug,
    ownerId: r.owner_id,
    city: r.city,
    tagline: r.tagline ?? "",
    bio: normalizeText(r.bio),
    rating: r.rating,
    reviews: r.reviews,
    gigs: r.gigs,
    languages: r.languages ?? [],
    genres: r.genres ?? [],
    availability: r.availability,
    responseRate: r.response_rate,
    featuredTag: r.featured_tag,
    priceMin: r.price_min,
    priceMax: r.price_max,
    photoPath: r.photo_path,
    subcategory: r.subcategory,
    tags: r.tags ?? [],
    gender: r.gender,
    nationality: r.nationality,
    likesCount: r.likes_count ?? 0,
    thumbsCount: r.thumbs_count ?? 0,
    experienceYears: r.experience_years,
    skills: r.skills ?? [],
  };
}

export type ArtistFilter = { category?: string; subcategory?: string; city?: string; gender?: string; tag?: string; q?: string };

export async function listArtists(filter: ArtistFilter = {}): Promise<(Artist & { id: string })[]> {
  const supabase = createPublicClient();
  let query = supabase.from("artists").select(COLS).eq("is_published", true);
  if (filter.category && filter.category !== "all") query = query.eq("category_slug", filter.category);
  if (filter.subcategory) query = query.eq("subcategory", filter.subcategory);
  if (filter.city) query = query.eq("city", filter.city);
  if (filter.gender) query = query.eq("gender", filter.gender);
  if (filter.tag) query = query.contains("tags", [filter.tag]);
  if (filter.q) {
    const term = filter.q.replace(/[%,()]/g, " ").trim();
    query = query.or(`name.ilike.%${term}%,tagline.ilike.%${term}%,subcategory.ilike.%${term}%,bio.ilike.%${term}%`);
  }
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error || !data) return [];
  const artists = (data as Row[]).map(toArtist);

  // Plays for the cards, so a visitor sees the number without opening a profile.
  // ponytail: one extra round trip over the whole video table (one reel per
  // creator, so it's tiny). Denormalize onto artists if this list ever pages.
  const { data: plays } = await supabase
    .from("artist_videos")
    .select("artist_id, views_count")
    .in("artist_id", artists.map((a) => a.id));
  if (plays?.length) {
    const byArtist = new Map<string, number>();
    for (const p of plays as { artist_id: string; views_count: number | null }[]) {
      byArtist.set(p.artist_id, (byArtist.get(p.artist_id) ?? 0) + (p.views_count ?? 0));
    }
    for (const a of artists) a.playsCount = byArtist.get(a.id) ?? 0;
  }
  return artists;
}

// The homepage hero card. Whoever earned the most attention gets the slot —
// plays are the base, reactions count double because they take a deliberate tap.
// Only artists with a reel qualify: the card is built around the video.
//
// ponytail: ranks in JS over the 30 most-played reels, which is the whole table
// at this size. This is also where a paid "boost your profile" slot goes — check
// a boost_until column first and fall through to this organic order.
export async function getSpotlightArtist(): Promise<{ artist: Artist & { id: string }; video: Video } | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("artist_videos")
    .select(`id, artist_id, storage_path, url, title, likes_count, thumbs_count, views_count, artists!inner(${COLS}, is_published)`)
    .eq("artists.is_published", true)
    .order("views_count", { ascending: false })
    .limit(30);
  if (error || !data?.length) return null;

  const rows = data as unknown as (VideoRow & { artists: Row })[];
  const score = (r: VideoRow) => (r.views_count ?? 0) + 2 * ((r.likes_count ?? 0) + (r.thumbs_count ?? 0));
  const best = rows.reduce((a, b) => (score(b) > score(a) || (score(b) === score(a) && b.artists.rating > a.artists.rating) ? b : a));

  const video = toVideo(best);
  return video ? { artist: toArtist(best.artists), video } : null;
}

export async function getArtistBySlug(slug: string): Promise<(Artist & { id: string }) | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from("artists").select(COLS).eq("slug", slug).maybeSingle();
  if (error || !data) return null;
  return toArtist(data as Row);
}

// RLS returns a row only for active subscribers (or the owner). Non-subscribers
// get null — the paywall is enforced by the database, not just the UI.
export async function getContact(
  artistId: string,
): Promise<{ phone: string | null; email: string | null; whatsapp: string | null } | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("artist_contacts")
    .select("phone, email, whatsapp")
    .eq("artist_id", artistId)
    .maybeSingle();
  return data ?? null;
}

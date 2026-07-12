import { createClient } from "@/lib/supabase/server";
import type { Artist } from "@/lib/artists";

// DB row -> display shape used by the components.
type Row = {
  id: string;
  slug: string;
  name: string;
  category_slug: string;
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
};

const COLS =
  "id, slug, name, category_slug, city, tagline, bio, rating, reviews, gigs, languages, genres, availability, response_rate, featured_tag, price_min, price_max, photo_path, subcategory, tags, gender, nationality";

function toArtist(r: Row): Artist & { id: string } {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    category: r.category_slug,
    city: r.city,
    tagline: r.tagline ?? "",
    bio: r.bio ?? "",
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
  };
}

export type ArtistFilter = { category?: string; subcategory?: string; city?: string; gender?: string; tag?: string; q?: string };

export async function listArtists(filter: ArtistFilter = {}): Promise<(Artist & { id: string })[]> {
  const supabase = await createClient();
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
  return (data as Row[]).map(toArtist);
}

export async function getArtistBySlug(slug: string): Promise<(Artist & { id: string }) | null> {
  const supabase = await createClient();
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

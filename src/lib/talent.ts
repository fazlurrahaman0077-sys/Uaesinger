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
};

const COLS =
  "id, slug, name, category_slug, city, tagline, bio, rating, reviews, gigs, languages, genres, availability, response_rate, featured_tag, price_min, price_max, photo_path";

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
  };
}

export async function listArtists(categorySlug?: string): Promise<(Artist & { id: string })[]> {
  const supabase = await createClient();
  let q = supabase.from("artists").select(COLS).eq("is_published", true).order("created_at", { ascending: false });
  if (categorySlug && categorySlug !== "all") q = q.eq("category_slug", categorySlug);
  const { data, error } = await q;
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

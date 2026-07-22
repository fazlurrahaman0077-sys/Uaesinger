import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";

export type Review = {
  id: string;
  authorName: string;
  rating: number;
  body: string;
  createdAt: string;
  mine: boolean;
};

type Row = {
  id: string;
  user_id: string;
  author_name: string | null;
  rating: number;
  body: string;
  created_at: string;
};

// Public reviews for an artist, newest first. author_name is snapshotted on the
// row (auth.users isn't publicly readable), so this needs no join.
export async function listReviews(artistId: string, viewerId?: string): Promise<Review[]> {
  const { data } = await createPublicClient()
    .from("artist_reviews")
    .select("id, user_id, author_name, rating, body, created_at")
    .eq("artist_id", artistId)
    .order("created_at", { ascending: false });

  return ((data ?? []) as Row[]).map((r) => ({
    id: r.id,
    authorName: r.author_name?.trim() || "Anonymous",
    rating: r.rating,
    body: r.body,
    createdAt: r.created_at,
    mine: !!viewerId && r.user_id === viewerId,
  }));
}

export type RecentReview = {
  id: string;
  authorName: string;
  rating: number;
  body: string;
  artistName: string;
  artistSlug: string;
};

// Newest reviews across every artist, for the homepage social-proof rail.
// Rated 4+ only: the homepage is a shop window, not a complaints board — the
// full unfiltered set still shows on each artist's own profile. author_email is
// never selected (v23 revokes it from anon anyway).
export async function listRecentReviews(limit = 12): Promise<RecentReview[]> {
  const { data } = await createPublicClient()
    .from("artist_reviews")
    .select("id, author_name, rating, body, created_at, artists!inner(name, slug)")
    .gte("rating", 4)
    .order("created_at", { ascending: false })
    .limit(limit);

  type Joined = Omit<Row, "user_id"> & { artists: { name: string; slug: string } | null };
  return ((data ?? []) as unknown as Joined[])
    .filter((r) => r.artists && r.body?.trim())
    .map((r) => ({
      id: r.id,
      authorName: r.author_name?.trim() || "Anonymous",
      rating: r.rating,
      body: r.body,
      artistName: r.artists!.name,
      artistSlug: r.artists!.slug,
    }));
}

// The current user's own review of this artist, if any — lets the form open
// pre-filled in edit mode instead of offering a duplicate they can't insert.
export async function getMyReview(artistId: string): Promise<{ rating: number; body: string } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("artist_reviews")
    .select("rating, body")
    .eq("artist_id", artistId)
    .eq("user_id", user.id)
    .maybeSingle();
  return data ?? null;
}

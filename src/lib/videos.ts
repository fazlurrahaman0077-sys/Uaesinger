import { createClient } from "@/lib/supabase/server";

// Videos live on OUR infrastructure only — Cloudinary (our account) or Supabase
// Storage. We never store the creator's own external links (YouTube/Vimeo/IG),
// which would reveal their identity and break the contact paywall.
export type Video = {
  id: string;
  artistId: string;
  title: string | null;
  src: string; // Cloudinary CDN url, or Supabase public url
};

export function publicVideoUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/creator-videos/${path}`;
}

type Row = { id: string; artist_id: string; storage_path: string | null; url: string | null; title: string | null };

export async function listArtistVideos(artistId: string): Promise<Video[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("artist_videos")
    .select("id, artist_id, storage_path, url, title")
    .eq("artist_id", artistId)
    .order("created_at", { ascending: true });
  return ((data ?? []) as Row[])
    .map((r) => {
      const src = r.url || (r.storage_path ? publicVideoUrl(r.storage_path) : null);
      return src ? { id: r.id, artistId: r.artist_id, title: r.title, src } : null;
    })
    .filter((v): v is Video => v !== null);
}

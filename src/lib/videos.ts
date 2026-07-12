import { createClient } from "@/lib/supabase/server";

export type Video = {
  id: string;
  artistId: string;
  storagePath: string;
  title: string | null;
  url: string;
};

// Public URL for a stored object in the creator-videos bucket.
export function publicVideoUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/creator-videos/${path}`;
}

type Row = { id: string; artist_id: string; storage_path: string; title: string | null };

export async function listArtistVideos(artistId: string): Promise<Video[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("artist_videos")
    .select("id, artist_id, storage_path, title")
    .eq("artist_id", artistId)
    .order("created_at", { ascending: true });
  return ((data ?? []) as Row[]).map((r) => ({
    id: r.id,
    artistId: r.artist_id,
    storagePath: r.storage_path,
    title: r.title,
    url: publicVideoUrl(r.storage_path),
  }));
}

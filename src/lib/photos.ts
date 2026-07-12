import { createClient } from "@/lib/supabase/server";
import { publicPhotoUrl } from "@/lib/artists";

export type Photo = { id: string; storagePath: string; url: string };

export async function listArtistPhotos(artistId: string): Promise<Photo[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("artist_photos")
    .select("id, storage_path")
    .eq("artist_id", artistId)
    .order("created_at", { ascending: true });
  return ((data ?? []) as { id: string; storage_path: string }[]).map((r) => ({
    id: r.id,
    storagePath: r.storage_path,
    url: publicPhotoUrl(r.storage_path),
  }));
}

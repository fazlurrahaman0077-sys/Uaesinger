"use server";

import { createClient } from "@/lib/supabase/server";

// Like / unlike an artist. Deterministic: the client passes the intended next
// state, so no read-before-write. RLS (v18) enforces user_id = auth.uid();
// the count is kept by the artist_likes_count trigger.
export async function setLike(artistId: string, liked: boolean): Promise<{ ok: boolean; signedIn: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, signedIn: false };

  if (liked) {
    // Ignore duplicate-like conflicts (unique user_id, artist_id).
    const { error } = await supabase.from("artist_likes").insert({ user_id: user.id, artist_id: artistId });
    if (error && error.code !== "23505") return { ok: false, signedIn: true };
  } else {
    await supabase.from("artist_likes").delete().eq("user_id", user.id).eq("artist_id", artistId);
  }
  return { ok: true, signedIn: true };
}

// Thumbs-up / un-thumb a video. Same deterministic pattern as setLike.
export async function setVideoLike(videoId: string, liked: boolean): Promise<{ ok: boolean; signedIn: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, signedIn: false };

  if (liked) {
    const { error } = await supabase.from("video_likes").insert({ user_id: user.id, video_id: videoId });
    if (error && error.code !== "23505") return { ok: false, signedIn: true };
  } else {
    await supabase.from("video_likes").delete().eq("user_id", user.id).eq("video_id", videoId);
  }
  return { ok: true, signedIn: true };
}

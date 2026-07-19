import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import { quotaFor } from "@/lib/plans";

export type Access = {
  user: User | null;
  plan: string | null; // 'basic' | 'standard' | 'premium' | null
  quota: number | null; // null = unlimited
  unlocksUsed: number;
};

// Current auth + active plan + how many contacts the hirer has already unlocked.
export async function getAccess(): Promise<Access> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, plan: null, quota: 0, unlocksUsed: 0 };

  let plan: string | null = null;
  try {
    const { data } = await supabase
      .from("subscriptions")
      .select("plan")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    plan = data?.plan ?? null;
  } catch {
    plan = null;
  }

  let unlocksUsed = 0;
  if (plan) {
    const { count } = await supabase
      .from("contact_unlocks")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    unlocksUsed = count ?? 0;
  }

  return { user, plan, quota: plan ? quotaFor(plan) : 0, unlocksUsed };
}

export async function isArtistUnlocked(artistId: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("contact_unlocks")
    .select("id")
    .eq("user_id", user.id)
    .eq("artist_id", artistId)
    .maybeSingle();
  return !!data;
}

// Has the current user reacted to this artist? artist_likes (heart, v18) and
// artist_thumbs (thumbs up, v22) have the same shape, so one lookup serves both.
async function hasReacted(table: "artist_likes" | "artist_thumbs", artistId: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from(table)
    .select("id")
    .eq("user_id", user.id)
    .eq("artist_id", artistId)
    .maybeSingle();
  return !!data;
}

export const isArtistLiked = (artistId: string) => hasReacted("artist_likes", artistId);
export const isArtistThumbed = (artistId: string) => hasReacted("artist_thumbs", artistId);

// Which of these video ids the current user has liked (for the thumbs-up state).
export async function getLikedVideoIds(videoIds: string[]): Promise<Set<string>> {
  if (videoIds.length === 0) return new Set();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();
  const { data } = await supabase
    .from("video_likes")
    .select("video_id")
    .eq("user_id", user.id)
    .in("video_id", videoIds);
  return new Set((data ?? []).map((r) => r.video_id as string));
}

// Same as getLikedVideoIds, for the thumbs-up beside the heart (v26).
export async function getThumbedVideoIds(videoIds: string[]): Promise<Set<string>> {
  if (videoIds.length === 0) return new Set();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();
  const { data } = await supabase
    .from("video_thumbs")
    .select("video_id")
    .eq("user_id", user.id)
    .in("video_id", videoIds);
  return new Set((data ?? []).map((r) => r.video_id as string));
}

export function maskedNumber(): string {
  return "+971 5• ••• ••••";
}

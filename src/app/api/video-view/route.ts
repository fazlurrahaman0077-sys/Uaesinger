import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// A play counts as a view. Same guards as /api/visit — bot UA, same-origin,
// accept-language — because the same crawler noise that inflated visitor counts
// would inflate this one. Dedupe is the (video_id, viewer_id) primary key, so a
// replay or a reload is never a second view.
const BOT_UA = /bot|crawl|spider|slurp|headless|preview|monitor|curl|wget|python-|axios|fetch\/|lighthouse|pagespeed|gtmetrix/i;

export async function POST(request: NextRequest) {
  const { videoId } = (await request.json().catch(() => ({}))) as { videoId?: string };
  if (!videoId) return NextResponse.json({ ok: false }, { status: 400 });

  const ua = request.headers.get("user-agent") ?? "";
  if (!ua || BOT_UA.test(ua)) return NextResponse.json({ ok: true, counted: false });

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host || !origin.endsWith(host)) return NextResponse.json({ ok: true, counted: false });
  if (!request.headers.get("accept-language")) return NextResponse.json({ ok: true, counted: false });

  const fwd = request.headers.get("x-forwarded-for");
  const ip = (fwd ? fwd.split(",")[0].trim() : "") || request.headers.get("x-real-ip") || "local";

  const supabase = await createClient();
  // Duplicate (23505) is the expected path for a repeat viewer — not an error.
  await supabase.from("video_views").insert({ video_id: videoId, viewer_id: await viewerHash(ip, videoId) });

  return NextResponse.json({ ok: true, counted: true });
}

// SHA-256(ip:video) truncated — stable per viewer per video, non-reversible.
// ponytail: IP-based, so a shared office NAT counts once. Swap in a cookie id if
// that under-count ever matters more than the crawler resistance.
async function viewerHash(ip: string, videoId: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${ip}:${videoId}:uaesinger`));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

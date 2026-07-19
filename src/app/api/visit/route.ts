import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Visit counting moved off the proxy and behind this beacon: it only fires from
// real browser JS. A UA blocklist can't win against crawlers that send a Chrome
// user-agent, and that arms race is what inflated the numbers to ~150 "visitors"
// a day on a site with single-digit users. Crawlers overwhelmingly don't execute
// JS, so requiring the beacon is the signal, not a guess about the UA string.
//
// Kept as defence in depth: the UA blocklist, and a same-origin check so the
// endpoint can't be driven from elsewhere.
const BOT_UA = /bot|crawl|spider|slurp|headless|preview|monitor|curl|wget|python-|axios|fetch\/|lighthouse|pagespeed|gtmetrix/i;

export async function POST(request: NextRequest) {
  const ua = request.headers.get("user-agent") ?? "";
  if (!ua || BOT_UA.test(ua)) return NextResponse.json({ ok: true, counted: false });

  // Real browsers send these on a fetch; most scripted clients don't.
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host || !origin.endsWith(host)) {
    return NextResponse.json({ ok: true, counted: false });
  }
  if (!request.headers.get("accept-language")) {
    return NextResponse.json({ ok: true, counted: false });
  }

  const day = new Date().toISOString().slice(0, 10); // UTC YYYY-MM-DD
  const fwd = request.headers.get("x-forwarded-for");
  const ip = (fwd ? fwd.split(",")[0].trim() : "") || request.headers.get("x-real-ip") || "local";

  const supabase = await createClient();
  // (visitor_id, day) is the primary key, so a repeat visit that slips past the
  // client-side guard is deduped by the database rather than double-counted.
  await supabase.from("visits").insert({ visitor_id: await visitorHash(ip, day), day });

  return NextResponse.json({ ok: true, counted: true });
}

// SHA-256(ip:day) truncated — a stable, non-reversible per-day visitor id.
async function visitorHash(ip: string, day: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${ip}:${day}:uaesinger`));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Next 16 renamed `middleware` -> `proxy`. This refreshes the Supabase auth
// session cookie on every request so Server Components see a valid user.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Touch the session so an expired token gets refreshed into the response.
  await supabase.auth.getUser();

  // Unique-daily-visitor tracking, keyed on the client IP (one row per IP per
  // day → no duplicate views from incognito / multiple browsers / cleared
  // cookies). The IP is hashed with the day so we never store raw addresses.
  // A per-day cookie throttles writes so the proxy doesn't hit the DB on every
  // request; the (visitor_id, day) PK is the real dedupe guard.
  const today = new Date().toISOString().slice(0, 10); // UTC YYYY-MM-DD
  if (request.cookies.get("v_day")?.value !== today) {
    response.cookies.set("v_day", today, { maxAge: 60 * 60 * 24, httpOnly: true, sameSite: "lax" });
    const fwd = request.headers.get("x-forwarded-for");
    const ip = (fwd ? fwd.split(",")[0].trim() : "") || request.headers.get("x-real-ip") || "local";
    await supabase.from("visits").insert({ visitor_id: await visitorHash(ip, today), day: today });
  }

  return response;
}

// SHA-256(ip:day) truncated — a stable, non-reversible per-day visitor id.
async function visitorHash(ip: string, day: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${ip}:${day}:uaesinger`));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

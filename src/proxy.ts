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

  // Visit counting used to happen here, gated on a user-agent blocklist. Every
  // crawler sending a Chrome UA counted as a visitor, which is how a site with
  // single-digit users recorded ~150 a day. It now runs from VisitBeacon against
  // /api/visit, so only browsers that actually execute JS are counted.
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

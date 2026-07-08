import { createBrowserClient } from "@supabase/ssr";

// Browser Supabase client — used by the sign-in / sign-up forms and any
// client component that needs the current session.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

import { createClient } from "@supabase/supabase-js";

// Cookieless anon client for PUBLIC data reads (published artists, posts, videos).
// Because it doesn't touch cookies(), pages that only use it can be statically
// cached / ISR'd — no per-request SSR. Never use for auth-gated reads/writes.
let client: ReturnType<typeof createClient> | null = null;

export function createPublicClient() {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }
  return client;
}

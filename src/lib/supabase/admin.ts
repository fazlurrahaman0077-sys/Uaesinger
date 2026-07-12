import { createClient } from "@supabase/supabase-js";

// Service-role client — BYPASSES RLS. Server-only, never import in client code.
// Used for trusted writes (activating a subscription after Ziina confirms the
// payment) that must not be forgeable by the client.
// Set SUPABASE_SERVICE_ROLE_KEY in the environment (Supabase → Project → API).
export function hasAdmin(): boolean {
  return !!process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

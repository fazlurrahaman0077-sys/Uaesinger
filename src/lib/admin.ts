import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Shared small action buttons for the admin lists (/admin and /admin/posts).
export const btn =
  "text-[12px] font-semibold px-3 py-1.5 rounded-lg border border-[var(--line)] text-[var(--ink-dim)] hover:border-[var(--blue)] hover:text-[var(--blue-dark)] transition-all whitespace-nowrap";
export const btnDanger =
  "text-[12px] font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-[var(--coral)] hover:bg-red-50 transition-all whitespace-nowrap";

// Gate for admin-only pages/actions. Redirects non-admins away.
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?next=/admin");

  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (data?.role !== "admin") redirect("/");

  return { supabase, user };
}

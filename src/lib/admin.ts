import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

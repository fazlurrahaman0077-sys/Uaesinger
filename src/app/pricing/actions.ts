"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPlan } from "@/lib/plans";

export async function subscribe(formData: FormData) {
  const planId = String(formData.get("plan") ?? "");
  if (!getPlan(planId)) redirect("/pricing");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?next=/pricing");

  // ponytail: DEV STUB — activates the plan directly. Replace with Stripe
  // Checkout + webhook before launch; drop the dev insert RLS policy then.
  // Cancel any previous active plan so the newest is the source of truth.
  await supabase.from("subscriptions").update({ status: "canceled" }).eq("user_id", user.id).eq("status", "active");
  await supabase.from("subscriptions").insert({ user_id: user.id, plan: planId, status: "active" });

  revalidatePath("/pricing");
  redirect("/artists");
}

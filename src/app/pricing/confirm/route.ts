import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, hasAdmin } from "@/lib/supabase/admin";
import { getPaymentIntent } from "@/lib/ziina";

// Return URL from Ziina's hosted checkout. We don't trust the redirect itself —
// we look up the user's latest pending payment and ask Ziina for its real
// status before activating anything.
export async function GET(req: NextRequest) {
  const to = (path: string) => NextResponse.redirect(new URL(path, req.url));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return to("/signin?next=/pricing");

  const { data: payment } = await supabase
    .from("payments")
    .select("id, plan, ziina_id, status")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!payment) return to("/dashboard");

  let intent;
  try {
    intent = await getPaymentIntent(payment.ziina_id);
  } catch {
    return to("/pricing?error=verify");
  }

  // Trusted writer: service-role (bypasses RLS) so activation can't be forged by
  // the client. Falls back to the user session until the key is set.
  const writer = hasAdmin() ? createAdminClient() : supabase;

  if (intent.status === "completed") {
    await writer.from("payments").update({ status: "completed" }).eq("id", payment.id);
    // Newest active plan is the source of truth — cancel any previous one.
    await writer.from("subscriptions").update({ status: "canceled" }).eq("user_id", user.id).eq("status", "active");
    await writer.from("subscriptions").insert({
      user_id: user.id,
      plan: payment.plan,
      status: "active",
      ziina_payment_id: payment.ziina_id,
    });
    return to("/dashboard?welcome=1");
  }

  if (intent.status === "failed" || intent.status === "canceled") {
    await writer.from("payments").update({ status: "failed" }).eq("id", payment.id);
    return to("/pricing?failed=1");
  }

  // Still processing — leave the pending row; the user can retry.
  return to("/pricing?pending=1");
}

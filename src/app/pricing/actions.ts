"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getPlan } from "@/lib/plans";
import { createPaymentIntent } from "@/lib/ziina";

// Absolute site origin, derived from the incoming request (works on any host).
async function siteOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

// Start a real Ziina payment for the chosen plan, then send the user to Ziina's
// hosted checkout. The subscription is activated only after /pricing/confirm
// verifies the payment with Ziina (see pricing/confirm/route.ts).
export async function subscribe(formData: FormData) {
  const planId = String(formData.get("plan") ?? "");
  const plan = getPlan(planId);
  if (!plan) redirect("/pricing");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?next=/pricing");

  const origin = await siteOrigin();
  const intent = await createPaymentIntent({
    amountAed: plan.priceAed,
    message: `UAESinger — ${plan.label} plan (${plan.contactsLabel})`,
    successUrl: `${origin}/pricing/confirm`,
    cancelUrl: `${origin}/pricing?canceled=1`,
    failureUrl: `${origin}/pricing?failed=1`,
  });

  // Record the pending payment so the return handler can find + verify it.
  await supabase.from("payments").insert({
    user_id: user.id,
    user_email: user.email ?? null,
    plan: plan.id,
    ziina_id: intent.id,
    amount_aed: plan.priceAed,
    status: "pending",
  });

  redirect(intent.redirect_url);
}

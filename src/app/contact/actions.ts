"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

// SHA-256 of the client IP — same approach as the visit tracking in proxy.ts, so
// we rate-limit without ever storing a raw address.
async function ipHash(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  const ip = (fwd ? fwd.split(",")[0].trim() : "") || h.get("x-real-ip") || "local";
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${ip}:contact:uaesinger`));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

export async function sendContactMessage(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim() || null;
  const message = String(formData.get("message") ?? "").trim();

  // Honeypot: hidden from humans, irresistible to bots. Report success so the
  // bot never learns it was caught.
  if (String(formData.get("company") ?? "").trim()) redirect("/contact?sent=1");

  if (!name || !email || !message) redirect("/contact?error=1");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) redirect("/contact?error=1");

  // submit_contact_message (v25) enforces a 3-per-hour-per-IP limit inside the
  // database and is the only write path into contact_messages — the client
  // cannot count its own submissions or insert around the check.
  const supabase = await createClient();
  const { data: accepted } = await supabase.rpc("submit_contact_message", {
    p_name: name,
    p_email: email,
    p_subject: subject,
    p_message: message,
    p_ip_hash: await ipHash(),
  });

  redirect(accepted === false ? "/contact?error=rate" : "/contact?sent=1");
}

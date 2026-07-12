// Ziina Payments API client (server-only). Docs: https://docs.ziina.com
// Auth: Bearer ZIINA_API_KEY. Amounts are in MINOR units (fils) — AED 99 = 9900.
// Server-only: reads ZIINA_API_KEY (never exposed to the client).
const BASE = "https://api-v2.ziina.com/api";

function apiKey(): string {
  const key = process.env.ZIINA_API_KEY;
  if (!key) throw new Error("ZIINA_API_KEY is not set");
  return key;
}

// Test mode charges nothing (no payment instrument required). Toggle via env.
const TEST = process.env.ZIINA_TEST === "true";

export type PaymentIntent = {
  id: string;
  status:
    | "requires_payment_instrument"
    | "requires_user_action"
    | "pending"
    | "completed"
    | "failed"
    | "canceled";
  redirect_url: string;
  amount: number;
  currency_code: string;
  latest_error?: { message?: string; code?: string } | null;
};

export async function createPaymentIntent(input: {
  amountAed: number;
  message: string;
  successUrl: string;
  cancelUrl: string;
  failureUrl: string;
}): Promise<PaymentIntent> {
  const res = await fetch(`${BASE}/payment_intent`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(input.amountAed * 100), // AED → fils
      currency_code: "AED",
      message: input.message,
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      failure_url: input.failureUrl,
      test: TEST,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Ziina create failed (${res.status}): ${await res.text()}`);
  }
  return (await res.json()) as PaymentIntent;
}

// Authoritative status check — server calls Ziina directly, so it can't be
// forged by the client on return from the hosted checkout page.
export async function getPaymentIntent(id: string): Promise<PaymentIntent> {
  const res = await fetch(`${BASE}/payment_intent/${id}`, {
    headers: { Authorization: `Bearer ${apiKey()}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Ziina get failed (${res.status}): ${await res.text()}`);
  }
  return (await res.json()) as PaymentIntent;
}

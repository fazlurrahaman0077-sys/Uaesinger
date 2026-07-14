import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAccess } from "@/lib/subscription";
import { PLANS, getPlan, FREE_MODE } from "@/lib/plans";
import { subscribe } from "./actions";

export const metadata: Metadata = {
  title: "Pricing — plans to unlock artist contacts | UAESinger",
  description:
    "Basic, Standard or Premium. Browse talent free; subscribe to unlock direct contact details for the artists you want to book.",
};

export default async function PricingPage() {
  // Hidden while everything is free — flip FREE_MODE off (src/lib/plans.ts) to
  // bring the pricing page back with paid plans.
  if (FREE_MODE) redirect("/artists");

  const { user, plan, quota, unlocksUsed } = await getAccess();
  const current = getPlan(plan);
  const remaining = quota === null ? null : Math.max(0, quota - unlocksUsed);

  return (
    <>
      <Header />
      <main className="bg-[var(--bg2)] min-h-screen">
        <section className="px-5 pt-16 pb-4 text-center">
          <p className="text-[12px] font-bold uppercase tracking-widest text-[var(--blue-dark)] mb-2">Pricing</p>
          <h1 className="font-display text-[34px] sm:text-[44px] font-semibold text-[var(--ink)] mb-3">
            Unlock the talent you want
          </h1>
          <p className="text-[15px] text-[var(--ink-dim)] max-w-[540px] mx-auto">
            Browsing profiles and reels is free. Choose a plan to reveal direct contact details — each
            plan includes a set number of artist contacts.
          </p>
        </section>

        {current && (
          <div className="max-w-[560px] mx-auto px-5 pb-2">
            <div className="bg-white border border-[var(--blue-mid)] rounded-xl px-5 py-3 text-center text-[13px] text-[var(--ink-dim)]">
              You&apos;re on <span className="font-semibold text-[var(--ink)]">{current.label}</span> —{" "}
              {remaining === null ? "unlimited contacts" : `${remaining} of ${quota} contacts left this month`}.
            </div>
          </div>
        )}

        <section className="px-5 pt-8 pb-24">
          <div className="max-w-[1020px] mx-auto grid md:grid-cols-3 gap-5 items-start">
            {PLANS.map((p) => {
              const isCurrent = plan === p.id;
              return (
                <div
                  key={p.id}
                  className={`relative bg-white rounded-2xl p-7 border shadow-[0_16px_40px_rgba(16,26,38,0.05)] ${
                    p.highlight ? "border-[var(--blue)] ring-1 ring-[var(--blue-mid)] md:-translate-y-2" : "border-[var(--line)]"
                  }`}
                >
                  {p.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider text-white bg-[var(--blue)] px-3 py-1 rounded-full">
                      Most popular
                    </span>
                  )}

                  <h3 className="font-display text-[22px] font-semibold text-[var(--ink)]">{p.label}</h3>
                  <p className="text-[12.5px] text-[var(--ink-dim)] mb-4">{p.tagline}</p>

                  <div className="flex items-end gap-1.5 mb-1">
                    <span className="font-display text-[34px] font-bold text-[var(--ink)]">{p.price}</span>
                    <span className="text-[13px] text-[var(--ink-dim)] mb-1.5">{p.per}</span>
                  </div>
                  <p className="text-[13px] font-bold text-[var(--blue-dark)] mb-5">{p.contactsLabel}</p>

                  <ul className="flex flex-col gap-2.5 mb-6">
                    {p.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2 text-[13px] text-[var(--ink-dim)]">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2.5" className="mt-0.5 flex-shrink-0">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                        {perk}
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <div className="w-full py-3 rounded-lg bg-[var(--bg2)] border border-[var(--line)] text-[13.5px] font-semibold text-[var(--ink-dim)] text-center">
                      Current plan
                    </div>
                  ) : user ? (
                    <form action={subscribe}>
                      <input type="hidden" name="plan" value={p.id} />
                      <button
                        type="submit"
                        className={`w-full py-3 rounded-lg text-[14px] font-semibold transition-all shadow-sm ${
                          p.highlight
                            ? "bg-[var(--blue)] text-white hover:bg-[var(--blue-dark)]"
                            : "bg-[var(--ink)] text-white hover:bg-black"
                        }`}
                      >
                        {plan ? `Switch to ${p.label}` : `Choose ${p.label}`}
                      </button>
                    </form>
                  ) : (
                    <Link
                      href="/signin?next=/pricing"
                      className={`block text-center w-full py-3 rounded-lg text-[14px] font-semibold transition-all shadow-sm ${
                        p.highlight ? "bg-[var(--blue)] text-white hover:bg-[var(--blue-dark)]" : "bg-[var(--ink)] text-white hover:bg-black"
                      }`}
                    >
                      Sign in to choose
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-center text-[12px] text-[var(--ink-faint)] mt-8">
            Artists list free. Contacts reset each billing month. Cancel anytime.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}

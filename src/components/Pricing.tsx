const PLANS = [
  {
    name: "Basic", price: 250,
    blurb: "For occasional bookers planning one or two events.",
    unlocks: "5 artist contacts / month",
    features: ["Browse every profile and reel", "5 unlocked contacts per month", "Standard email support", "Access expires after 30 days"],
    featured: false,
  },
  {
    name: "Standard", price: 350,
    blurb: "For agencies and frequent hosts booking talent regularly.",
    unlocks: "15 artist contacts / month",
    features: ["Everything in Basic", "15 unlocked contacts per month", "Priority response from artists", "Save unlimited shortlists"],
    featured: true,
  },
  {
    name: "Premium", price: 500,
    blurb: "For venues and production houses hiring talent continuously.",
    unlocks: "Unlimited artist contacts",
    features: ["Everything in Standard", "Unlimited unlocked contacts", "Dedicated booking concierge", "Early access to new profiles"],
    featured: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="bg-[var(--bg2)] border-t border-[var(--line)] py-20 px-5 pb-24">
      <div className="max-w-[640px] mx-auto text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--blue)]" />
          <span className="text-[11px] font-bold tracking-widest uppercase text-[var(--blue-dark)]">Subscriptions for clients</span>
        </div>
        <h2 className="font-display text-[28px] sm:text-[32px] font-semibold text-[var(--ink)] mb-3">
          One plan. Every artist on the platform.
        </h2>
        <p className="text-[14px] text-[var(--ink-dim)]">
          Subscribing unlocks artist contact details. Browsing profiles and watching reels is always free.
        </p>
      </div>

      <div className="max-w-[1060px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {PLANS.map((p) => (
          <div
            key={p.name}
            className={`relative bg-white rounded-2xl p-7 flex flex-col hover:-translate-y-1 transition-all duration-200 ${
              p.featured
                ? "border-2 border-[var(--blue)] shadow-[0_12px_32px_rgba(43,127,214,0.18)]"
                : "border border-[var(--line)] hover:shadow-[0_4px_16px_rgba(16,26,38,0.06)]"
            }`}
          >
            {p.featured && (
              <span className="absolute -top-3 left-6 text-[10.5px] font-bold tracking-wider uppercase text-white bg-[var(--blue)] px-3 py-1 rounded-full">
                Most booked
              </span>
            )}

            <h3 className="font-display text-[20px] font-semibold text-[var(--ink)] mt-1 mb-1">{p.name}</h3>
            <p className="text-[12.5px] text-[var(--ink-dim)] mb-5 min-h-[36px]">{p.blurb}</p>

            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="font-display text-[38px] font-bold text-[var(--ink)]">{p.price}</span>
              <span className="text-[12.5px] text-[var(--ink-faint)]">AED / month</span>
            </div>
            <span className="inline-block text-[11.5px] font-semibold text-[var(--blue-dark)] bg-[var(--blue-soft)] px-2.5 py-1 rounded-md mb-5">
              {p.unlocks}
            </span>

            <div className="flex flex-col gap-2.5 flex-1 mb-6">
              {p.features.map((f) => (
                <div key={f} className="flex items-start gap-2 text-[13px] text-[var(--ink)]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2B7FD6" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {f}
                </div>
              ))}
            </div>

            <button
              className={`w-full py-3 rounded-xl text-[13.5px] font-semibold transition-all cursor-pointer ${
                p.featured
                  ? "bg-[var(--blue)] text-white border-none hover:bg-[var(--blue-dark)] shadow-[0_4px_14px_rgba(43,127,214,0.26)]"
                  : "bg-transparent border border-[var(--line)] text-[var(--ink)] hover:border-[var(--blue)] hover:text-[var(--blue-dark)]"
              }`}
            >
              Choose {p.name}
            </button>
          </div>
        ))}
      </div>

      <p className="text-center mt-8 text-[12px] text-[var(--ink-faint)] flex items-center justify-center gap-1.5">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        Cancel anytime. No commission taken on bookings.
      </p>
    </section>
  );
}

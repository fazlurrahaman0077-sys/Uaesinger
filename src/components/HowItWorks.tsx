const STEPS = [
  { n: "1", title: "Browse and watch", desc: "Filter by act, city, or budget, then watch each artist's signature performance reel." },
  { n: "2", title: "Subscribe to unlock", desc: "Pick a plan and unlock direct contact details for the artists you shortlist." },
  { n: "3", title: "Book directly", desc: "Message and book the artist yourself — no commission taken on the booking." },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-5">
      <div className="max-w-[1180px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--blue)]" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-[var(--blue-dark)]">How booking works</span>
          </div>
          <h2 className="font-display text-[27px] sm:text-[30px] font-semibold text-[var(--ink)] mb-4 leading-tight">
            Watch the reel first. Talk to the artist second.
          </h2>
          <p className="text-[14px] text-[var(--ink-dim)] leading-relaxed">
            Every profile on UAESinger includes a one-minute performance video, so you book based on what you actually hear and see — not a photo and a promise. Contact details stay locked until you subscribe, keeping every enquiry serious.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {STEPS.map((s) => (
            <div key={s.n} className="flex gap-4">
              <div className="w-9 h-9 rounded-xl bg-[var(--blue-soft)] text-[var(--blue-dark)] font-display text-[15px] font-semibold flex items-center justify-center flex-shrink-0">
                {s.n}
              </div>
              <div>
                <h4 className="text-[15px] font-semibold text-[var(--ink)] mb-1">{s.title}</h4>
                <p className="text-[13px] text-[var(--ink-dim)] leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

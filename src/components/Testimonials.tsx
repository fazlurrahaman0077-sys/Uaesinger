const TESTIMONIALS = [
  {
    initials: "RM",
    bg: "linear-gradient(135deg,#2B7FD6,#5BA3E8)",
    name: "Rania Mansour",
    role: "Wedding planner, Dubai",
    text: "We booked a full live band for a 300-guest wedding in Dubai through UAESinger. Watching the performance video first meant zero surprises on the day.",
  },
  {
    initials: "JK",
    bg: "linear-gradient(135deg,#15578F,#2B7FD6)",
    name: "James Keller",
    role: "Events manager, Abu Dhabi resort",
    text: "As a hotel events manager I hire MCs and photographers monthly. The Premium plan pays for itself after two bookings.",
  },
  {
    initials: "SA",
    bg: "linear-gradient(135deg,#D6A13C,#E8C374)",
    name: "Sara Al Naqbi",
    role: "Marketing lead, Sharjah",
    text: "Found a bilingual MC for our Sharjah corporate launch in under an hour. The contact unlock process felt safe and serious, not spammy.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 px-5">
      <div className="max-w-[1180px] mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--blue)]" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-[var(--blue-dark)]">What clients say</span>
          </div>
          <h2 className="font-display text-[28px] sm:text-[30px] font-semibold text-[var(--ink)]">
            Trusted by hosts and venues across the UAE
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-white border border-[var(--line)] rounded-2xl p-6 flex flex-col">
              <div className="text-[var(--gold)] text-[14px] tracking-[3px] mb-3">★★★★★</div>
              <p className="text-[13.5px] text-[var(--ink)] leading-relaxed mb-5 flex-1">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-semibold flex-shrink-0"
                  style={{ background: t.bg }}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-[var(--ink)]">{t.name}</div>
                  <div className="text-[11.5px] text-[var(--ink-faint)]">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

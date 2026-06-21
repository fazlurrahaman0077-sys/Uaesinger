"use client";

export default function Hero() {
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="pt-16 sm:pt-20 pb-0 px-5 bg-gradient-to-b from-[var(--bg3)] to-white overflow-hidden">
      <div className="max-w-[1180px] mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-center pb-16">

        {/* Copy */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--blue)] flex-shrink-0" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-[var(--blue-dark)]">
              UAE&apos;s entertainment booking platform
            </span>
          </div>

          <h1 className="font-display text-[clamp(28px,4.2vw,50px)] font-bold leading-[1.1] tracking-tight text-[var(--ink)] mb-5">
            Hire singers, DJs, bands and{" "}
            <span className="text-[var(--blue)]">entertainers</span>{" "}
            across the UAE — with confidence
          </h1>

          <p className="text-[15px] sm:text-[16px] text-[var(--ink-dim)] leading-relaxed mb-7 max-w-[460px]">
            UAESinger.com connects clients in Dubai, Abu Dhabi, Sharjah and every Emirate with verified talent. Watch a real performance video before you book — for weddings, corporate events, and full-time roles.
          </p>

          <div className="flex flex-wrap gap-3 mb-5">
            <button
              onClick={() => scrollTo("talent")}
              className="px-6 py-3.5 rounded-lg bg-[var(--blue)] text-white text-[14.5px] font-semibold shadow-[0_12px_32px_rgba(43,127,214,0.22)] hover:bg-[var(--blue-dark)] hover:-translate-y-0.5 transition-all active:translate-y-0"
            >
              Browse talent →
            </button>
            <button
              onClick={() => scrollTo("how-it-works")}
              className="flex items-center gap-2 px-5 py-3.5 rounded-lg border border-[var(--line)] bg-white text-[var(--ink)] text-[14.5px] font-semibold hover:border-[var(--blue)] hover:text-[var(--blue-dark)] transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15578F" strokeWidth="2.2">
                <path d="M8 5v14l11-7z" />
              </svg>
              See how it works
            </button>
          </div>

          <p className="text-[12.5px] text-[var(--ink-faint)]">
            Popular:{" "}
            <button onClick={() => scrollTo("talent")} className="text-[var(--blue-dark)] font-medium hover:underline bg-transparent border-none cursor-pointer text-[12.5px]">singer for hire Dubai</button>
            {" · "}
            <button onClick={() => scrollTo("talent")} className="text-[var(--blue-dark)] font-medium hover:underline bg-transparent border-none cursor-pointer text-[12.5px]">wedding DJ Abu Dhabi</button>
            {" · "}
            <button onClick={() => scrollTo("talent")} className="text-[var(--blue-dark)] font-medium hover:underline bg-transparent border-none cursor-pointer text-[12.5px]">event MC Sharjah</button>
          </p>
        </div>

        {/* Preview card */}
        <div className="relative max-w-[480px] mx-auto lg:mx-0 w-full">
          {/* Float card top */}
          <div className="hidden sm:flex absolute -top-4 -right-4 z-10 bg-white border border-[var(--line)] rounded-xl shadow-lg px-3.5 py-2.5 items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-[var(--blue-soft)] flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15578F" strokeWidth="2.2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <div>
              <div className="text-[13px] font-bold text-[var(--ink)] leading-tight">Verified</div>
              <div className="text-[10px] text-[var(--ink-faint)]">profile reviewed</div>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white border border-[var(--line)] rounded-2xl shadow-[0_16px_40px_rgba(16,26,38,0.10)] overflow-hidden">
            {/* Browser bar */}
            <div className="flex items-center gap-1.5 px-3.5 py-2.5 border-b border-[var(--line)]">
              <span className="w-2 h-2 rounded-full bg-[var(--line)]" />
              <span className="w-2 h-2 rounded-full bg-[var(--line)]" />
              <span className="w-2 h-2 rounded-full bg-[var(--line)]" />
              <span className="ml-2 text-[10.5px] text-[var(--ink-faint)]">uaesinger.com/layla-hassan</span>
            </div>
            {/* Video area */}
            <div className="aspect-[16/10] bg-gradient-to-br from-[var(--blue-soft)] to-[var(--blue-mid)] relative flex items-center justify-center">
              <span className="absolute top-3 left-3 text-[10px] font-bold tracking-wider uppercase text-white bg-[var(--blue)] px-2.5 py-1 rounded-md">
                Top rated
              </span>
              <div className="w-14 h-14 rounded-full bg-white shadow-[0_6px_20px_rgba(43,127,214,0.28)] flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#2B7FD6">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span className="absolute bottom-3 left-3 text-[11px] font-semibold text-[var(--blue-deep)] bg-white/80 px-2 py-1 rounded-md">
                60-second reel
              </span>
            </div>
            {/* Info */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <span className="font-display text-[17px] font-semibold text-[var(--ink)]">Layla Hassan</span>
                <span className="text-[13px] text-[var(--gold)] font-semibold">★ 4.9</span>
              </div>
              <div className="flex gap-1.5 flex-wrap mb-3">
                {["Wedding vocalist", "Dubai", "142 gigs"].map((t) => (
                  <span key={t} className="text-[11px] text-[var(--blue-dark)] bg-[var(--blue-soft)] px-2.5 py-0.5 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between bg-[var(--bg2)] border border-[var(--line)] rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-2 text-[12px] text-[var(--ink-dim)]">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  Contact locked
                </div>
                <button
                  onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
                  className="text-[11px] font-bold text-white bg-[var(--blue)] px-3 py-1.5 rounded-md hover:bg-[var(--blue-dark)] transition-colors cursor-pointer border-none"
                >
                  Unlock
                </button>
              </div>
            </div>
          </div>

          {/* Float card bottom */}
          <div className="hidden sm:flex absolute -bottom-4 -left-6 z-10 bg-white border border-[var(--line)] rounded-xl shadow-lg px-3.5 py-2.5 items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-[var(--blue-soft)] flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15578F" strokeWidth="2.2">
                <path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </span>
            <div>
              <div className="text-[13px] font-bold text-[var(--ink)] leading-tight">9,600+</div>
              <div className="text-[10px] text-[var(--ink-faint)]">events booked</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

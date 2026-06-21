const PERKS = [
  "Your contact stays private until a client subscribes",
  "No commission taken on any booking you close",
  "Get discovered across Dubai, Abu Dhabi and beyond",
];

export default function ArtistCTA() {
  return (
    <section id="artists" className="bg-[var(--blue-deep)] py-20 px-5">
      <div className="max-w-[1180px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Copy */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9FCBF0]" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#9FCBF0]">For artists</span>
          </div>
          <h2 className="font-display text-[27px] sm:text-[30px] font-semibold text-white mb-4 leading-tight">
            One video. One profile. Every event in the UAE.
          </h2>
          <p className="text-[14px] text-white/70 leading-relaxed mb-6 max-w-[420px]">
            Upload a single performance video, set your rate and availability, and let clients across the Emirates discover you — for one-off events or full-time roles.
          </p>
          <div className="flex flex-col gap-3 mb-7">
            {PERKS.map((perk) => (
              <div key={perk} className="flex items-start gap-2.5 text-[13.5px] text-white/85">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9FCBF0" strokeWidth="2.4" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {perk}
              </div>
            ))}
          </div>
          <button className="px-7 py-3.5 rounded-xl bg-[var(--blue)] text-white text-[14.5px] font-semibold hover:bg-white hover:text-[var(--blue-deep)] transition-all shadow-[0_12px_32px_rgba(43,127,214,0.3)] cursor-pointer border-none">
            Create your artist profile →
          </button>
        </div>

        {/* Quote card */}
        <div className="bg-white/7 border border-white/15 rounded-2xl p-7 backdrop-blur-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#9FCBF0" className="mb-4">
            <path d="M3 21c3 0 7-1 7-8V5H3v8h4c0 3-1 5-4 5v3zm11 0c3 0 7-1 7-8V5h-7v8h4c0 3-1 5-4 5v3z" />
          </svg>
          <p className="font-display text-[17px] text-white leading-relaxed italic mb-6">
            I uploaded one reel from a wedding in Abu Dhabi and within a month I had three corporate bookings I never would have found on my own.
          </p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--blue)] to-[#9FCBF0] flex-shrink-0" />
            <div>
              <div className="text-[13px] font-semibold text-white">Yasmin Khoury</div>
              <div className="text-[11.5px] text-white/55">Oud &amp; vocal duo, Ras Al Khaimah</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const LOGOS = ["Palm Grand Resorts", "Marina Bay Hotels", "Atlas Event Co.", "Desert Rose Weddings", "Skyline Conferences"];

export default function TrustBar() {
  return (
    <div className="border-y border-[var(--line)] bg-white py-5 px-5">
      <div className="max-w-[1180px] mx-auto flex flex-wrap items-center justify-between gap-4">
        <span className="text-[10.5px] font-bold tracking-widest uppercase text-[var(--ink-faint)] whitespace-nowrap">
          Trusted by event teams at
        </span>
        <div className="flex flex-wrap gap-6 items-center">
          {LOGOS.map((logo) => (
            <span key={logo} className="font-display text-[15px] font-semibold text-[var(--ink-faint)] opacity-60">
              {logo}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

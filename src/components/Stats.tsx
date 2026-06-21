const STATS = [
  { num: "1,400+", label: "verified artists" },
  { num: "7", label: "Emirates covered" },
  { num: "9,600+", label: "events booked" },
  { num: "4.8 / 5", label: "average client rating" },
];

export default function Stats() {
  return (
    <div className="bg-[var(--blue-deep)] py-14 px-5">
      <div className="max-w-[1180px] mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
        {STATS.map((s) => (
          <div key={s.label} className="text-center">
            <div className="font-display text-[28px] sm:text-[32px] font-bold text-white">{s.num}</div>
            <div className="text-[12px] text-white/60 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

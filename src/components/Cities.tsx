const CITIES = [
  {
    title: "Singers, DJs & bands in Dubai",
    desc: "The largest pool of wedding singers, live bands, and DJs in the UAE, covering venues from Downtown Dubai to Palm Jumeirah and Dubai Marina.",
    tags: ["Wedding singers", "Corporate DJs", "Live bands"],
  },
  {
    title: "MCs, hosts & photographers in Abu Dhabi",
    desc: "Bilingual Arabic-English MCs, event hosts, and professional photographers available for corporate functions and private celebrations in Abu Dhabi.",
    tags: ["Bilingual MCs", "Event hosts", "Photographers"],
  },
  {
    title: "Entertainers & dancers in Sharjah",
    desc: "Traditional and contemporary dancers, family-friendly entertainers, and full event staff for Sharjah's family-oriented event venues.",
    tags: ["Dancers", "Family entertainers", "Event staff"],
  },
  {
    title: "Talent in Ajman, RAK, Fujairah & UAQ",
    desc: "Growing directory of singers, photographers, and entertainers based in or willing to travel to the Northern Emirates for weddings and resort events.",
    tags: ["Resort events", "Weddings", "Travel-ready talent"],
  },
];

export default function Cities() {
  return (
    <section className="bg-[var(--bg2)] border-y border-[var(--line)] py-16 px-5">
      <div className="max-w-[1180px] mx-auto">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--blue)]" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-[var(--blue-dark)]">
              Coverage across the Emirates
            </span>
          </div>
          <h2 className="font-display text-[28px] sm:text-[30px] font-semibold text-[var(--ink)] mb-3">
            Book entertainment talent in every Emirate
          </h2>
          <p className="text-[14px] text-[var(--ink-dim)] max-w-[560px] mx-auto">
            UAESinger.com lists verified singers, DJs, bands, MCs, hosts, photographers and entertainers based in and available to travel across the UAE.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CITIES.map((c) => (
            <div key={c.title} className="bg-white border border-[var(--line)] rounded-xl p-5 hover:shadow-[0_4px_16px_rgba(16,26,38,0.06)] transition-shadow">
              <h3 className="text-[15px] font-semibold text-[var(--ink)] mb-2">{c.title}</h3>
              <p className="text-[13px] text-[var(--ink-dim)] leading-relaxed mb-3">{c.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {c.tags.map((t) => (
                  <span key={t} className="text-[11px] font-medium text-[var(--blue-dark)] bg-[var(--blue-soft)] px-2.5 py-1 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

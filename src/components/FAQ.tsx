const FAQS = [
  {
    q: "How do I hire a singer or DJ in Dubai through UAESinger?",
    a: "Browse the Singers or DJs & bands category and filter by Dubai. Sign in and send a booking request on any profile — the UAESinger team confirms the artist's availability and handles the details for your event.",
  },
  {
    q: "Do you list talent in Abu Dhabi, Sharjah and the Northern Emirates, not just Dubai?",
    a: "Yes. UAESinger.com lists verified singers, DJs, bands, MCs, hosts, photographers and entertainers based in or available to travel to Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah and Umm Al Quwain.",
  },
  {
    q: "Can I hire talent for a permanent or full-time role, not just a single event?",
    a: "Yes. Artist profiles indicate availability for both one-off event bookings and ongoing or full-time roles, such as resident hotel singers, in-house photographers, or permanent event hosts.",
  },
  {
    q: "Is there a fee to browse artist profiles?",
    a: "No. Browsing every profile and watching performance videos is completely free. A subscription is only required to unlock an artist's direct contact details.",
  },
];

export default function FAQ() {
  return (
    <section className="py-20 px-5">
      <div className="max-w-[760px] mx-auto">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--blue)]" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-[var(--blue-dark)]">Questions</span>
          </div>
          <h2 className="font-display text-[28px] font-semibold text-[var(--ink)]">Frequently asked questions</h2>
        </div>

        <div className="divide-y divide-[var(--line)]">
          {FAQS.map((item) => (
            <div key={item.q} className="py-6">
              <h3 className="text-[15px] font-semibold text-[var(--ink)] mb-2">{item.q}</h3>
              <p className="text-[13.5px] text-[var(--ink-dim)] leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

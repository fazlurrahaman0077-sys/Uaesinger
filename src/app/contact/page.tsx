import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { sendContactMessage } from "./actions";

export const metadata: Metadata = {
  title: "Contact us | UAESinger",
  description: "Get in touch with the UAESinger team — for bookings, listing help, partnerships or support across the UAE.",
};

const EMAIL = "hello@uaesinger.com";
const WHATSAPP = "+971 50 000 0000"; // TODO: replace with your real number

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const { sent, error } = await searchParams;

  return (
    <>
      <Header />
      <main className="bg-[var(--bg2)] min-h-screen">
        <div className="max-w-[1040px] mx-auto px-5 py-14">
          <p className="text-[12px] font-bold uppercase tracking-widest text-[var(--orange)] mb-2">Contact</p>
          <h1 className="font-display text-[34px] sm:text-[42px] font-semibold text-[var(--ink)] leading-[1.05] mb-3">
            Let&apos;s talk
          </h1>
          <p className="text-[15px] text-[var(--ink-dim)] max-w-[560px] mb-10">
            Questions about booking talent, listing your act, or partnering with us? Send a message and the
            UAESinger team will get back to you.
          </p>

          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 items-start">
            {/* Contact details */}
            <div className="flex flex-col gap-4">
              <ContactCard icon="✉️" label="Email" value={EMAIL} href={`mailto:${EMAIL}`} />
              <ContactCard icon="💬" label="WhatsApp" value={WHATSAPP} href={`https://wa.me/${WHATSAPP.replace(/[^\d]/g, "")}`} />
              <ContactCard icon="📍" label="Based in" value="Dubai, United Arab Emirates" />
              <div className="bg-white border border-[var(--line)] rounded-2xl p-5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--ink-faint)] mb-2">Hours</p>
                <p className="text-[13.5px] text-[var(--ink-dim)]">Sun–Thu, 9:00–18:00 GST</p>
                <p className="text-[13.5px] text-[var(--ink-dim)]">We usually reply within one business day.</p>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white border border-[var(--line)] rounded-2xl p-6 sm:p-8">
              {sent ? (
                <div className="text-center py-10">
                  <div className="text-[40px] mb-3">✅</div>
                  <h2 className="font-display text-[22px] font-semibold text-[var(--ink)] mb-1">Message sent</h2>
                  <p className="text-[14px] text-[var(--ink-dim)]">Thanks — we&apos;ll be in touch shortly.</p>
                </div>
              ) : (
                <form action={sendContactMessage} className="flex flex-col gap-4">
                  {error && (
                    <p className="text-[13px] text-[var(--coral)] bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
                      Please fill in your name, email and message.
                    </p>
                  )}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field name="name" label="Your name" required />
                    <Field name="email" label="Email" type="email" required />
                  </div>
                  <Field name="subject" label="Subject" />
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12.5px] font-semibold text-[var(--ink)]">Message <span className="text-[var(--orange)]">*</span></span>
                    <textarea name="message" rows={6} required className={`${input} resize-y`} placeholder="How can we help?" />
                  </label>
                  <button type="submit" className="py-3 rounded-xl bg-[var(--blue)] text-white text-[14.5px] font-semibold hover:bg-[var(--blue-dark)] transition-all shadow-sm">
                    Send message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

const input =
  "px-3.5 py-2.5 rounded-lg border border-[var(--line)] text-[14px] text-[var(--ink)] outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue-soft)] transition-all w-full bg-white";

function Field({ name, label, type = "text", required }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-semibold text-[var(--ink)]">
        {label} {required && <span className="text-[var(--orange)]">*</span>}
      </span>
      <input name={name} type={type} required={required} className={input} />
    </label>
  );
}

function ContactCard({ icon, label, value, href }: { icon: string; label: string; value: string; href?: string }) {
  const inner = (
    <div className="bg-white border border-[var(--line)] rounded-2xl p-5 flex items-center gap-4 hover:border-[var(--blue-mid)] transition-colors">
      <span className="text-[22px]">{icon}</span>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--ink-faint)]">{label}</p>
        <p className="text-[14.5px] font-semibold text-[var(--ink)]">{value}</p>
      </div>
    </div>
  );
  return href ? <a href={href}>{inner}</a> : inner;
}

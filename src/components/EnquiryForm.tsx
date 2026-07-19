"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { requestBooking } from "@/app/artists/[slug]/actions";

const enquiryInput =
  "px-3 py-2 rounded-lg border border-[var(--line)] text-[13px] text-[var(--ink)] outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue-soft)] transition-all w-full bg-white";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="py-2.5 rounded-lg bg-[var(--blue)] text-white text-[13px] font-semibold hover:bg-[var(--blue-dark)] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? "Sending…" : label}
    </button>
  );
}

const cardLink = "text-[13px] font-semibold text-[var(--ink)] hover:text-[var(--blue-dark)] transition-colors";

// Inline enquiry form — submits via server action and shows success without a
// full page reload (no heavy profile re-render), so it feels instant.
export default function EnquiryForm({
  artistId,
  firstName,
  slug,
}: {
  artistId: string;
  firstName: string;
  slug: string;
}) {
  const [state, action] = useActionState(requestBooking, null);

  if (state?.ok) {
    const card = state.card;
    const hasCard = card && (card.phone || card.whatsapp || card.email);
    return (
      <div className="text-center">
        <p className="w-full py-2.5 rounded-lg bg-green-50 border border-green-200 text-green-700 text-[12.5px] font-semibold">
          Enquiry sent{hasCard ? ` — here are ${firstName}'s details` : ""}.
        </p>
        {/* The card is revealed with the enquiry, so the hirer can call straight away. */}
        {hasCard && (
          <div className="mt-3 p-3.5 rounded-lg bg-white border border-[var(--line)] flex flex-col gap-2 text-left">
            {card!.phone && (
              <a href={`tel:${card!.phone.replace(/\s/g, "")}`} className={cardLink}>
                📞 Call {card!.phone}
              </a>
            )}
            {card!.whatsapp && (
              <a
                href={`https://wa.me/${card!.whatsapp.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cardLink}
              >
                💬 WhatsApp {card!.whatsapp}
              </a>
            )}
            {card!.email && (
              <a href={`mailto:${card!.email}`} className={cardLink}>
                ✉️ {card!.email}
              </a>
            )}
          </div>
        )}
        {state.error && <p className="mt-2 text-[12px] text-[var(--coral)] font-medium">{state.error}</p>}
        <Link href="/dashboard" className="inline-block mt-2 text-[12px] font-semibold text-[var(--blue-dark)] hover:underline">
          {hasCard ? "Saved to your dashboard →" : "Track it in your dashboard →"}
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="text-[12.5px] text-[var(--ink-dim)] mb-3">
        Send an enquiry and {firstName}&apos;s contact details are shown straight away.
      </p>
      <form action={action} className="flex flex-col gap-2.5 text-left">
        <input type="hidden" name="artistId" value={artistId} />
        <input type="hidden" name="slug" value={slug} />
        <input name="hirer_name" required placeholder="Your name" className={enquiryInput} />
        <input name="hirer_phone" placeholder="Your phone (optional)" className={enquiryInput} />
        <input name="event_date" type="date" className={enquiryInput} />
        <textarea name="message" rows={3} placeholder="Event details — date, venue, what you need." className={`${enquiryInput} resize-y`} />
        {state?.error && <p className="text-[12px] text-[var(--coral)] font-medium">{state.error}</p>}
        <Submit label="Send enquiry" />
      </form>
    </>
  );
}

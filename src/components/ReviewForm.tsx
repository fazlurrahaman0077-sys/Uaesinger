"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { submitReview } from "@/app/artists/[slug]/actions";

const input =
  "px-3 py-2 rounded-lg border border-[var(--line)] text-[13px] text-[var(--ink)] outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue-soft)] transition-all w-full bg-white";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="py-2.5 px-5 rounded-lg bg-[var(--blue)] text-white text-[13px] font-semibold hover:bg-[var(--blue-dark)] transition-all disabled:opacity-60 disabled:cursor-not-allowed self-start"
    >
      {pending ? "Posting…" : label}
    </button>
  );
}

// Radio group under the hood — keyboard and screen-reader usable for free,
// styled to look like a star picker.
function Stars({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <fieldset className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      <legend className="sr-only">Your rating</legend>
      {[1, 2, 3, 4, 5].map((n) => (
        <label key={n} className="cursor-pointer" onMouseEnter={() => setHover(n)}>
          <input
            type="radio"
            name="rating"
            value={n}
            checked={value === n}
            onChange={() => onChange(n)}
            className="sr-only peer"
          />
          <span
            aria-hidden="true"
            className={`text-[26px] leading-none transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--blue)] rounded ${
              n <= (hover || value) ? "text-[var(--gold)]" : "text-[var(--line)]"
            }`}
          >
            ★
          </span>
          <span className="sr-only">{n} star{n > 1 ? "s" : ""}</span>
        </label>
      ))}
    </fieldset>
  );
}

export default function ReviewForm({
  artistId,
  slug,
  firstName,
  existing,
}: {
  artistId: string;
  slug: string;
  firstName: string;
  existing: { rating: number; body: string } | null;
}) {
  const [state, action] = useActionState(submitReview, null);
  const [rating, setRating] = useState(existing?.rating ?? 0);

  if (state?.ok) {
    return (
      <p className="py-2.5 px-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-[12.5px] font-semibold">
        Thanks — your review of {firstName} is live.
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="artistId" value={artistId} />
      <input type="hidden" name="slug" value={slug} />
      <Stars value={rating} onChange={setRating} />
      <textarea
        name="body"
        rows={4}
        required
        maxLength={2000}
        defaultValue={existing?.body ?? ""}
        placeholder={`How was ${firstName}? Venue, crowd, how the set landed.`}
        className={`${input} resize-y`}
      />
      {state?.error && <p className="text-[12px] text-[var(--coral)] font-medium">{state.error}</p>}
      <Submit label={existing ? "Update review" : "Post review"} />
    </form>
  );
}

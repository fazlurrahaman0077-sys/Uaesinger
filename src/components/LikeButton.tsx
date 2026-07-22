"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLike, setThumb } from "@/app/like-actions";

// Reaction button for an artist: heart = save/favourite, thumb = upvote.
// Optimistic; on the grid it sits inside the card's <Link>, so we stop the
// click from navigating.
// ponytail: cards render with `initialLiked={false}` (no per-user lookup on the
// grid to avoid N queries) — the fill only reflects likes made this session
// until reload. Pass the real value on the profile page. Add a batched
// liked-ids fetch at the grid level if that matters later.
const VARIANTS = {
  heart: {
    action: setLike,
    colour: "#ef4444",
    label: ["Like", "Unlike"],
    path: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  },
  thumb: {
    action: setThumb,
    colour: "#2563eb",
    label: ["Thumbs up", "Remove thumbs up"],
    path: "M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3",
  },
} as const;

export default function LikeButton({
  artistId,
  initialCount,
  initialLiked = false,
  size = "sm",
  variant = "heart",
}: {
  artistId: string;
  initialCount: number;
  initialLiked?: boolean;
  size?: "sm" | "lg";
  variant?: "heart" | "thumb";
}) {
  const v = VARIANTS[variant];
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function toggle(e: React.MouseEvent) {
    e.preventDefault(); // don't navigate when nested in the card link
    e.stopPropagation();
    const next = !liked;
    setLiked(next);
    setCount((c) => Math.max(0, c + (next ? 1 : -1)));
    startTransition(async () => {
      const res = await v.action(artistId, next);
      if (!res.signedIn) {
        // Roll back the optimistic change and send them to sign in.
        setLiked(!next);
        setCount((c) => Math.max(0, c + (next ? -1 : 1)));
        router.push("/signin?next=" + encodeURIComponent(window.location.pathname));
      }
    });
  }

  const lg = size === "lg";
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={liked}
      aria-label={liked ? v.label[1] : v.label[0]}
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold transition-all disabled:opacity-60 ${
        lg
          ? "px-4 py-2 text-[14px] border border-[var(--line)] bg-white hover:bg-[var(--bg2)]"
          : "px-2 py-1 text-[11.5px] border border-[var(--line)] bg-white text-[var(--ink-dim)] hover:border-[var(--blue-mid)] hover:bg-[var(--bg2)] active:scale-95"
      }`}
    >
      <svg width={lg ? 18 : 15} height={lg ? 18 : 15} viewBox="0 0 24 24" aria-hidden="true"
        fill={liked ? v.colour : "none"} stroke={liked ? v.colour : "currentColor"} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d={v.path} />
      </svg>
      <span className="text-[var(--ink)]">{count}</span>
    </button>
  );
}

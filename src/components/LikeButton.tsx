"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLike } from "@/app/like-actions";

// Heart / like button for an artist. Optimistic; on the grid it sits inside the
// card's <Link>, so we stop the click from navigating.
// ponytail: cards render with `initialLiked={false}` (no per-user lookup on the
// grid to avoid N queries) — the fill only reflects likes made this session
// until reload. Pass the real value on the profile page. Add a batched
// liked-ids fetch at the grid level if that matters later.
export default function LikeButton({
  artistId,
  initialCount,
  initialLiked = false,
  size = "sm",
}: {
  artistId: string;
  initialCount: number;
  initialLiked?: boolean;
  size?: "sm" | "lg";
}) {
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
      const res = await setLike(artistId, next);
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
      aria-label={liked ? "Unlike" : "Like"}
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold transition-all disabled:opacity-60 ${
        lg
          ? "px-4 py-2 text-[14px] border border-[var(--line)] bg-white hover:bg-[var(--bg2)]"
          : "px-2.5 py-1.5 text-[12px] bg-black/35 backdrop-blur-sm text-white hover:bg-black/50"
      }`}
    >
      <svg width={lg ? 18 : 15} height={lg ? 18 : 15} viewBox="0 0 24 24" aria-hidden="true"
        fill={liked ? "#ef4444" : "none"} stroke={liked ? "#ef4444" : "currentColor"} strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span className={lg ? "text-[var(--ink)]" : ""}>{count}</span>
    </button>
  );
}

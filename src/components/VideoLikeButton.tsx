"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setVideoLike } from "@/app/like-actions";

// Thumbs-up / like for a single video. Optimistic; sends signed-out users to sign in.
export default function VideoLikeButton({
  videoId,
  initialCount,
  initialLiked = false,
}: {
  videoId: string;
  initialCount: number;
  initialLiked?: boolean;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function toggle() {
    const next = !liked;
    setLiked(next);
    setCount((c) => Math.max(0, c + (next ? 1 : -1)));
    startTransition(async () => {
      const res = await setVideoLike(videoId, next);
      if (!res.signedIn) {
        setLiked(!next);
        setCount((c) => Math.max(0, c + (next ? -1 : 1)));
        router.push("/signin?next=" + encodeURIComponent(window.location.pathname));
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={liked}
      aria-label={liked ? "Remove like" : "Like video"}
      className={`inline-flex items-center gap-1.5 text-[12.5px] font-semibold transition-colors disabled:opacity-60 ${
        liked ? "text-[var(--blue-dark)]" : "text-[var(--ink-dim)] hover:text-[var(--blue-dark)]"
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M7 10v11M2 13v6a2 2 0 002 2h13.3a2 2 0 002-1.7l1.3-8A2 2 0 0017.9 9H14V4a2 2 0 00-2-2l-4 8H7z" />
      </svg>
      {count}
    </button>
  );
}

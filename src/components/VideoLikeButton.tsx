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
      aria-label={liked ? "Unlike video" : "Like video"}
      className={`inline-flex items-center gap-1.5 text-[12.5px] font-semibold transition-colors disabled:opacity-60 ${
        liked ? "text-[#ef4444]" : "text-[var(--ink-dim)] hover:text-[#ef4444]"
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {count}
    </button>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setVideoLike, setVideoThumb } from "@/app/like-actions";

// Reactions for a single video: heart = save/favourite, thumb = upvote. Mirrors
// LikeButton's variant split so both surfaces behave the same way.
const VARIANTS = {
  heart: {
    action: setVideoLike,
    colour: "#ef4444",
    label: ["Like video", "Unlike video"],
    path: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  },
  thumb: {
    action: setVideoThumb,
    colour: "#2563eb",
    label: ["Thumbs up", "Remove thumbs up"],
    path: "M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3",
  },
} as const;

// Optimistic; sends signed-out users to sign in.
export default function VideoLikeButton({
  videoId,
  initialCount,
  initialLiked = false,
  variant = "heart",
}: {
  videoId: string;
  initialCount: number;
  initialLiked?: boolean;
  variant?: "heart" | "thumb";
}) {
  const v = VARIANTS[variant];
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function toggle() {
    const next = !liked;
    setLiked(next);
    setCount((c) => Math.max(0, c + (next ? 1 : -1)));
    startTransition(async () => {
      const res = await v.action(videoId, next);
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
      aria-label={liked ? v.label[1] : v.label[0]}
      style={liked ? { color: v.colour } : undefined}
      className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold transition-colors disabled:opacity-60 text-[var(--ink-dim)] hover:opacity-80"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d={v.path} />
      </svg>
      {count}
    </button>
  );
}

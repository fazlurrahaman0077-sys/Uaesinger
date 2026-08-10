"use client";

import { useRef, useState, type ReactNode } from "react";
import { formatViews } from "@/lib/format";

// Shows the reel as a poster frame (first frame via preload="metadata") with a
// play button overlaid. Clicking starts playback and swaps in native controls.
// Works for both Cloudinary and Supabase sources — no separate thumbnail needed.
export default function VideoReel({
  src,
  videoId,
  views = 0,
  poster,
  className,
  wrapperClassName = "",
  children,
}: {
  src: string;
  videoId?: string;
  views?: number;
  // preload="metadata" only paints a first frame if the browser feels like it —
  // Safari and most mobile browsers render the black <video> box instead. The
  // creator's cover image fills that gap until the first frame decodes.
  poster?: string;
  className?: string;
  wrapperClassName?: string; // lets a caller drop the player into an aspect box
  children?: ReactNode;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  const counted = useRef(false);

  function play() {
    ref.current?.play();
    setStarted(true);
  }

  // First play only — the beacon is what the server counts (the API's
  // (video_id, viewer_id) key dedupes across sessions), and the ref keeps a
  // pause/resume from firing again within this one. A ref, not `started`:
  // clicking the overlay sets that before the native play event arrives.
  function onPlay() {
    setStarted(true);
    if (counted.current) return;
    counted.current = true;
    if (!videoId) return;
    fetch("/api/video-view", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ videoId }),
      keepalive: true,
    }).catch(() => {});
  }

  return (
    // A caller-supplied wrapper class replaces `relative` rather than adding to
    // it — Tailwind emits position utilities in a fixed order, so `relative`
    // would beat an `absolute` passed in here no matter how it's written.
    // Either way the overlays get a positioned box to anchor to.
    <div className={`bg-black ${wrapperClassName || "relative"}`}>
      <video
        ref={ref}
        src={src}
        poster={poster}
        controls={started}
        preload="metadata"
        playsInline
        onPlay={onPlay}
        className={className}
      />

      {/* Play count, over the poster frame. Hidden once playing so it never sits
          on top of the native controls. */}
      {!started && (
        <span className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 text-[13px] font-semibold text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.6)] pointer-events-none">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 4l14 8-14 8V4z" />
          </svg>
          {formatViews(views)}
          <span className="sr-only"> plays</span>
        </span>
      )}

      {!started && (
        <button
          type="button"
          onClick={play}
          aria-label="Play video"
          className="absolute inset-0 flex items-center justify-center bg-black/15 hover:bg-black/25 transition-colors group"
        >
          <span className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.35)] group-hover:scale-105 transition-transform">
            <svg className="w-7 h-7 text-[var(--ink)] ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}

      {children}
    </div>
  );
}

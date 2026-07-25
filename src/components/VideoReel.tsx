"use client";

import { useRef, useState, type ReactNode } from "react";

// Shows the reel as a poster frame (first frame via preload="metadata") with a
// play button overlaid. Clicking starts playback and swaps in native controls.
// Works for both Cloudinary and Supabase sources — no separate thumbnail needed.
export default function VideoReel({
  src,
  className,
  children,
}: {
  src: string;
  className?: string;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  function play() {
    ref.current?.play();
    setStarted(true);
  }

  return (
    <div className="relative bg-black">
      <video
        ref={ref}
        src={src}
        controls={started}
        preload="metadata"
        playsInline
        onPlay={() => setStarted(true)}
        className={className}
      />

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

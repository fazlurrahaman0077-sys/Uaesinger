"use client";

import { useEffect, useRef, useState } from "react";

// Smooth fade-up as sections enter the viewport. Reveals once, respects
// reduced-motion (renders visible immediately).
export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    // threshold MUST stay 0. A ratio threshold is unreachable for any element
    // taller than ~8x the viewport: the grid is one column on mobile, so it
    // never intersects 12% of itself at once and the section stayed at
    // opacity 0 forever. 0 fires as soon as a single pixel enters.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(22px)",
        transition: `opacity 0.7s ease, transform 0.7s cubic-bezier(0.2,0.7,0.2,1)`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

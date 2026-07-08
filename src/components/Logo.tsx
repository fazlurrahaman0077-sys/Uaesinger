import Link from "next/link";

// UAESinger wordmark. The mark is a velvet tile holding an amber equalizer —
// the same "live sound" signature used across the site.
export default function Logo({
  size = 32,
  className = "",
  invert = false,
}: {
  size?: number;
  className?: string;
  invert?: boolean;
}) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 flex-shrink-0 ${className}`} aria-label="UAESinger home">
      <LogoMark size={size} />
      <span
        className={`font-display font-bold tracking-tight ${invert ? "text-white" : "text-[var(--ink)]"}`}
        style={{ fontSize: size * 0.62 }}
      >
        UAE<span className="text-[var(--blue)]">Singer</span>
      </span>
    </Link>
  );
}

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <defs>
        <linearGradient id="us-mark" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5A2E86" />
          <stop offset="1" stopColor="#2A0F45" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#us-mark)" />
      {/* Amber equalizer */}
      <g fill="#F5A623">
        <rect x="8" y="14" width="2.6" height="10" rx="1.3" />
        <rect x="12.4" y="9" width="2.6" height="15" rx="1.3" />
        <rect x="16.8" y="12" width="2.6" height="12" rx="1.3" />
        <rect x="21.2" y="7" width="2.6" height="17" rx="1.3" />
      </g>
    </svg>
  );
}

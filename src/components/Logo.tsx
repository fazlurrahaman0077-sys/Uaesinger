import Link from "next/link";

// UAE SINGER brand logo (public/logo.png — transparent, trimmed). `size` is the
// rendered height in px; width scales with the wordmark's aspect ratio.
export default function Logo({ size = 30, className = "" }: { size?: number; className?: string }) {
  return (
    <Link href="/" className={`flex items-center flex-shrink-0 ${className}`} aria-label="UAE Singer home">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="UAE Singer" style={{ height: size, width: "auto" }} className="select-none" />
    </Link>
  );
}

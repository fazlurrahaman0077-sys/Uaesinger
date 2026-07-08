// Signature motif: a live equalizer. The product is about live sound, so the
// recurring mark is a set of bars that "play" — used in the hero as a live
// indicator and in the wordmark. Pure CSS animation; respects reduced motion.

const HEIGHTS = [0.5, 0.85, 0.35, 1, 0.6, 0.9, 0.45];
const DELAYS = [0, 0.18, 0.36, 0.09, 0.27, 0.12, 0.42];

export default function SoundBars({
  bars = 5,
  className = "",
  color = "var(--amber)",
  size = 3,
  gap = 2,
  height = 22,
}: {
  bars?: number;
  className?: string;
  color?: string;
  size?: number;
  gap?: number;
  height?: number;
}) {
  return (
    <span
      aria-hidden
      className={`inline-flex items-end ${className}`}
      style={{ gap, height }}
    >
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className="eq-bar rounded-full"
          style={{
            width: size,
            height,
            background: color,
            transform: `scaleY(${HEIGHTS[i % HEIGHTS.length]})`,
            animationDelay: `${DELAYS[i % DELAYS.length]}s`,
            animationDuration: `${0.8 + (i % 3) * 0.22}s`,
          }}
        />
      ))}
    </span>
  );
}

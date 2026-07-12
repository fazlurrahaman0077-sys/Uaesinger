// Deterministic gradient avatar with initials — same seed always yields the
// same colour, so a user's avatar is stable across the app. No external service.
function hashHue(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

function initialsFrom(name: string, seed: string): string {
  const src = name.trim() || seed.split("@")[0];
  const words = src.replace(/[^a-zA-Z ]/g, " ").split(/\s+/).filter(Boolean);
  const two = (words[0]?.[0] ?? seed[0] ?? "?") + (words[1]?.[0] ?? "");
  return two.toUpperCase();
}

export default function Avatar({
  seed,
  name = "",
  size = 32,
  className = "",
}: {
  seed: string;
  name?: string;
  size?: number;
  className?: string;
}) {
  const hue = hashHue(seed);
  return (
    <span
      aria-hidden
      className={`inline-flex items-center justify-center rounded-full font-bold text-white select-none flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: `linear-gradient(135deg, hsl(${hue} 68% 56%), hsl(${(hue + 42) % 360} 66% 44%))`,
      }}
    >
      {initialsFrom(name, seed)}
    </span>
  );
}

import { ImageResponse } from "next/og";
import { getArtistBySlug } from "@/lib/talent";
import { categoryLabel, priceRange, initials, publicPhotoUrl, CATEGORIES } from "@/lib/artists";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "UAE Singer creator profile";

// Branded share card rendered when a profile link is posted to WhatsApp/social.
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);
  const name = artist?.name ?? "UAE Singer";
  const cat = artist ? `${CATEGORIES.find((c) => c.slug === artist.category)?.emoji ?? "🎤"}  ${categoryLabel(artist.category)}` : "Book live talent";
  const city = artist?.city ?? "United Arab Emirates";
  const tagline = artist?.tagline ?? "Book verified singers, DJs, bands & entertainers across the UAE.";
  const price = artist ? priceRange(artist.priceMin, artist.priceMax) : null;
  const photo = artist?.photoPath ? publicPhotoUrl(artist.photoPath) : null;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "linear-gradient(135deg, #2A0F45 0%, #5A2E86 100%)", color: "white", fontFamily: "sans-serif" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64 }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: 34, fontWeight: 800 }}>
            <span style={{ color: "#F26A21" }}>UAE</span>
            <span style={{ color: "white" }}>SINGER</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 24, color: "#DAC7EC", marginBottom: 12 }}>{cat}  ·  {city}</div>
            <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, marginBottom: 18 }}>{name}</div>
            <div style={{ fontSize: 30, color: "#EADFF6", maxWidth: 620 }}>{tagline}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {artist && <div style={{ fontSize: 26, fontWeight: 700, color: "#F5A623" }}>★ {artist.rating.toFixed(1)}</div>}
            {price && <div style={{ fontSize: 26, background: "rgba(255,255,255,0.14)", padding: "8px 20px", borderRadius: 999 }}>{price}</div>}
          </div>
        </div>
        <div style={{ width: 440, display: "flex", alignItems: "center", justifyContent: "center", background: "#3A1A5C" }}>
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} width={440} height={630} style={{ objectFit: "cover", width: 440, height: 630 }} alt="" />
          ) : (
            <div style={{ fontSize: 200, fontWeight: 800, color: "rgba(255,255,255,0.28)", display: "flex" }}>{initials(name)}</div>
          )}
        </div>
      </div>
    ),
    size,
  );
}

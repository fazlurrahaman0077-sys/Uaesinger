import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import VisitBeacon from "@/components/VisitBeacon";
import "./globals.css";

// Fraunces — theatrical, optical display face (marquee character).
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
});

// Hanken Grotesk — warm humanist body, not the default Inter.
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Hire Singers, DJs, Bands, MCs, Hosts, Photographers & Entertainers in Dubai & UAE | UAESinger.com",
  description:
    "UAESinger.com connects clients across Dubai, Abu Dhabi, Sharjah and all Emirates with verified singers, DJs, bands, MCs, hosts, photographers and entertainers. Watch real performance videos and book talent for weddings, corporate events, and full-time roles.",
  keywords:
    "hire singer Dubai, DJ for hire Abu Dhabi, wedding band UAE, event MC Dubai, photographer Dubai events, entertainer UAE, book talent Sharjah, event host Dubai, live band Abu Dhabi, UAE entertainment booking",
  // Served from /public and declared explicitly, so the URLs are stable across
  // deploys. The src/app file convention fingerprints them instead
  // (/favicon.ico?favicon.<hash>.ico), and Google caches favicons by URL, so a
  // hash that changes every deploy works against it. 192x192 is a multiple of
  // 48, which is the size Google documents for search-result favicons.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${hanken.variable}`}>
      <body suppressHydrationWarning>
        {children}
        <VisitBeacon />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
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
  title: "Hire Singers, DJs, Bands, MCs, Hosts, Photographers & Entertainers in Dubai & UAE | UAESinger.com",
  description:
    "UAESinger.com connects clients across Dubai, Abu Dhabi, Sharjah and all Emirates with verified singers, DJs, bands, MCs, hosts, photographers and entertainers. Watch real performance videos and book talent for weddings, corporate events, and full-time roles.",
  keywords:
    "hire singer Dubai, DJ for hire Abu Dhabi, wedding band UAE, event MC Dubai, photographer Dubai events, entertainer UAE, book talent Sharjah, event host Dubai, live band Abu Dhabi, UAE entertainment booking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${hanken.variable}`}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

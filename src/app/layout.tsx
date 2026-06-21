import type { Metadata } from "next";
import { Bodoni_Moda, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bodoni",
  weight: ["500", "600", "700", "800"],
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
    <html lang="en" className={`${inter.variable} ${bodoniModa.variable}`}>
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import ArtistGrid from "@/components/ArtistGrid";
import Cities from "@/components/Cities";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import ArtistCTA from "@/components/ArtistCTA";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";

// Self-referencing canonical. Declared here rather than in the root layout,
// where it would point every page at the homepage. Artist and blog pages set
// their own; this is the page Google actually has indexed.
export const metadata: Metadata = { alternates: { canonical: "/" } };

// ISR — cache the homepage; regenerate at most every 5 min. Served in ~50ms.
export const revalidate = 300;

// The site had no Organization markup, so Google had no entity to attach the
// name "UAESinger" to — hence "Did you mean: uae singer" and our own social
// profiles outranking us. alternateName covers the spaced spelling.
// sameAs is what tells Google the profiles outranking us are the same entity.
// TODO: add the YouTube channel alongside Instagram and Facebook.
const orgJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "UAESinger",
      alternateName: ["UAE Singer", "UAESinger.com"],
      url: SITE_URL,
      logo: `${SITE_URL}/icon-192.png`,
      sameAs: [
        "https://www.instagram.com/uaesinger",
        "https://www.facebook.com/people/UAESinger/61561809433252/",
      ],
      description:
        "UAESinger connects clients across the UAE with verified singers, DJs, bands, MCs, hosts and photographers for weddings, corporate events and national days.",
      areaServed: { "@type": "Country", name: "United Arab Emirates" },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "UAESinger",
      url: SITE_URL,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function Home() {
  return (
    <>
      <JsonLd data={orgJsonLd} />
      <Header />
      <main>
        <Hero />
        <Reveal><TrustBar /></Reveal>
        <ArtistGrid />
        <Reveal><Cities /></Reveal>
        <Reveal><HowItWorks /></Reveal>
        <Reveal><Testimonials /></Reveal>
        <Reveal><ArtistCTA /></Reveal>
        <Reveal><FAQ /></Reveal>
        <Reveal><FinalCTA /></Reveal>
      </main>
      <Footer />
    </>
  );
}

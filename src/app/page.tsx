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

// Self-referencing canonical. Declared here rather than in the root layout,
// where it would point every page at the homepage. Artist and blog pages set
// their own; this is the page Google actually has indexed.
export const metadata: Metadata = { alternates: { canonical: "/" } };

// ISR — cache the homepage; regenerate at most every 5 min. Served in ~50ms.
export const revalidate = 300;

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Reveal><TrustBar /></Reveal>
        <Reveal><ArtistGrid /></Reveal>
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

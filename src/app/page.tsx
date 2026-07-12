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

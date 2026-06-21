import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import Stats from "@/components/Stats";
import ArtistGrid from "@/components/ArtistGrid";
import Cities from "@/components/Cities";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import ArtistCTA from "@/components/ArtistCTA";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <Stats />
        <ArtistGrid />
        <Cities />
        <HowItWorks />
        <Pricing />
        <Testimonials />
        <ArtistCTA />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import OnboardingForm from "./OnboardingForm";

export const metadata: Metadata = {
  title: "Create your artist profile | UAESinger",
  description: "List yourself on UAESinger and get booked by clients across the UAE.",
};

export default async function NewArtistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?next=/artists/new");

  return (
    <>
      <Header />
      <main className="bg-[var(--bg2)] min-h-screen">
        <div className="max-w-[1080px] mx-auto px-5 py-10 sm:py-14">
          <Link href="/artists" className="text-[13px] text-[var(--blue-dark)] font-semibold hover:underline">
            ← Back to talent
          </Link>
          <div className="mt-5 mb-9 max-w-[560px]">
            <p className="text-[12px] font-bold uppercase tracking-widest text-[var(--orange)] mb-2">For creators</p>
            <h1 className="font-display text-[32px] sm:text-[42px] font-semibold text-[var(--ink)] leading-[1.05] mb-3">
              Get on the stage.
            </h1>
            <p className="text-[14.5px] text-[var(--ink-dim)]">
              Listing is free. Fill this in and watch your profile come to life on the right — clients
              subscribe to reach you, so your contact details stay private until then.
            </p>
          </div>

          <OnboardingForm userId={user.id} />
        </div>
      </main>
      <Footer />
    </>
  );
}

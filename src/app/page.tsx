import Hero from "@/components/sections/Hero";
import CommunityIntro from "@/components/sections/CommunityIntro";
import TrustBar from "@/components/sections/TrustBar";
import FeaturedScripts from "@/components/sections/FeaturedScripts";
import LibraryAccessCTA from "@/components/sections/LibraryAccessCTA";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import Showcase from "@/components/sections/Showcase";
import Reviews from "@/components/sections/Reviews";
import FAQ from "@/components/sections/FAQ";
import FinalCTA from "@/components/sections/FinalCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <CommunityIntro />
      <TrustBar />
      <LibraryAccessCTA />
      <FeaturedScripts />
      <WhyChooseUs />
      <Showcase />
      <Reviews />
      <FAQ />
      <FinalCTA />
    </>
  );
}

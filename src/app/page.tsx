import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { LandingNavbar } from "@/components/navbar/landing-nav";
import { StatsSection } from "@/components/landing/stats-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { LocationSection } from "@/components/landing/location-section";
import { PackagesOverviewSection } from "@/components/landing/package-overview-section";

export default async function HomePage() {
  return (
    <>
      <LandingNavbar />
      <main className="px-4 md:px-14">
        <div className="border-r border-l border-dashed px-2">
          <HeroSection />
          <FeaturesSection />
          <StatsSection />
          <PackagesOverviewSection />
          <LocationSection />
        </div>
      </main>
      <Footer />
    </>
  );
}

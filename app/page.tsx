import Hero from "@/components/home/Hero"
import GoPro from "@/components/home/GoPro"
import HowItWorks from "@/components/home/HowItWorks"
import WhoIsItFor from "@/components/home/WhoIsItFor"
import ServicesOverview from "@/components/home/ServicesOverview"
import Curriculum from "@/components/home/Curriculum"
import FeaturedWork from "@/components/home/FeaturedWork"
import StudentResults from "@/components/home/StudentResults"
import Testimonials from "@/components/home/Testimonials"
import Pricing from "@/components/home/Pricing"
import LeadCapture from "@/components/home/LeadCapture"
import UrgencyCohort from "@/components/home/UrgencyCohort"
import FounderStory from "@/components/home/FounderStory"
import Community from "@/components/home/Community"
import TrustedLogosSlider from "@/components/home/TrustedLogosSlider"
import FinalCTA from "@/components/home/FinalCTA"

export default function HomePage() {
  return (
    <main>
      {/* 1️⃣  Hero — "Become a Pro in 8 Weeks" + guide download */}
      <Hero />

      {/* 2️⃣  Go Pro Program — flagship product hook */}
      <GoPro />

      {/* 3️⃣  How It Works — 5-step visual process */}
      <HowItWorks />

      {/* 4️⃣  Who It's For / Not For — lead qualification */}
      <WhoIsItFor />

      {/* 5️⃣  Services — Creatives / Brands */}
      <ServicesOverview />

      {/* 6️⃣  Curriculum — 8-week breakdown */}
      <Curriculum />

      {/* 7️⃣  Portfolio Videos — proof of work */}
      <FeaturedWork />

      {/* 8️⃣  Student Results — income + career stories */}
      <StudentResults />

      {/* 9️⃣  Testimonials — result-based quotes */}
      <Testimonials />

      {/* 🔟  Pricing — value-stacked */}
      <Pricing />

      {/* 1️⃣1️⃣  Lead Capture — free training magnet */}
      <LeadCapture />

      {/* 1️⃣2️⃣  Urgency — cohort + social proof stats */}
      <UrgencyCohort />

      {/* 1️⃣3️⃣  Founder Story — trust builder */}
      <FounderStory />

      {/* 1️⃣4️⃣  Community — ÀGBÀ Creators */}
      <Community />

      {/* 1️⃣5️⃣  Trusted Brands */}
      <TrustedLogosSlider />

      {/* 1️⃣6️⃣  Final CTA */}
      <FinalCTA />
    </main>
  )
}

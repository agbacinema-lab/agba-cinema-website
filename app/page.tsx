import Hero from "@/components/home/Hero"
import GoPro from "@/components/home/GoPro"
import ServicesOverview from "@/components/home/ServicesOverview"
import FeaturedWork from "@/components/home/FeaturedWork"
import Testimonials from "@/components/home/Testimonials"
import Pricing from "@/components/home/Pricing"
import LeadCapture from "@/components/home/LeadCapture"
import FounderStory from "@/components/home/FounderStory"
import UrgencyCohort from "@/components/home/UrgencyCohort"
import FinalCTA from "@/components/home/FinalCTA"
import TrustedLogosSlider from "@/components/home/TrustedLogosSlider"

export default function HomePage() {
  return (
    <main>
      {/* 1️⃣ Hero */}
      <Hero />

      {/* 2️⃣ Go Pro Program — main product hook */}
      <GoPro />

      {/* 3️⃣ Services — Creatives / Brands */}
      <ServicesOverview />

      {/* 4️⃣ Portfolio Videos */}
      <FeaturedWork />

      {/* 5️⃣ Testimonials with results */}
      <Testimonials />

      {/* 6️⃣ Pricing */}
      <Pricing />

      {/* 7️⃣ Lead Capture — free training magnet */}
      <LeadCapture />

      {/* 8️⃣ Urgency — cohort enrollment */}
      <UrgencyCohort />

      {/* 9️⃣ Founder Story */}
      <FounderStory />

      {/* 🔟 Trusted Brands */}
      <TrustedLogosSlider />

      {/* 1️⃣1️⃣ Final CTA */}
      <FinalCTA />
    </main>
  )
}

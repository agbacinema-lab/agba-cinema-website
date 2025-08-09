import Hero from "@/components/home/Hero"
import ServicesOverview from "@/components/home/ServicesOverview"
import FeaturedWork from "@/components/home/FeaturedWork"
import Testimonials from "@/components/home/Testimonials"
import TrustedLogosSlider from "@/components/home/TrustedLogosSlider"

export default function HomePage() {
  return (
    <main>
      <Hero />
      <ServicesOverview />
      <FeaturedWork />
      <Testimonials />
      <TrustedLogosSlider />
    </main>
  )
}

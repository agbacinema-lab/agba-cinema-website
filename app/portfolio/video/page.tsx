"use client"

import PageHero from "@/components/common/layout/PageHero"
import PortfolioGrid from "@/components/portfolio/PortfolioGrid"

export default function VideoPortfolioPage() {
  return (
    <div className="min-h-screen bg-black overflow-hidden">
      <PageHero
        title="Work Bank — Video"
        subtitle="Selected video projects showcasing our production and editing capabilities."
        backgroundImage="/cinematic-video-setup.png"
      />

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h3 className="text-3xl font-black text-white mb-8 text-center">Video Projects</h3>
          <PortfolioGrid selectedCategory="Video" />
        </div>
      </section>
    </div>
  )
}

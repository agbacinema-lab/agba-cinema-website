"use client"

import { useState } from "react"
import PageHero from "@/components/common/layout/PageHero"
import PortfolioFilters from "@/components/portfolio/PortfolioFilters"
import PortfolioGrid from "@/components/portfolio/PortfolioGrid"

const categories = ["All", "Documentary", "Motion Graphic", "Short Form", "Event", "Product Launch"]

export default function VideoPortfolioPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      <PageHero
        title="Work Bank — Video"
        subtitle="Selected video projects showcasing our production and editing capabilities."
        backgroundImage="/cinematic-video-setup.png"
      />

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-12 text-center">
            <h3 className="text-3xl font-black text-white mb-8">Video Projects</h3>
            <PortfolioFilters
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              categories={categories}
            />
          </div>
          <PortfolioGrid selectedCategory={selectedCategory} />
        </div>
      </section>
    </div>
  )
}

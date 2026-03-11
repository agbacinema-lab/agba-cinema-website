"use client"

import { useState } from "react"
import PortfolioGrid from "@/components/portfolio/PortfolioGrid"
import PortfolioFilters from "@/components/portfolio/PortfolioFilters"
import PageHero from "@/components/common/layout/PageHero"

export default function PortfolioPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHero 
        title="Our Portfolio"
        subtitle="Explore our collection of cinematic stories and professional video productions."
        backgroundImage="/cinematic-video-setup.png"
      />

      {/* Portfolio Content */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PortfolioFilters 
            selectedCategory={selectedCategory} 
            onCategoryChange={setSelectedCategory} 
          />
          <PortfolioGrid selectedCategory={selectedCategory} />
        </div>
      </section>
    </div>
  )
}

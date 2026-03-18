"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import PortfolioGrid from "@/components/portfolio/PortfolioGrid"
import PortfolioFilters from "@/components/portfolio/PortfolioFilters"
import PageHero from "@/components/common/layout/PageHero"

export default function PortfolioPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      <PageHero 
        title="THE SHOWREEL"
        subtitle="Witness the evolution of cinematic excellence. From commercial high-fashion to gritty street documentaries."
        backgroundImage="/cinematic-video-setup.png"
      />

      {/* Portfolio Content */}
      <section className="py-24 relative">
        {/* Abstract Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-400/5 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8"
          >
            <div className="max-w-2xl">
              <h4 className="text-yellow-400 font-black uppercase tracking-[0.4em] text-xs mb-4">Discovery Engine</h4>
              <h2 className="text-4xl md:text-7xl font-black text-white italic uppercase tracking-tighter leading-none">
                Curated <span className="text-gray-600">Masterpieces</span>
              </h2>
            </div>
            
            <div className="flex-shrink-0">
               <PortfolioFilters 
                selectedCategory={selectedCategory} 
                onCategoryChange={setSelectedCategory} 
              />
            </div>
          </motion.div>

          <PortfolioGrid selectedCategory={selectedCategory} />
        </div>
      </section>

      {/* Narrative Section */}
      <section className="py-32 bg-[#050505] border-t border-white/5">
         <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
            <h3 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter">Your Story. Our Lens.</h3>
            <p className="text-xl text-gray-500 font-medium italic max-w-2xl mx-auto">
              We don't just record images. We architect emotions. Let's build your next visual legacy together.
            </p>
         </div>
      </section>
    </div>
  )
}

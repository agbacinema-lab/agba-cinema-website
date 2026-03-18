"use client"

import { motion } from "framer-motion"

const categories = ["All", "Corporate", "Wedding", "Event", "Documentary", "Church Event", "Product Launch"]

interface PortfolioFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function PortfolioFilters({ selectedCategory, onCategoryChange }: PortfolioFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start">
      {categories.map((category) => (
        <button 
          key={category} 
          onClick={() => onCategoryChange(category)}
          className="relative group py-2"
        >
          <span className={`text-[10px] md:text-sm font-black uppercase italic tracking-[0.2em] transition-all duration-300 relative z-10 px-4 ${
            selectedCategory === category 
              ? "text-black" 
              : "text-gray-500 group-hover:text-white"
          }`}>
            {category}
          </span>
          
          {selectedCategory === category && (
            <motion.div 
              layoutId="portfolioActive"
              className="absolute inset-0 bg-yellow-400 rounded-lg -z-0"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}

          {selectedCategory !== category && (
            <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-yellow-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          )}
        </button>
      ))}
    </div>
  )
}

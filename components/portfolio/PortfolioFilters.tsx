"use client"

import { Button } from "@/components/ui/button"

const categories = ["All", "Corporate", "Wedding", "Event", "Documentary", "Church Event", "Product Launch"]

interface PortfolioFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function PortfolioFilters({ selectedCategory, onCategoryChange }: PortfolioFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-12 justify-center">
      {categories.map((category) => (
        <Button 
          key={category} 
          variant={selectedCategory === category ? "default" : "outline"}
          onClick={() => onCategoryChange(category)}
          className={`rounded-full px-6 transition-all duration-300 ${
            selectedCategory === category 
              ? "bg-yellow-400 text-black border-yellow-400 font-bold" 
              : "hover:border-yellow-400 hover:text-yellow-600"
          }`}
        >
          {category}
        </Button>
      ))}
    </div>
  )
}

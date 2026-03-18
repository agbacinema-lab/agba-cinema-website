"use client"

import { motion } from "framer-motion"
import blog from "@/data/blog.json"

interface CategoryFilterProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export default function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  // Get unique categories from blog posts
  const categories = ["All", ...Array.from(new Set(blog.map((post) => post.category)))]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-gray-100" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Sort by Narrative</h3>
        <div className="h-px flex-1 bg-gray-100" />
      </div>
      
      <div className="flex flex-wrap gap-x-8 gap-y-4 justify-center">
        {categories.map((category) => {
          const count = blog.filter((post) => post.category === category).length
          const isActive = selectedCategory === category

          return (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className="relative group py-2 flex items-center gap-2"
            >
              <span className={`text-xs md:text-sm font-black uppercase italic tracking-[0.2em] transition-all duration-300 relative z-10 ${
                isActive ? "text-black" : "text-gray-400 group-hover:text-black"
              }`}>
                {category}
              </span>
              
              {category !== "All" && (
                <span className={`text-[9px] font-bold transition-colors ${
                  isActive ? "text-yellow-600" : "text-gray-300 group-hover:text-gray-900"
                }`}>
                  ({count})
                </span>
              )}

              {isActive && (
                <motion.div 
                  layoutId="blogCategoryActive"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-400 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

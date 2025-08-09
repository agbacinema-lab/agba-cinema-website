"use client"

import { Button } from "@/components/ui/button"
import blog from "@/data/blog.json"

interface CategoryFilterProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export default function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  // Get unique categories from blog posts
  const categories = ["All", ...Array.from(new Set(blog.map((post) => post.category)))]

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Category</h3>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => onCategoryChange(category)}
            className="hover:bg-primary hover:text-white"
          >
            {category}
            {category !== "All" && (
              <span className="ml-2 bg-white/20 text-xs px-2 py-0.5 rounded-full">
                {blog.filter((post) => post.category === category).length}
              </span>
            )}
          </Button>
        ))}
      </div>
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/button"

const categories = ["All", "Corporate", "Wedding", "Event", "Commercial", "Documentary"]

export default function PortfolioFilters() {
  return (
    <div className="flex flex-wrap gap-2 mb-8 justify-center">
      {categories.map((category) => (
        <Button key={category} variant="outline" className="hover:bg-primary hover:text-white bg-transparent">
          {category}
        </Button>
      ))}
    </div>
  )
}

"use client"

import { useState } from "react"
import BlogList from "@/components/blog/BlogList"
import BlogSearch from "@/components/blog/BlogSearch"
import CategoryFilter from "@/components/blog/CategoryFilter"

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Blog</h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">
            Insights, tips, and stories from the world of video production and cinematography.
          </p>
        </div>
      </section>

      {/* Blog Content */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <BlogSearch />
          <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
          <BlogList selectedCategory={selectedCategory} />
        </div>
      </section>
    </div>
  )
}

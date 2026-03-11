"use client"

import { useState } from "react"
import BlogList from "@/components/blog/BlogList"
import BlogSearch from "@/components/blog/BlogSearch"
import CategoryFilter from "@/components/blog/CategoryFilter"

import PageHero from "@/components/common/layout/PageHero"

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHero 
        title="Our Blog"
        subtitle="Insights, tips, and stories from the world of video production and cinematography."
        backgroundImage="/creative and legal crises.jpg"
      />

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

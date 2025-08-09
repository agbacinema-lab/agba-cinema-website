"use client"

import { useState, useMemo } from "react"
import BlogCard from "./BlogCard"
import { Button } from "@/components/ui/button"
import blog from "@/data/blog.json"

const POSTS_PER_PAGE = 6

interface BlogListProps {
  selectedCategory?: string
}

export default function BlogList({ selectedCategory = "All" }: BlogListProps) {
  const [currentPage, setCurrentPage] = useState(1)

  // Filter posts by category
  const filteredPosts = useMemo(() => {
    if (selectedCategory === "All") {
      return blog
    }
    return blog.filter((post) => post.category === selectedCategory)
  }, [selectedCategory])

  // Calculate pagination
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE
  const endIndex = startIndex + POSTS_PER_PAGE
  const currentPosts = filteredPosts.slice(startIndex, endIndex)

  // Reset to page 1 when category changes
  useMemo(() => {
    setCurrentPage(1)
  }, [selectedCategory])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top of blog list
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div>
      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {currentPosts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>

      {/* No posts message */}
      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No posts found in this category.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button variant="outline" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
            Previous
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => handlePageChange(page)}
              className="w-10 h-10"
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Results info */}
      <div className="text-center mt-6 text-gray-500">
        Showing {startIndex + 1}-{Math.min(endIndex, filteredPosts.length)} of {filteredPosts.length} posts
        {selectedCategory !== "All" && ` in "${selectedCategory}"`}
      </div>
    </div>
  )
}

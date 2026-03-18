"use client"

import { useState, useMemo, useEffect } from "react"
import BlogCard from "./BlogCard"
import { Button } from "@/components/ui/button"
import { blogService, BlogPost } from "@/lib/services"
import { motion, AnimatePresence } from "framer-motion"

const POSTS_PER_PAGE = 6

interface BlogListProps {
  selectedCategory?: string
}

export default function BlogList({ selectedCategory = "All" }: BlogListProps) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    blogService.getAllPosts().then(data => {
      setPosts(data)
      setLoading(false)
    })
  }, [])

  // Filter posts by category
  const filteredPosts = useMemo(() => {
    if (selectedCategory === "All") {
      return posts
    }
    return posts.filter((post) => post.category === selectedCategory)
  }, [posts, selectedCategory])

  // Calculate pagination
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE
  const endIndex = startIndex + POSTS_PER_PAGE
  const currentPosts = filteredPosts.slice(startIndex, endIndex)

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 400, behavior: "smooth" })
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <div className="space-y-16">
      {/* Posts Grid */}
      {loading ? (
        <div className="flex justify-center py-40">
           <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12"
          >
            <AnimatePresence mode="popLayout">
              {currentPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </AnimatePresence>
          </motion.div>

          {/* No posts message */}
          {filteredPosts.length === 0 && (
            <div className="text-center py-32 bg-gray-50 rounded-[3rem]">
              <p className="text-gray-400 text-xl font-black italic uppercase tracking-tighter">End of the roll. No stories found.</p>
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-8 pt-12 border-t border-gray-100">
          <div className="flex justify-center items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1}
              className="h-14 px-8 border-2 border-gray-100 font-black uppercase tracking-tighter rounded-2xl hover:bg-black hover:text-white transition-all disabled:opacity-30"
            >
              Back
            </Button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => handlePageChange(page)}
                  className={`w-14 h-14 rounded-2xl font-black transition-all ${
                    currentPage === page 
                    ? "bg-yellow-400 text-black border-yellow-400 shadow-xl shadow-yellow-400/20" 
                    : "border-2 border-gray-100 text-gray-400 hover:border-black hover:text-black"
                  }`}
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-14 px-8 border-2 border-gray-100 font-black uppercase tracking-tighter rounded-2xl hover:bg-black hover:text-white transition-all disabled:opacity-30"
            >
              Next
            </Button>
          </div>
          
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">
            Frame {startIndex + 1} — {Math.min(endIndex, filteredPosts.length)} of {filteredPosts.length} Stories
          </div>
        </div>
      )}
    </div>
  )
}

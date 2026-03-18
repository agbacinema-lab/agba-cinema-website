"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import BlogList from "@/components/blog/BlogList"
import BlogSearch from "@/components/blog/BlogSearch"
import CategoryFilter from "@/components/blog/CategoryFilter"
import PageHero from "@/components/common/layout/PageHero"

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")

  return (
    <div className="min-h-screen bg-white">
      <PageHero 
        title="THE EDITORIAL"
        subtitle="Deep dives into the psychology of cinematography, the future of AI editing, and our creative journey."
        backgroundImage="/creative and legal crises.jpg"
      />

      {/* Blog Content */}
      <section className="py-24 relative overflow-hidden">
        {/* Decorative Grid or Elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:40px_40px] opacity-20 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col space-y-16">
            
            {/* Newsletter / Minimal Header */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 border-b border-gray-100 pb-16"
            >
              <div className="max-w-2xl space-y-4">
                <h4 className="text-yellow-600 font-black uppercase tracking-[0.4em] text-xs">Knowledge Base</h4>
                <h2 className="text-5xl md:text-8xl font-black text-black italic uppercase tracking-tighter leading-[0.85]">
                  Cinematic <br />
                  <span className="text-gray-200">Intelligence</span>
                </h2>
              </div>
              
              <div className="w-full md:w-auto space-y-6">
                 <div className="glass-morphism bg-gray-50 p-2 rounded-2xl border border-gray-100 flex items-center">
                    <BlogSearch />
                 </div>
                 <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
              </div>
            </motion.div>

            <BlogList selectedCategory={selectedCategory} />
          </div>
        </div>
      </section>

      {/* Subscription Section */}
      <section className="py-32 bg-black text-white">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-12">
             <div className="space-y-4">
               <h3 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">Stay in the Frame</h3>
               <p className="text-xl text-gray-400 font-medium italic">Get the latest insights delivered directly to your creative consciousness.</p>
             </div>
             
             <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <input 
                  type="email" 
                  placeholder="Your cinematic email..." 
                  className="flex-1 bg-white/5 border border-white/10 h-16 px-6 rounded-2xl outline-none focus:border-yellow-400 transition-colors font-bold"
                />
                <button className="h-16 px-10 bg-yellow-400 text-black font-black uppercase italic tracking-tighter text-lg rounded-2xl hover:bg-white transition-all">
                  Subscribe
                </button>
             </div>
          </div>
      </section>
    </div>
  )
}

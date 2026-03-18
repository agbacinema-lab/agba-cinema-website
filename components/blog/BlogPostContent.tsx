"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Tag, ArrowLeft, Share2, Bookmark, Flame, Zap, Play } from "lucide-react"
import { BlogPost } from "@/lib/services"
import { motion, AnimatePresence } from "framer-motion"

interface BlogPostContentProps {
  initialPost: BlogPost | null
  slug: string
}

export function BlogPostContent({ initialPost, slug }: BlogPostContentProps) {
  const [post, setPost] = useState<BlogPost | null>(initialPost)
  const [loading, setLoading] = useState(!initialPost)

  useEffect(() => {
    if (initialPost) {
      setPost(initialPost)
      setLoading(false)
    }
  }, [initialPost])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white font-black italic uppercase tracking-tighter text-4xl">Signal Lost // 404</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Cinematic Hero */}
      <section className="relative min-h-[80vh] flex items-center justify-center bg-black overflow-hidden pt-20">
        <div className="absolute inset-0 z-0 opacity-40">
           <Image 
             src={post.image || "/placeholder.svg"} 
             alt={post.title}
             fill
             className="object-cover grayscale"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>

        {/* Moving Grain Overlay */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center space-y-8">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="flex justify-center"
           >
              <Link href="/blog">
                <button className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em] text-yellow-400 hover:bg-yellow-400 hover:text-black transition-all">
                  <ArrowLeft className="h-3 w-3" /> Back to Intelligence
                </button>
              </Link>
           </motion.div>

           <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.2 }}
             className="space-y-4"
           >
              <div className="flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
                <span className="flex items-center gap-2"><Calendar className="h-3 w-3" /> {new Date(post.publishedAt).toLocaleDateString()}</span>
                <span className="w-1 h-1 bg-gray-700 rounded-full" />
                <span className="flex items-center gap-2"><Clock className="h-3 w-3" /> {post.readTime} Deployment</span>
              </div>
              <h1 className="text-5xl md:text-8xl font-black text-white italic uppercase tracking-tighter leading-[0.85]">
                {post.title}
              </h1>
           </motion.div>

           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.4 }}
             className="flex flex-wrap justify-center gap-4"
           >
              <span className="bg-yellow-400 text-black px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest italic group overflow-hidden relative">
                <span className="relative z-10 flex items-center gap-2">
                  <Flame className="h-3 w-3 fill-black" />
                  {post.category}
                </span>
              </span>
           </motion.div>
        </div>
      </section>

      {/* Main Narrative Content */}
      <article className="py-32 relative">
         <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-black to-white" />
         
         <div className="max-w-4xl mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-[3rem] p-10 md:p-20 shadow-premium border border-gray-100"
            >
               {/* Lead Paragraph */}
               <div className="mb-16">
                  <p className="text-2xl md:text-3xl font-black italic tracking-tight text-black leading-snug border-l-8 border-yellow-400 pl-8">
                     {post.excerpt}
                  </p>
               </div>

               {/* Detailed Narrative */}
               <div className="prose prose-2xl prose-gray max-w-none">
                  {post.content.split("\n\n").map((paragraph, index) => {
                    if (paragraph.startsWith("## ")) {
                      return (
                        <h2 key={index} className="text-4xl font-black text-black italic uppercase tracking-tighter mt-16 mb-8 border-b border-gray-100 pb-4">
                          {paragraph.replace("## ", "")}
                        </h2>
                      )
                    }
                    if (paragraph.startsWith("> ")) {
                       return (
                         <div key={index} className="bg-gray-50 p-10 rounded-[2rem] border-r-4 border-black mb-8">
                            <p className="text-xl font-medium italic text-gray-700 m-0">
                               {paragraph.replace("> ", "")}
                            </p>
                         </div>
                       )
                    }
                    return (
                      <p key={index} className="text-xl text-gray-600 leading-relaxed font-medium italic mb-8">
                        {paragraph}
                      </p>
                    )
                  })}
               </div>

               {/* Classification Tags */}
               <div className="mt-20 pt-10 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="flex flex-wrap gap-3">
                    {post.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                         #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                     <button className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm">
                        <Share2 className="h-4 w-4" />
                     </button>
                     <button className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center hover:bg-yellow-400 hover:text-black transition-all shadow-sm">
                        <Bookmark className="h-4 w-4" />
                     </button>
                  </div>
               </div>
            </motion.div>

            {/* Author Unit */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-12 bg-black rounded-[2.5rem] p-12 text-white flex flex-col md:flex-row items-center gap-10 border border-white/5 shadow-2xl"
            >
               <div className="w-24 h-24 bg-yellow-400 rounded-[2rem] flex items-center justify-center text-4xl group hover:rotate-12 transition-transform duration-500">
                  🎬
               </div>
               <div className="flex-1 space-y-2 text-center md:text-left">
                  <h4 className="text-yellow-400 font-black uppercase tracking-[0.4em] text-[10px]">Intelligence Source</h4>
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter">{post.author}</h3>
                  <p className="text-gray-400 font-medium italic leading-relaxed">
                     Architecting visual narratives at ÀGBÀ CINEMA. Transforming raw concepts into cinematic excellence through decades of visual engineering.
                  </p>
               </div>
            </motion.div>
         </div>
      </article>

      {/* Global Deployment CTA */}
      <section className="py-40 bg-yellow-400 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-black opacity-[0.03] -translate-x-32 translate-y-20 rounded-full" />
         <div className="max-w-4xl mx-auto px-4 text-center space-y-12 relative z-10">
            <h2 className="text-5xl md:text-8xl font-black text-black italic uppercase tracking-tighter leading-none">
               Architect Your <br /> Own Legacy.
            </h2>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
               <button className="h-20 px-12 bg-black text-white font-black uppercase italic tracking-tighter text-xl rounded-3xl hover:scale-105 transition-all shadow-2xl flex items-center gap-4">
                  Deploy Project <Play className="h-5 w-5 fill-current" />
               </button>
               <button className="h-20 px-12 bg-transparent border-4 border-black text-black font-black uppercase italic tracking-tighter text-xl rounded-3xl hover:bg-black hover:text-yellow-400 transition-all flex items-center gap-4">
                  View Roster <Zap className="h-5 w-5 fill-current" />
               </button>
            </div>
         </div>
      </section>
    </div>
  )
}

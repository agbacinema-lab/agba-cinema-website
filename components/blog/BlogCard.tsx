"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Calendar, Clock, Tag, ArrowRight, User } from "lucide-react"
import Link from "next/link"

interface BlogPost {
  id: string | number
  title: string
  slug: string
  excerpt: string
  author: string
  publishedAt: string
  image: string
  tags: string[]
  category: string
  readTime: string
}

interface BlogCardProps {
  post: BlogPost
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group flex flex-col bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 hover:border-black transition-all duration-500 hover:shadow-premium"
    >
      {/* Editorial Cover */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={post.image ? (post.image.startsWith('http') || post.image.startsWith('/') ? post.image : `/${post.image}`) : "/creative and legal crises.jpg"}
          alt={post.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-1000 grayscale-[30%] group-hover:grayscale-0"
        />
        
        {/* Category Badge */}
        <div className="absolute top-6 left-6">
          <span className="glass-morphism bg-black border border-white/20 text-yellow-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl">
            {post.category}
          </span>
        </div>

        {/* Read Time Overlay */}
        <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-white/90 backdrop-blur-md text-black px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-lg">
          <Clock className="h-3.5 w-3.5" />
          {post.readTime}
        </div>
      </div>

      {/* Narrative Content */}
      <div className="p-8 lg:p-10 flex-1 flex flex-col space-y-6">
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
            <span className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(post.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="w-1 h-1 bg-gray-200 rounded-full" />
            <span className="flex items-center gap-2">
              <User className="h-3.5 w-3.5" />
              {post.author}
            </span>
          </div>

          <Link href={`/blog/${post.slug}`}>
            <h3 className="text-2xl lg:text-3xl font-black text-black italic uppercase tracking-tighter leading-[1.1] group-hover:text-yellow-600 transition-colors duration-300">
              {post.title}
            </h3>
          </Link>

          <p className="text-gray-500 font-medium leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>
        </div>

        {/* Footer Interaction */}
        <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
          <div className="flex gap-2">
            {post.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[9px] font-black uppercase tracking-widest text-gray-300">
                #{tag}
              </span>
            ))}
          </div>
          
          <Link 
            href={`/blog/${post.slug}`}
            className="group/link flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-gray-50 hover:bg-black hover:text-white px-5 py-3 rounded-xl transition-all"
          >
            Read Chapter
            <ArrowRight className="h-3.5 w-3.5 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

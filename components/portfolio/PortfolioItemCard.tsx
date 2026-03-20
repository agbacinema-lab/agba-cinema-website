"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Clock, ArrowRight, User, ExternalLink } from "lucide-react"
import Image from "next/image"

interface PortfolioItem {
  id: string | number
  title: string
  slug: string
  category: string
  client: string
  description: string
  image: string
  duration: string
  year: number
  href?: string
  youtubeEmbedUrl: string
}

interface PortfolioItemCardProps {
  item: PortfolioItem
}

export default function PortfolioItemCard({ item }: PortfolioItemCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-[#0a0a0a] rounded-[2rem] overflow-hidden border border-white/5 hover:border-yellow-400/50 transition-all duration-500 shadow-2xl shadow-black"
    >
      {/* Video/Image Section */}
      <div className="relative aspect-video overflow-hidden">
        {isPlaying ? (
          <iframe
            width="100%"
            height="100%"
            src={`${item.youtubeEmbedUrl}${item.youtubeEmbedUrl.includes('?') ? '&' : '?'}autoplay=1`}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        ) : (
          <>
            <Image
              src={item.image ? (item.image.startsWith('http') || item.image.startsWith('/') ? item.image : `/${item.image}`) : "/agba cinema black.jpg"}
              alt={item.title}
              fill
              className="object-cover group-hover:scale-110 group-hover:rotate-1 transition-all duration-1000 grayscale-[20%] group-hover:grayscale-0"
            />
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

            {/* Play Button */}
            <div
              onClick={() => setIsPlaying(true)}
              className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
            >
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-2xl scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500">
                <Play className="h-6 w-6 text-black fill-black ml-1" />
              </div>
            </div>

            {/* Float Labels */}
            <div className="absolute top-6 left-6 flex gap-2">
              <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                {item.category}
              </span>
            </div>

            <div className="absolute bottom-6 right-6 bg-yellow-400 text-black px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center shadow-lg">
              <Clock className="h-3 w-3 mr-1.5" />
              {item.duration}
            </div>
          </>
        )}
      </div>

      {/* Content Section */}
      <div className="p-8 space-y-4 relative">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
            <User className="h-3 w-3 text-yellow-500" />
            <span>Client: {item.client}</span>
          </div>
          <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter group-hover:text-yellow-400 transition-colors duration-300">
            {item.title}
          </h3>
        </div>

        <p className="text-gray-400 font-medium text-sm leading-relaxed line-clamp-2">
          {item.description}
        </p>

        <div className="pt-4 flex items-center justify-between">
           <div className="h-px flex-1 bg-white/5 mr-4" />
           <button 
             onClick={() => setIsPlaying(true)}
             className="text-white hover:text-yellow-400 transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
            >
             View Work <ExternalLink className="h-3 w-3" />
           </button>
        </div>
      </div>

      {/* Interactive Glint Effect */}
      <div className="absolute -inset-x-full top-0 h-full w-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg] group-hover:animate-shimmer pointer-events-none" />
    </motion.div>
  )
}

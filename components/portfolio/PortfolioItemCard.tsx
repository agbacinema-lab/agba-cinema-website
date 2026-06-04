"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Play, Clock, User, ExternalLink } from "lucide-react"
import Image from "next/image"
import { getDirectDriveUrl } from "@/lib/utils"

interface PortfolioItem {
  id: string | number
  title: string
  slug: string
  category?: string
  client?: string
  description?: string
  image?: string
  duration?: string
  year?: number
  href?: string
  youtubeEmbedUrl?: string
  videoUrl?: string
  video?: string
  embedUrl?: string
  youtubeUrl?: string
  assetLink?: string
  driveLink?: string
  externalLink?: string
  url?: string
  link?: string
  portfolioSection?: string
  section?: string
}

interface PortfolioItemCardProps {
  item: PortfolioItem
}

export default function PortfolioItemCard({ item }: PortfolioItemCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const videoUrl = item.youtubeEmbedUrl || item.videoUrl || item.video || item.embedUrl || item.youtubeUrl
  const assetUrl = item.assetLink || item.driveLink || item.externalLink || item.url || item.link

  const normalizeImageSrc = (src?: string) => {
    if (!src) return src
    const trimmed = src.trim()
    if (/^(https?:\/\/|\/)/i.test(trimmed)) {
      return trimmed
    }
    return `/${trimmed}`
  }
  
  // Resolve image URL; use server-side proxy for Drive/docs hosts to avoid CORS/Next/Image host restrictions
  const rawImage = item.image
  let imageSrc = rawImage
    ? getDirectDriveUrl(normalizeImageSrc(rawImage))
    : "/agba cinema black.jpg"

  try {
    const parsed = new URL(imageSrc)
    const driveHosts = ['drive.google.com', 'docs.google.com']
    if (driveHosts.includes(parsed.hostname)) {
      imageSrc = `/api/image-proxy?url=${encodeURIComponent(imageSrc)}`
    }
  } catch (e) {
    // ignore URL parse errors and keep imageSrc as-is
  }

  const hasVideo = Boolean(videoUrl)
  const hasAssetLink = Boolean(assetUrl)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-[#0a0a0a] rounded-[2rem] overflow-hidden border border-white/5 hover:border-yellow-400/50 transition-all duration-500 shadow-2xl shadow-black"
    >
      {/* Video/Image Section */}
      <div className="relative aspect-video overflow-hidden">
        {isPlaying && videoUrl ? (
          <iframe
            width="100%"
            height="100%"
            src={`${videoUrl}${videoUrl.includes('?') ? '&' : '?'}autoplay=1`}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        ) : (
          <>
            <Image
              src={imageSrc}
              alt={item.title}
              fill
              className="object-cover group-hover:scale-110 group-hover:rotate-1 transition-all duration-1000 grayscale-[20%] group-hover:grayscale-0"
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

            {/* Play / Open Button */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 ${hasVideo ? 'bg-yellow-400' : 'bg-white/10'}`}>
                {hasVideo ? (
                  <Play className="h-6 w-6 text-black fill-black ml-1" />
                ) : (
                  <ExternalLink className="h-6 w-6 text-white" />
                )}
              </div>
            </div>

            {hasVideo && (
              <button
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 cursor-pointer z-20"
                aria-label="Play video"
              />
            )}

            {!hasVideo && hasAssetLink && (
              <a
                href={assetUrl}
                target="_blank"
                rel="noreferrer"
                className="absolute inset-0 cursor-pointer z-20"
                aria-label="Open asset link"
              />
            )}

            {/* Float Labels */}
            <div className="absolute top-6 left-6 flex gap-2">
              {item.category && (
                <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                  {item.category}
                </span>
              )}
              {item.portfolioSection && (
                <span className="bg-black text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                  {item.portfolioSection}
                </span>
              )}
            </div>

            {item.duration && (
              <div className="absolute bottom-6 right-6 bg-yellow-400 text-black px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center shadow-lg">
                <Clock className="h-3 w-3 mr-1.5" />
                {item.duration}
              </div>
            )}
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
           {hasVideo ? (
             <button 
               onClick={() => setIsPlaying(true)}
               className="text-white hover:text-yellow-400 transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
             >
               View Work <ExternalLink className="h-3 w-3" />
             </button>
           ) : hasAssetLink ? (
             <a
               href={assetUrl}
               target="_blank"
               rel="noreferrer"
               className="text-white hover:text-yellow-400 transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
             >
               View Work <ExternalLink className="h-3 w-3" />
             </a>
           ) : (
             <span className="text-gray-500 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
               No preview available
             </span>
           )}
        </div>
      </div>

      {/* Interactive Glint Effect */}
      <div className="absolute -inset-x-full top-0 h-full w-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg] group-hover:animate-shimmer pointer-events-none" />
    </motion.div>
  )
}

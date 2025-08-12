"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Play } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
type Project = {
  id: string
  title: string
  category: string
  image: string
  href: string
  youtubeEmbedUrl: string
}

const YOUTUBE_VIDEO_IDS = [
  {
    id: "1",
    videoId: "IimlCWz9bdY",
    title: "Corporate Brand Story",
    category: "Corporate",
    image: "/corporate-video-production.png",
    href: "/portfolio/corporate-brand-story",
  },
  {
    id: "2",
    videoId: "Idk8Z5QA65E",
    title: "Youtube Series",
    category: "History",
    href: "/portfolio/elegant-wedding-film",
  },
  {
    id: "3",
    videoId: "G_fGfa-1tZY",
    title: "Product Launch Event",
    category: "Product",
    image: "/event-videography-coverage.png",
    href: "/portfolio/product-launch-event",
  },
]

const getYoutubeThumbnail = (videoId: string) =>
  `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`

const getYoutubeEmbedUrl = (videoId: string) =>
  `https://www.youtube.com/embed/${videoId}`

const featuredProjects: Project[] = YOUTUBE_VIDEO_IDS.map((item) => ({
  id: item.id,
  title: item.title,
  category: item.category,
  image: getYoutubeThumbnail(item.videoId),
  href: item.href,
  youtubeEmbedUrl: getYoutubeEmbedUrl(item.videoId),
}))

export default function FeaturedWork() {
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Work</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore some of our recent projects that showcase our commitment to excellence and creative storytelling.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="relative overflow-hidden">
                  {playingVideo === project.id ? (
                    <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden">
                      <iframe
                        src={project.youtubeEmbedUrl + "?autoplay=1"}
                        title={project.title}
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        className="w-full h-64"
                      />
                    </div>
                  ) : (
                    <>
                      <Image
                        src={project.image || "/placeholder.svg"}
                        alt={project.title}
                        width={600}
                        height={400}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        type="button"
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                        onClick={() => setPlayingVideo(project.id)}
                        aria-label={`Play ${project.title}`}
                      >
                        <Play className="h-12 w-12 text-white" />
                      </button>
                      <div className="absolute top-4 left-4">
                        <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                          {project.category}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h3>
                  <Button variant="outline" asChild>
                    <Link href={project.href}>View Project</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button size="lg" asChild>
            <Link href="/portfolio">View Full Portfolio</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

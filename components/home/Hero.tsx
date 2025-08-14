"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Play, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      {/* Background Video/Image Placeholder */}
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/cinematic-video-setup.png')",
        }}
      ></div>

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Cinematic Stories
            <br />
          <span className="text-yellow-400">Beautifully Told</span>
          </h1>

          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-200">
            Professional video production, training, and consultancy that bring your vision to life. From corporate videos to weddings, we craft visual stories that captivate, inspire, and equip you for success.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" asChild className="text-lg px-8 py-4">
              <Link href="/portfolio">
                <Play className="mr-2 h-5 w-5" />
                View Our Work
              </Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-lg px-8 py-4 bg-transparent border-white text-white hover:bg-white hover:text-black"
            >
              <Link href="/contact">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-bounce"></div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Users, Building2, Award } from "lucide-react"
import { motion } from "framer-motion"

const stats = [
  { icon: Users, value: "200+", label: "Creatives Trained" },
  { icon: Building2, value: "50+", label: "Brands Served" },
  { icon: Award, value: "5+", label: "Years Experience" },
]

export default function FounderStory() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Image side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5] max-w-md mx-auto lg:mx-0 shadow-2xl">
              <Image
                src="/founder-ololade.jpg"
                alt="Ololade Abel — Creative Director at ÀGBÀ CINEMA"
                fill
                className="object-cover"
                onError={(e) => {
                  // Fallback gradient if image not found
                  const target = e.currentTarget as HTMLImageElement
                  target.style.display = "none"
                }}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              {/* Name tag */}
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white font-bold text-xl">Ololade Abel</p>
                <p className="text-yellow-400 text-sm font-semibold">Creative Director, ÀGBÀ CINEMA</p>
              </div>
            </div>

            {/* Floating stat card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="absolute -bottom-6 -right-4 bg-yellow-400 text-black rounded-2xl px-6 py-4 shadow-xl hidden lg:block"
            >
              <p className="text-3xl font-black">200+</p>
              <p className="text-sm font-semibold">Creatives Trained</p>
            </motion.div>
          </motion.div>

          {/* Story side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <span className="text-yellow-600 text-sm font-bold uppercase tracking-widest block mb-4">Meet the Founder</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              The Story Behind<br />
              <span className="text-yellow-500">ÀGBÀ CINEMA</span>
            </h2>

            <div className="space-y-4 text-gray-600 text-lg leading-relaxed mb-8">
              <p>
                <strong className="text-gray-900">Ololade Abel</strong> started ÀGBÀ CINEMA with one goal: to make world-class video training accessible to every creative in Nigeria — not just those who can afford to travel abroad for it.
              </p>
              <p>
                After seeing countless talented editors get overlooked because they lacked structured training and real portfolio work, he built the <strong className="text-gray-900">Go Pro Program</strong> — a pathway from beginner to brand-ready in weeks.
              </p>
              <p>
                Today, ÀGBÀ CINEMA has trained <strong className="text-gray-900">200+ creatives</strong>, produced content for <strong className="text-gray-900">50+ Nigerian brands</strong>, and built one of Lagos's most trusted video production studios.
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <stat.icon className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              asChild
              className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-8 py-6 rounded-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <Link href="/about">
                Read the Full Story
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

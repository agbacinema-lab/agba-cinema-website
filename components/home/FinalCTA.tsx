"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, PhoneCall } from "lucide-react"
import { motion } from "framer-motion"

export default function FinalCTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-yellow-400 via-yellow-300 to-orange-300 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-black text-black mb-6 leading-tight">
            Ready to Start Your<br />
            Creative Journey?
          </h2>
          <p className="text-xl text-black/70 mb-12 max-w-2xl mx-auto">
            Whether you want to <strong className="text-black">learn filmmaking, writing, social media, digital marketing</strong>, or hire Nigeria&apos;s best creative team — we’re one click away.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                asChild
                className="bg-black hover:bg-gray-900 text-white font-bold text-lg px-10 py-7 rounded-xl transition-all duration-300 hover:scale-[1.03] shadow-xl"
              >
                <a href="/academy">
                  Apply for the Academy
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>

              <Button
                size="lg"
                variant="outline"
                asChild
                className="bg-white/30 hover:bg-white/50 border-black/30 text-black font-bold text-lg px-10 py-7 rounded-xl transition-all duration-300 hover:scale-[1.03] backdrop-blur-sm"
              >
                <a href="/services">
                  Hire Our Editors
                  <PhoneCall className="ml-2 h-5 w-5" />
                </a>
              </Button>
          </div>

          <p className="text-black/50 text-sm mt-8">
            No commitment. Free 15-minute consultation. Available Monday – Saturday.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

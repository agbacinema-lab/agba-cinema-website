"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { CheckCircle2, ArrowRight, Clapperboard } from "lucide-react"

const features = [
  "Structured video editing training (Premiere Pro + After Effects)",
  "Real brand projects you can add to your portfolio",
  "Internship placement with top Nigerian brands",
  "1-on-1 mentorship from working professionals",
  "Portfolio development & career guidance",
]

const steps = [
  { step: "01", label: "Learn Editing" },
  { step: "02", label: "Work on Real Brands" },
  { step: "03", label: "Get Internship" },
  { step: "04", label: "Build Portfolio" },
]

export default function GoPro() {
  return (
    <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="flex justify-center mb-6"
        >
          <span className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-sm font-semibold px-4 py-2 rounded-full">
            <Clapperboard className="h-4 w-4" />
            Our Flagship Program
          </span>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Become a{" "}
            <span className="text-yellow-400">Professional</span>
            <br />
            Video Editor
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our <strong className="text-white">Go Pro Program</strong> trains beginners and places them into real brand internships — so your career starts before you even graduate.
          </p>
        </motion.div>

        {/* Journey steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center items-center gap-3 md:gap-0 mb-16"
        >
          {steps.map((item, i) => (
            <div key={item.step} className="flex items-center">
              <div className="flex flex-col items-center">
                <span className="text-yellow-400 text-xs font-bold tracking-widest mb-1">{item.step}</span>
                <span className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap">
                  {item.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight className="h-5 w-5 text-yellow-400 mx-3 flex-shrink-0 hidden md:block" />
              )}
            </div>
          ))}
        </motion.div>

        {/* Features + CTA grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Feature list */}
          <motion.ul
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {features.map((feat) => (
              <li key={feat} className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-200 text-lg">{feat}</span>
              </li>
            ))}
          </motion.ul>

          {/* CTA card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm"
          >
            <div className="mb-2">
              <span className="text-yellow-400 text-sm font-bold uppercase tracking-wider">Next Cohort — April 2026</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Ready to go from beginner to Pro?
            </h3>
            <p className="text-gray-300 mb-6">
              Limited spots available. Applications are reviewed on a first-come, first-served basis.
            </p>
            <div className="flex items-center gap-3 mb-8 bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-4 py-3">
              <span className="text-yellow-400 font-bold text-lg">⚡</span>
              <span className="text-yellow-300 font-semibold text-sm">Only <strong>3 slots</strong> remaining for this cohort</span>
            </div>
            <Button
              size="lg"
              asChild
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-lg py-6 rounded-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <Link href="/academy">
                Apply for the Next Cohort
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <p className="text-center text-gray-400 text-sm mt-4">Free consultation call included</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

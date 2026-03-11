"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, ClipboardList, Monitor, Briefcase, Building2, FolderOpen } from "lucide-react"
import { motion } from "framer-motion"

const steps = [
  {
    number: "01",
    icon: ClipboardList,
    title: "Apply for Mentorship",
    description: "Fill out a short application form. We review within 48 hours and schedule your free consultation call.",
    color: "from-yellow-400 to-amber-400",
  },
  {
    number: "02",
    icon: Monitor,
    title: "Learn Premiere Pro & After Effects",
    description: "Follow a structured 8-week curriculum taught by working professionals. Learn industry workflows from day one.",
    color: "from-orange-400 to-red-400",
  },
  {
    number: "03",
    icon: Briefcase,
    title: "Work on Real Brand Projects",
    description: "Get assigned to actual client campaigns — not dummy exercises. Build real deliverables brands pay for.",
    color: "from-purple-400 to-pink-400",
  },
  {
    number: "04",
    icon: Building2,
    title: "Get Internship Placement",
    description: "Top students are connected to our network of 50+ partner brands for paid internship opportunities.",
    color: "from-blue-400 to-cyan-400",
  },
  {
    number: "05",
    icon: FolderOpen,
    title: "Build Portfolio + Get Career Guidance",
    description: "Leave with a professional portfolio, a CV ready for agencies, and ongoing career support from our community.",
    color: "from-green-400 to-emerald-400",
  },
]

export default function HowItWorks() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-yellow-600 text-sm font-bold uppercase tracking-widest block mb-3">The Process</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            5 clear steps from zero experience to job-ready editor. No guesswork — just a proven path.
          </p>
        </motion.div>

        {/* Desktop: horizontal connector line */}
        <div className="hidden lg:block relative mb-12">
          <div className="absolute top-8 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-yellow-400 via-purple-400 to-green-400 opacity-30" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              viewport={{ once: true }}
              className="relative flex flex-col items-center text-center group"
            >
              {/* Icon circle */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <step.icon className="h-7 w-7 text-white" />
              </div>

              {/* Step number */}
              <span className="text-xs font-black text-gray-300 tracking-widest mb-2">{step.number}</span>

              <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>

              {/* Arrow between steps (desktop) */}
              {index < steps.length - 1 && (
                <ArrowRight className="hidden lg:block absolute -right-4 top-6 h-5 w-5 text-gray-200" />
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Button
            size="lg"
            asChild
            className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-10 py-6 rounded-xl text-lg transition-all duration-300 hover:scale-[1.02]"
          >
            <a href="/academy">
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

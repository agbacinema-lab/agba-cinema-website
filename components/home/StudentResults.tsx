"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Briefcase, TrendingUp, Star } from "lucide-react"
import { motion } from "framer-motion"

const students = [
  {
    name: "David O.",
    skill: "Video Editing",
    project: "Social Media Campaign",
    brand: "Lagos Fashion Brand",
    result: "Hired by a Lagos agency at ₦150k/month",
    detail: "Went from zero editing knowledge to agency employment in 3 months after the Go Pro Program.",
    emoji: "🎬",
    tag: "Employed",
    tagColor: "bg-green-100 text-green-700",
  },
  {
    name: "Chisom A.",
    skill: "Motion Design",
    project: "Brand Identity Video",
    brand: "Fintech Startup (Lagos)",
    result: "Freelancing at ₦80k – ₦200k per project",
    detail: "Now runs her own motion design studio serving 3 regular clients she found within 6 weeks of graduating.",
    emoji: "✨",
    tag: "Freelancer",
    tagColor: "bg-blue-100 text-blue-700",
  },
  {
    name: "Emmanuel K.",
    skill: "Video Editing",
    project: "Corporate Training Videos",
    brand: "Shuriken Labs",
    result: "Internship → Full-time content role",
    detail: "His brand project during training impressed the client so much they hired him full-time before the program ended.",
    emoji: "🚀",
    tag: "Internship → Full-time",
    tagColor: "bg-yellow-100 text-yellow-700",
  },
  {
    name: "Fatima Y.",
    skill: "Video Editing + Content",
    project: "YouTube Series (4 episodes)",
    brand: "Education Channel (100k+ subs)",
    result: "YouTube editor — ₦60k retainer/month",
    detail: "Built her portfolio during the program, pitched to 3 YouTube creators, and landed a retainer client on her first outreach.",
    emoji: "📺",
    tag: "Retainer Client",
    tagColor: "bg-purple-100 text-purple-700",
  },
  {
    name: "Tolu B.",
    skill: "Cinematography + Editing",
    project: "Product Launch Video",
    brand: "Importa Pay",
    result: "300% engagement on launch video",
    detail: "Produced a product launch video during internship that the client said tripled their social media engagement.",
    emoji: "📈",
    tag: "300% Engagement",
    tagColor: "bg-orange-100 text-orange-700",
  },
  {
    name: "Kola M.",
    skill: "Video Editing",
    project: "Live Event Coverage",
    brand: "Eventify (corporate events)",
    result: "Building his own production company",
    detail: "Used skills from the program to start taking corporate event gigs. Now runs a small production company with 2 staff.",
    emoji: "🏆",
    tag: "Business Owner",
    tagColor: "bg-gray-100 text-gray-700",
  },
]

export default function StudentResults() {
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
          <span className="text-yellow-600 text-sm font-bold uppercase tracking-widest block mb-3">Real Student Results</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Students Don't Just Learn — They Earn</h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Every card below is a real student who went through the Go Pro Program and landed a real result.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {students.map((s, index) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              viewport={{ once: true }}
              className="bg-gray-50 border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center text-2xl flex-shrink-0">
                  {s.emoji}
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${s.tagColor}`}>
                  {s.tag}
                </span>
              </div>

              {/* Name + skill */}
              <h3 className="text-lg font-bold text-gray-900 mb-1">{s.name}</h3>
              <p className="text-sm text-yellow-600 font-semibold mb-3">{s.skill}</p>

              {/* Project & brand */}
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Briefcase className="h-3.5 w-3.5 flex-shrink-0" />
                  <span><strong className="text-gray-700">Project:</strong> {s.project}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Star className="h-3.5 w-3.5 flex-shrink-0" />
                  <span><strong className="text-gray-700">Brand:</strong> {s.brand}</span>
                </div>
              </div>

              {/* Result highlight */}
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-yellow-600" />
                  <span className="text-xs font-bold text-yellow-700 uppercase tracking-wider">Result</span>
                </div>
                <p className="text-sm font-bold text-gray-900">{s.result}</p>
              </div>

              {/* Story */}
              <p className="text-sm text-gray-500 leading-relaxed flex-1 italic">"{s.detail}"</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-gray-500 text-lg mb-6">
            Ready to write your own story? The next cohort starts <strong className="text-gray-900">April 2026.</strong>
          </p>
          <Button
            size="lg"
            asChild
            className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-10 py-6 rounded-xl text-lg transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-yellow-400/20"
          >
            <a href="/apply">
              Apply Now — Join the Next Cohort
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

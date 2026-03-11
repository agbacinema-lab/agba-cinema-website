"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, BookOpen, Palette, Users, Laptop } from "lucide-react"
import { motion } from "framer-motion"

const weeks = [
  { week: "Week 1", title: "Editing Fundamentals", desc: "Interface mastery, timeline workflow, keyboard shortcuts, and professional file organisation.", tag: "Foundation" },
  { week: "Week 2", title: "Story Structure & Pacing", desc: "How to cut for emotion, maintain rhythm, and build narrative arcs that keep viewers engaged.", tag: "Storytelling" },
  { week: "Week 3", title: "Colour Grading", desc: "LUTs, Lumetri Color, skin tones, and creating consistent cinematic looks for any project.", tag: "Visual" },
  { week: "Week 4", title: "Client Workflow", desc: "File hand-off, client feedback rounds, revision management, and professional delivery formats.", tag: "Professional" },
  { week: "Week 5", title: "Motion Graphics & After Effects", desc: "Titles, lower thirds, smooth transitions, and basic motion design using After Effects.", tag: "Motion" },
  { week: "Week 6", title: "Live Brand Project", desc: "Work on a real client campaign assigned by ÀGBÀ CINEMA. Supervised by a professional editor.", tag: "🔥 Live Project" },
  { week: "Week 7", title: "Portfolio Building", desc: "Curate your best work into a professional showreel and build your editing portfolio site.", tag: "Portfolio" },
  { week: "Week 8", title: "Internship Preparation", desc: "Interview prep, agency rates, freelance pricing, and connecting with our brand partner network.", tag: "Career" },
]

const tools = ["Adobe Premiere Pro", "After Effects", "DaVinci Resolve", "Frame.io", "Google Drive Workflow", "Canva Pro"]
const outcomes = ["Professional video editor", "Freelance client ready", "Internship placement eligible", "Portfolio of 3+ projects", "Knowledge of industry workflows"]

export default function Curriculum() {
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
          <span className="text-yellow-600 text-sm font-bold uppercase tracking-widest block mb-3">Program Breakdown</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">What You'll Learn — Week by Week</h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            A structured 8-week curriculum built around real industry workflows — not theory.
          </p>
        </motion.div>

        {/* Curriculum grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {weeks.map((item, index) => (
            <motion.div
              key={item.week}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.07 }}
              viewport={{ once: true }}
              className={`rounded-2xl p-5 border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg
                ${item.tag === "🔥 Live Project"
                  ? "bg-gradient-to-br from-yellow-400 to-orange-400 border-yellow-300 text-black"
                  : "bg-gray-50 border-gray-100 text-gray-900"
                }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-black uppercase tracking-wider ${item.tag === "🔥 Live Project" ? "text-black/60" : "text-gray-400"}`}>
                  {item.week}
                </span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  item.tag === "🔥 Live Project"
                    ? "bg-black/10 text-black"
                    : "bg-white border border-gray-200 text-gray-500"
                }`}>
                  {item.tag}
                </span>
              </div>
              <h3 className={`font-bold text-base mb-2 ${item.tag === "🔥 Live Project" ? "text-black" : "text-gray-900"}`}>
                {item.title}
              </h3>
              <p className={`text-sm leading-relaxed ${item.tag === "🔥 Live Project" ? "text-black/70" : "text-gray-500"}`}>
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Tools + Outcomes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          {/* Tools */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gray-50 rounded-2xl p-8 border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-5">
              <Laptop className="h-6 w-6 text-yellow-500" />
              <h3 className="text-lg font-bold text-gray-900">Tools You'll Master</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {tools.map(tool => (
                <span key={tool} className="bg-white border border-gray-200 text-gray-700 text-sm font-semibold px-3 py-1.5 rounded-lg">
                  {tool}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Outcomes */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-gray-900 rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-5">
              <BookOpen className="h-6 w-6 text-yellow-400" />
              <h3 className="text-lg font-bold text-white">Expected Outcomes</h3>
            </div>
            <ul className="space-y-3">
              {outcomes.map(o => (
                <li key={o} className="flex items-center gap-3">
                  <span className="text-yellow-400 font-black">✓</span>
                  <span className="text-gray-300 text-sm">{o}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button size="lg" asChild className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-10 py-6 rounded-xl text-lg hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-yellow-400/20">
            <a href="/academy">
              Enrol in the Program
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

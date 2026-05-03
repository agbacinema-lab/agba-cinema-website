"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

const forList = [
  "Beginners who want to become professional creatives in any of our 6 tracks",
  "Creators who want to start working with brands professionally",
  "Students looking to build a career in media, writing, or digital marketing",
  "Freelancers who want to level up their skills and command higher rates",
  "Anyone serious about turning creativity into a sustainable income",
]

const notForList = [
  "People looking for a shortcut with zero effort",
  "Those unwilling to practice outside class hours",
  "People who are not ready to commit 8 weeks",
  "Those expecting clients to come without any effort",
]

const careers = [
  "🎬 Filmmaker / Cinematographer",
  "✏️ Creative Writer / Copywriter",
  "📱 Social Media Manager",
  "📊 Digital Marketing Specialist",
  "🎨 Motion Designer / Video Editor",
  "💼 Virtual Assistant",
  "🗂️ Content Creator",
  "▶️ YouTube / Brand Strategist",
]

export default function WhoIsItFor() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-yellow-600 text-sm font-bold uppercase tracking-widest block mb-3">Is This For You?</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Who This Academy Is For</h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            We're selective because we want every student to succeed. Read this carefully before applying.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* THIS IS FOR */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white border-2 border-green-100 rounded-2xl p-8 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">This Program Is <span className="text-green-600">For You</span> If You Are…</h3>
            </div>
            <ul className="space-y-4">
              {forList.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* NOT FOR */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-white border-2 border-red-50 rounded-2xl p-8 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">This Program Is <span className="text-red-500">NOT For You</span> If You are…</h3>
            </div>
            <ul className="space-y-4">
              {notForList.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>

            {/* Career paths */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Career Paths After the Program</p>
              <div className="grid grid-cols-2 gap-2">
                {careers.map((c) => (
                  <span key={c} className="text-sm bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-gray-600 font-medium">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-gray-500 mb-6 text-lg">If you see yourself in the ✔ list, you're ready.</p>
          <Button
            size="lg"
            asChild
            className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-10 py-6 rounded-xl text-lg transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-yellow-400/20"
          >
            <a href="/academy">
              Apply Now — Limited Spots
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

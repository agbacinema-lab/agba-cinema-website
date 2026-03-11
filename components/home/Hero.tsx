"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Download, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"

function GuideModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setLoading(false)
    setDone(true)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl leading-none"
          aria-label="Close"
        >×</button>

        {done ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-4">🎬</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Check Your Inbox!</h3>
            <p className="text-gray-500">The ÀGBÀ CINEMA Program Guide is on its way to <strong>{email}</strong>.</p>
          </div>
        ) : (
          <>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">Download the Program Guide</h3>
            <p className="text-gray-500 text-sm mb-6">Get the full curriculum, pricing, and schedule — free.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                required
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <input
                required
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-6 rounded-xl text-lg"
              >
                {loading ? "Sending…" : "Send Me the Guide →"}
              </Button>
            </form>
            <p className="text-center text-xs text-gray-400 mt-3">No spam. Unsubscribe anytime.</p>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default function Hero() {
  const [guideOpen, setGuideOpen] = useState(false)

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-black/55 z-10 pointer-events-none" />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{ backgroundImage: "url('/cinematic-video-setup.png')" }}
        />
        {/* Radial glow */}
        <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_60%,rgba(250,204,21,0.08),transparent)] pointer-events-none" />

        {/* Content */}
        <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 bg-yellow-400/15 border border-yellow-400/30 text-yellow-400 text-sm font-semibold px-4 py-2 rounded-full mb-6"
            >
              🎓 Nigeria's #1 Video Editing Mentorship
            </motion.div>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight tracking-tight">
              Become a Professional<br />
              <span className="text-yellow-400">Video Editor in 8 Weeks</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-2xl mb-10 max-w-3xl mx-auto text-gray-300 leading-relaxed">
              Work on real brand projects and get internship opportunities.<br className="hidden md:block" />
              <span className="text-gray-400 text-base md:text-lg">
                Structured mentorship designed to make Nigerian creatives job-ready editors.
              </span>
            </p>

            {/* Social proof micro-line */}
            <p className="text-yellow-400/80 text-sm font-semibold mb-8">
              ✓ 200+ graduates · ✓ 50+ brand partners · ✓ Internship placement included
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                asChild
                className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-lg px-8 py-6 rounded-xl transition-all duration-300 hover:scale-[1.03] shadow-lg shadow-yellow-400/20 w-full sm:w-auto"
              >
                <a href="/academy">
                  Apply for the Next Cohort
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => setGuideOpen(true)}
                className="bg-white/5 hover:bg-white/15 border-white/40 text-white font-bold text-lg px-8 py-6 rounded-xl transition-all duration-300 hover:scale-[1.03] backdrop-blur-sm w-full sm:w-auto"
              >
                <Download className="mr-2 h-5 w-5" />
                Download the Program Guide
              </Button>
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-bounce" />
            </div>
          </motion.div>
        </div>
      </section>

      <GuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </>
  )
}

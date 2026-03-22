"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { PlayCircle, Mail, CheckCircle2 } from "lucide-react"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { toast } from "sonner"

const mistakes = [
  "Cutting on the wrong frame",
  "Ignoring audio quality",
  "Over-relying on effects",
  "No colour grading workflow",
  "Not understanding pacing",
]

export default function LeadCapture() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)

    try {
      // 1. Fetch the custom message from Firestore
      const snap = await getDoc(doc(db, "siteSettings", "leadMagnet"))
      const config = snap.exists() ? snap.data() : {
        subject: "Your Program Blueprint is Here! 🎬",
        message: "Hi there!\n\nThank you for requesting the Program Blueprint.",
        link: "https://agbacinema.com/blueprint",
        buttonText: "Watch Free Training"
      }

      // 2. Trigger the real email API
      const response = await fetch("/api/notifications/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to_email: email,
          to_name: "Creative",
          subject: config.subject,
          text: `${config.message}\n\nAccess it here: ${config.link}`,
          html: `
            <div style="font-family: sans-serif; padding: 40px; background: #f9f9f9;">
              <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
                <h1 style="font-size: 24px; font-weight: 900; color: #111; margin-bottom: 20px;">${config.subject}</h1>
                <p style="font-size: 16px; color: #444; line-height: 1.6; margin-bottom: 30px; white-space: pre-wrap;">${config.message}</p>
                <a href="${config.link}" style="display: inline-block; background: #fbbf24; color: black; font-weight: 900; padding: 20px 40px; border-radius: 12px; text-decoration: none; font-size: 18px;">${config.buttonText}</a>
                <p style="margin-top: 40px; font-size: 12px; color: #999;">If you didn't request this, please ignore this email.</p>
              </div>
            </div>
          `
        })
      })

      if (!response.ok) throw new Error("Email dispatch failed")
      
      setSubmitted(true)
    } catch (e) {
      toast.error("Failed to collect blueprint. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-24 bg-gradient-to-br from-yellow-50 to-orange-50 border-y border-yellow-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — mistakes list */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="text-yellow-600 text-sm font-bold uppercase tracking-widest block mb-4">
              Free Training for Creatives
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              The 5 Biggest Mistakes<br />
              <span className="text-yellow-500">Beginner Video Editors</span> Make
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Watch our free training and learn how to avoid the exact errors that keep most Nigerian editors from getting hired.
            </p>

            <ul className="space-y-3">
              {mistakes.map((m, i) => (
                <li key={m} className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-yellow-400 text-black text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-gray-700 font-medium">{m}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl border border-yellow-100 p-8"
          >
            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">You're in! 🎬</h3>
                <p className="text-gray-500">
                  Check your inbox — the free training video is on its way. Don't forget to check your spam folder.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <PlayCircle className="h-8 w-8 text-yellow-500" />
                  <span className="text-gray-500 text-sm font-medium">Free Training Video — 23 mins</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Watch the Free Training</h3>
                <p className="text-gray-500 mb-6 text-sm">
                  Enter your email below and we'll send you instant access — no credit card required.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="lead-email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="lead-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-gray-900 placeholder-gray-400"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-6 rounded-xl text-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-70"
                  >
                    {loading ? "Sending…" : (
                      <>
                        <PlayCircle className="mr-2 h-5 w-5" />
                        Watch Free Training
                      </>
                    )}
                  </Button>
                </form>

                <p className="text-center text-xs text-gray-400 mt-4">
                  We respect your privacy. No spam, ever. Unsubscribe anytime.
                </p>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

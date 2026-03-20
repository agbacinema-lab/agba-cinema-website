"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Clock, Users, ArrowRight, Flame, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  useEffect(() => {
    const calc = () => {
      const diff = targetDate.getTime() - Date.now()
      if (diff <= 0) return
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [targetDate])
  return timeLeft
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white/10 border border-white/20 rounded-xl w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
        <span className="text-2xl md:text-3xl font-black text-white tabular-nums">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-gray-400 text-xs mt-2 uppercase tracking-wider">{label}</span>
    </div>
  )
}

// Social proof stats
function StatBubble({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-center">
      <p className="text-2xl font-black text-yellow-400">{value}</p>
      <p className="text-white font-semibold text-sm">{label}</p>
      <p className="text-gray-500 text-xs">{sub}</p>
    </div>
  )
}

import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

export default function UrgencyCohort() {
  const [data, setData] = useState({
    cohortTitle: "April 2026 Mentorship Cohort",
    deadlineDate: "2026-04-30T23:59:59",
    slotsLeft: 2,
    totalSlots: 10,
    applicationsCount: 147,
    applicationsTrend: "43%"
  })

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "siteSettings", "urgency"))
        if (snap.exists()) setData(snap.data() as any)
      } catch (e) { console.error(e) }
    }
    load()
  }, [])

  const deadline = new Date(data.deadlineDate)
  const timeLeft = useCountdown(deadline)
  const slotsLeft = data.slotsLeft
  const totalSlots = data.totalSlots
  const filled = totalSlots - slotsLeft

  return (
    <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-900 to-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(250,204,21,0.07)_0%,_transparent_70%)] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {/* Flame badge */}
          <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-400/30 text-red-400 text-sm font-bold px-4 py-2 rounded-full mb-6">
            <Flame className="h-4 w-4" />
            Enrollment Closing Soon
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">
            {data.cohortTitle}
          </h2>
          <p className="text-gray-400 text-xl mb-10">
            Don't miss your chance to start your career in video editing this quarter.
          </p>

          {/* Application social proof stats */}
          <div className="grid grid-cols-3 gap-4 mb-10 max-w-lg mx-auto">
            <StatBubble value={data.applicationsCount.toString()} label="Applications" sub="this month" />
            <StatBubble value={totalSlots.toString()} label="Accepted" sub="per cohort" />
            <StatBubble value={slotsLeft.toString()} label="Slots Left" sub={`out of ${totalSlots}`} />
          </div>

          {/* Slot bar */}
          <div className="max-w-sm mx-auto mb-10">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>{filled} of {totalSlots} spots filled</span>
              <span className="text-red-400 font-bold">{slotsLeft} remaining</span>
            </div>
            <div className="bg-white/10 rounded-full h-3 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-yellow-400 to-orange-400 h-full rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: `${(filled / totalSlots) * 100}%` }}
                transition={{ duration: 1.5, delay: 0.3 }}
                viewport={{ once: true }}
              />
            </div>
          </div>

          {/* Trending */}
          <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm font-semibold mb-8">
            <TrendingUp className="h-4 w-4" />
            <span>Applications increased {data.applicationsTrend} this week</span>
          </div>

          {/* Countdown */}
          <p className="text-gray-400 text-sm uppercase tracking-wider mb-4 flex items-center justify-center gap-2">
            <Clock className="h-4 w-4" />
            Enrollment closes: {deadline.toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <div className="flex items-center justify-center gap-4 mb-12">
            <TimeUnit value={timeLeft.days} label="Days" />
            <span className="text-white text-3xl font-black mb-4">:</span>
            <TimeUnit value={timeLeft.hours} label="Hours" />
            <span className="text-white text-3xl font-black mb-4">:</span>
            <TimeUnit value={timeLeft.minutes} label="Minutes" />
            <span className="text-white text-3xl font-black mb-4">:</span>
            <TimeUnit value={timeLeft.seconds} label="Seconds" />
          </div>

          {/* CTA */}
          <Button
            size="lg"
            asChild
            className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xl px-12 py-7 rounded-xl transition-all duration-300 hover:scale-[1.03] shadow-lg shadow-yellow-400/20"
          >
            <a href="/academy">
              Apply Now — Secure Your Spot
              <ArrowRight className="ml-2 h-6 w-6" />
            </a>
          </Button>
          <p className="text-gray-500 text-sm mt-4">Free 15-min consultation call included with every application</p>

          {/* WhatsApp urgency */}
          <div className="mt-8">
            <a
              href={`https://wa.me/2349065230464?text=Hi%2C+I%27d+like+to+apply+for+the+${encodeURIComponent(data.cohortTitle)}!`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 text-sm font-semibold transition-colors"
            >
              💬 Or apply directly on WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

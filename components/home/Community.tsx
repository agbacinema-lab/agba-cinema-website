"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Users, BookOpen, Bell, Zap } from "lucide-react"
import { motion } from "framer-motion"

const benefits = [
  {
    icon: BookOpen,
    title: "Editing Resources",
    desc: "Access free LUTs, templates, project files, and tutorials shared by professional editors.",
  },
  {
    icon: Users,
    title: "Networking",
    desc: "Connect with 500+ Nigerian creatives, agency contacts, and brand managers in our community.",
  },
  {
    icon: Bell,
    title: "Mentorship Announcements",
    desc: "Be first to hear of new cohorts, scholarship spots, and brand project opportunities.",
  },
  {
    icon: Zap,
    title: "Weekly Challenges",
    desc: "Practice your skills with weekly editing challenges. Win brand exposure and mentorship credits.",
  },
]

export default function Community() {
  return (
    <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(250,204,21,0.06)_0%,_transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="text-yellow-400 text-sm font-bold uppercase tracking-widest block mb-4">Join the Movement</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Join the{" "}
              <span className="text-yellow-400">ÀGBÀ Creators</span>
              <br />Community
            </h2>
            <p className="text-gray-300 text-xl mb-8 leading-relaxed">
              500+ Nigerian creatives already inside. Get free resources, connect with brands, and stay ahead of the industry.
            </p>

            <div className="space-y-4 mb-10">
              {benefits.map((b, i) => (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 bg-yellow-400/10 border border-yellow-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <b.icon className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="font-bold text-white">{b.title}</p>
                    <p className="text-gray-400 text-sm">{b.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                asChild
                className="bg-green-500 hover:bg-green-400 text-white font-bold px-8 py-6 rounded-xl text-lg transition-all duration-300 hover:scale-[1.02]"
              >
                <a
                  href="https://chat.whatsapp.com/your-group-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  💬 Join on WhatsApp
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>

              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/30 text-white bg-white/5 hover:bg-white/15 font-bold px-8 py-6 rounded-xl text-lg transition-all duration-300 hover:scale-[1.02]"
              >
                <a
                  href="https://t.me/your-telegram-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ✈️ Join on Telegram
                </a>
              </Button>
            </div>
            <p className="text-gray-500 text-sm mt-4">Free to join. 100% for Nigerian creatives.</p>
          </motion.div>

          {/* Right — stats / social proof visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col gap-4"
          >
            {/* Big stat */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center backdrop-blur-sm">
              <p className="text-7xl font-black text-yellow-400 mb-2">500<span className="text-4xl">+</span></p>
              <p className="text-xl font-semibold text-white">Creatives already inside</p>
              <p className="text-gray-400 text-sm mt-1">and growing every week</p>
            </div>

            {/* Sub stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
                <p className="text-3xl font-black text-white">50+</p>
                <p className="text-gray-400 text-sm">Brand contacts</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
                <p className="text-3xl font-black text-white">Weekly</p>
                <p className="text-gray-400 text-sm">Editing challenges</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
                <p className="text-3xl font-black text-white">Free</p>
                <p className="text-gray-400 text-sm">Resources shared</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
                <p className="text-3xl font-black text-white">24/7</p>
                <p className="text-gray-400 text-sm">Peer support</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

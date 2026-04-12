"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Download, ArrowRight, Zap, Play } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

import Image from "next/image"

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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 backdrop-blur-xl px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 relative overflow-hidden"
      >
        {/* Abstract Glow in Modal */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 blur-3xl rounded-full" />
        
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors h-10 w-10 flex items-center justify-center bg-white/5 rounded-full"
          aria-label="Close"
        >×</button>

        {done ? (
          <div className="text-center py-10 space-y-6">
            <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-yellow-400/20">
               <Zap className="h-10 w-10 text-black fill-black" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Transmission Sent</h3>
              <p className="text-gray-400 font-medium">The ÀGBÀ CINEMA Blueprint is navigating to <strong>{email}</strong>.</p>
            </div>
          </div>
        ) : (
          <div className="relative z-10">
            <div className="space-y-2 mb-10 text-center">
              <h4 className="text-yellow-400 font-black uppercase tracking-[0.4em] text-[10px]">Access Granted</h4>
              <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Download The <br />Program Guide</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                required
                type="text"
                placeholder="YOUR NAME"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-400 transition-colors font-bold uppercase tracking-widest text-xs"
              />
              <input
                required
                type="email"
                placeholder="YOUR BEST EMAIL"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-400 transition-colors font-bold uppercase tracking-widest text-xs"
              />
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-400 hover:bg-white text-black font-black py-7 rounded-2xl text-[10px] uppercase tracking-[0.3em] italic transition-all shadow-xl shadow-yellow-400/10"
              >
                {loading ? "INITIALIZING..." : "Send the Blueprint →"}
              </Button>
            </form>
            <p className="text-center text-[9px] font-black text-gray-600 uppercase tracking-widest mt-8">Encrypted Connection · Zero Spam</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default function Hero() {
  const [guideOpen, setGuideOpen] = useState(false)

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center bg-[#050505] text-white overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/cinematic-video-setup.png"
            alt="Cinematic Video Setup"
            fill
            quality={60}
            priority
            className="object-cover object-center grayscale-[40%] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#050505]" />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
          
          {/* Film Grain */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>

        {/* Dynamic Light Leaks */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-yellow-400/10 blur-[180px] rounded-full animate-pulse" />
           <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-white/5 blur-[150px] rounded-full" />
        </div>

        {/* Content */}
        <div className="relative z-20 max-w-6xl mx-auto px-4 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-10"
          >
            {/* Elite Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full mb-4 shadow-2xl"
            >
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-yellow-500">
                ÀGBÀ CINEMA — CREATIVE EDUCATION &amp; PRODUCTION
              </span>
            </motion.div>

            {/* Main Title */}
            <div className="space-y-2">
              <h1 className="text-5xl md:text-8xl lg:text-9xl font-black mb-6 leading-[0.85] tracking-tighter uppercase italic">
                Building Africa&apos;s <br />
                <span className="text-yellow-400 drop-shadow-[0_0_40px_rgba(250,204,21,0.3)]">Creative Professionals</span>
              </h1>
            </div>

            {/* Narrative Subtitle */}
            <p className="text-lg md:text-2xl mb-12 max-w-3xl mx-auto text-gray-300 leading-relaxed font-medium italic opacity-80">
              One academy. Six creative disciplines. We transform African talent into <span className="text-white">industry-ready professionals</span> in Filmmaking, Writing, Social Media, Digital Marketing, Content Creation, and Virtual Assistance.
            </p>

            {/* Social Proof Bar */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-12">
               <span className="flex items-center gap-2 italic"><Zap className="h-3 w-3 text-yellow-400" /> 6 Creative Tracks</span>
               <span className="w-1 h-1 bg-gray-700 rounded-full hidden md:block" />
               <span className="flex items-center gap-2 italic"><Zap className="h-3 w-3 text-yellow-400" /> 200+ Graduates</span>
               <span className="w-1 h-1 bg-gray-700 rounded-full hidden md:block" />
               <span className="flex items-center gap-2 italic"><Zap className="h-3 w-3 text-yellow-400" /> 50+ Brand Partners</span>
               <span className="w-1 h-1 bg-gray-700 rounded-full hidden md:block" />
               <span className="flex items-center gap-2 italic"><Zap className="h-3 w-3 text-yellow-400" /> Internship Guaranteed</span>
            </div>

            {/* Strategic CTAs */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                size="lg"
                asChild
                className="group relative overflow-hidden bg-yellow-400 hover:bg-white text-black font-black uppercase italic tracking-tighter h-20 px-12 rounded-[2rem] transition-all w-full sm:w-auto text-xl shadow-2xl shadow-yellow-400/20"
              >
                <Link href="/academy" className="flex items-center gap-4">
                  Initiate Training
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <button
                onClick={() => setGuideOpen(true)}
                className="group relative flex items-center gap-4 h-20 px-12 bg-black/40 backdrop-blur-xl border border-white/10 text-white font-black uppercase italic tracking-tighter rounded-[2rem] hover:bg-white hover:text-black transition-all w-full sm:w-auto text-xl"
              >
                <Download className="h-6 w-6 group-hover:-translate-y-1 transition-transform" />
                Program Blueprint
              </button>
            </div>
          </motion.div>
        </div>

        {/* Floating Explore Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-4 opacity-30"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.5em]">Scroll to Deploy</span>
          <div className="w-px h-16 bg-gradient-to-b from-yellow-400 to-transparent animate-pulse" />
        </motion.div>
      </section>

      <GuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </>
  )
}

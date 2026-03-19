"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, ArrowRight, LayoutDashboard, BookOpen } from "lucide-react"
import { motion } from "framer-motion"

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [reference, setReference] = useState("VERIFYING...")
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    setReference(searchParams.get('reference') || "SYSTEM-BYPASS")
  }, [searchParams])

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push("/student/learning")
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.05)_0%,transparent_70%)] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-xl w-full bg-[#111] border border-white/5 rounded-[3rem] p-12 text-center shadow-2xl relative z-10"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.2 }}
          className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(250,204,21,0.3)]"
        >
          <CheckCircle2 className="h-12 w-12 text-black stroke-[3]" />
        </motion.div>

        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-4">Payment Successful</h1>
        <p className="text-gray-400 font-medium leading-relaxed mb-10 max-w-sm mx-auto">
          Transaction verified. Your course access has been updated. You can now start your new specialization track.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Status</p>
            <p className="text-xs font-black uppercase text-yellow-400">Verified & Active</p>
          </div>
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">ID Ref</p>
            <p className="text-xs font-black uppercase text-white truncate">{reference || "SYSTEM-BYPASS"}</p>
          </div>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => router.push("/student/learning")}
            className="w-full h-16 bg-yellow-400 text-black rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
          >
            Enter Academy <BookOpen className="h-5 w-5" />
          </button>
          
          <button 
            onClick={() => router.push("/student/dashboard")}
            className="w-full h-16 bg-white/5 text-white border border-white/10 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
          >
            Command Dashboard <LayoutDashboard className="h-4 w-4" />
          </button>
        </div>

        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mt-12 animate-pulse">
          Redirecting to Dashboard in {countdown}s...
        </p>
      </motion.div>
    </div>
  )
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}

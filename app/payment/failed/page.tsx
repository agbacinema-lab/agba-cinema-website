"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { XCircle, RefreshCcw, LayoutDashboard, LifeBuoy } from "lucide-react"
import { motion } from "framer-motion"

function PaymentFailedContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errorRef, setErrorRef] = useState("SIGNAL_LOST")

  useEffect(() => {
    const rawRef = searchParams.get('reference') || "ERROR-" + Math.floor(Math.random() * 900000 + 100000).toString()
    setErrorRef(rawRef)
  }, [searchParams])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.05)_0%,transparent_70%)] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-xl w-full bg-[#111] border border-red-900/10 rounded-[3.5rem] p-12 text-center shadow-2xl relative z-10"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.2 }}
          className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(255,0,0,0.2)]"
        >
          <XCircle className="h-12 w-12 text-white stroke-[3]" />
        </motion.div>

        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-4 leading-none">Payment Failed</h1>
        <p className="text-gray-400 font-medium leading-relaxed mb-10 max-w-sm mx-auto">
          Transaction failed. Your payment was not processed. No changes were made to your account.
        </p>

        <div className="bg-red-900/5 p-6 rounded-3xl border border-red-900/10 text-left mb-10 space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Error Code</p>
            <p className="text-[10px] font-black uppercase text-white">{errorRef}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Status</p>
            <p className="text-[10px] font-black uppercase text-white">FAILED_UPLINK</p>
          </div>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => router.push("/student/learning")}
            className="w-full h-16 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-black hover:text-white hover:border-red-600 border border-transparent transition-all shadow-xl active:scale-95"
          >
            Try Again <RefreshCcw className="h-5 w-5" />
          </button>
          
          <button 
            onClick={() => router.push("/student/dashboard")}
            className="w-full h-16 bg-white/5 text-white border border-white/10 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
          >
            Command Dashboard <LayoutDashboard className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-gray-600">
          <LifeBuoy className="h-4 w-4" />
          <p className="text-[10px] font-black uppercase tracking-widest">Contact Support if persistent.</p>
        </div>
      </motion.div>
    </div>
  )
}

export default function PaymentFailed() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600" />
      </div>
    }>
      <PaymentFailedContent />
    </Suspense>
  )
}

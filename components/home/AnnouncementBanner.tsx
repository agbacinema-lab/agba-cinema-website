"use client"

import { useState, useEffect } from "react"
import { adminService } from "@/lib/services"
import { Announcement } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"
import { Megaphone, X, ArrowRight } from "lucide-react"

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const data = await adminService.getAnnouncements()
      setAnnouncements(data.filter(a => a.isActive))
    }
    fetch()
  }, [])

  if (dismissed || announcements.length === 0) return null

  const current = announcements[currentIndex]

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-20 left-0 right-0 z-[100] px-4 md:px-8 pointer-events-none"
      >
        <div className={`max-w-4xl mx-auto flex items-center justify-between p-4 md:p-6 rounded-[2rem] shadow-2xl backdrop-blur-xl border pointer-events-auto ${
           current.priority === 'high' ? 'bg-black text-white border-white/10' : 
           current.priority === 'medium' ? 'bg-yellow-400 text-black border-yellow-500' : 'bg-white text-black border-gray-100'
        }`}>
          <div className="flex items-center gap-4 md:gap-6 flex-1">
             <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 ${
                current.priority === 'high' ? 'bg-yellow-400 text-black' : 'bg-black text-white'
             }`}>
                <Megaphone className="h-5 w-5 md:h-6 md:w-6" />
             </div>
             <div>
                <h4 className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] opacity-60 mb-1">{current.priority} Alert</h4>
                <p className="text-sm md:text-lg font-black italic uppercase tracking-tighter leading-tight">
                   {current.title} — <span className={current.priority === 'high' ? 'text-gray-400' : 'text-gray-700'}>{current.content}</span>
                </p>
             </div>
          </div>

          <div className="flex items-center gap-4 ml-8">
             {current.link && (
               <a 
                href={current.link} 
                className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-6 h-12 rounded-xl transition-all ${
                  current.priority === 'high' ? 'bg-white text-black hover:bg-yellow-400' : 'bg-black text-white hover:bg-white hover:text-black'
                }`}
               >
                 View <ArrowRight className="h-4 w-4" />
               </a>
             )}
             <button 
                onClick={() => setDismissed(true)} 
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  current.priority === 'high' ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-black/5 text-gray-500'
                }`}
             >
                <X className="h-5 w-5" />
             </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

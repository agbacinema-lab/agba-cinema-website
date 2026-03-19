"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, X, ShieldAlert, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function PushPrompt() {
  const [isVisible, setIsVisible] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>("default")

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission)
      
      // Show prompt if permission is default and we haven't shown it this session
      const dismissed = sessionStorage.getItem("push_prompt_dismissed")
      if (Notification.permission === "default" && !dismissed) {
        const timer = setTimeout(() => setIsVisible(true), 3000)
        return () => clearTimeout(timer)
      }
    }
  }, [])

  const requestPermission = async () => {
    if (!("Notification" in window)) return

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      setIsVisible(false)
      
      if (result === "granted") {
        new Notification("SYSTEM CONNECTED", {
          body: "Tactical alerts are now active. You will receive real-time updates from AGBA CINEMA.",
          icon: "/favicon.ico" // Assuming you have one
        })
        toast.success("Tactical alerts activated.")
      } else {
        toast.error("Notification permission denied.")
      }
    } catch (error) {
       console.error("Notification Error:", error)
    }
  }

  const dismiss = () => {
    setIsVisible(false)
    sessionStorage.setItem("push_prompt_dismissed", "true")
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 right-6 left-6 md:left-auto md:w-[400px] z-[100]"
      >
        <div className="bg-black text-white p-6 rounded-[2.5rem] shadow-2xl border border-white/10 relative overflow-hidden group">
          <button 
            onClick={dismiss}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative z-10">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-black shadow-lg shadow-yellow-400/20">
                   <Bell className="h-5 w-5 animate-bounce" />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400">Tactical Updates</p>
                   <h4 className="text-lg font-black italic uppercase tracking-tighter">Activate Notifications?</h4>
                </div>
             </div>
             
             <p className="text-gray-400 text-sm font-medium mb-6 leading-relaxed">
                Stay updated with real-time broadcast signals, assignment feedback, and recruitment alerts even when the portal is closed.
             </p>

             <div className="flex gap-3">
                <Button 
                  onClick={requestPermission}
                  className="flex-1 bg-white text-black hover:bg-yellow-400 font-black rounded-2xl h-14 uppercase italic tracking-tighter transition-all"
                >
                  Activate Protocols <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
             </div>
          </div>

          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-yellow-400/5 blur-[80px] rounded-full" />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

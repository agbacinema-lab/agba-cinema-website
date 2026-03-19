"use client"

import { useState, useEffect } from "react"
import { Bell, X, Check, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { notificationService } from "@/lib/services"
import { useAuth } from "@/context/AuthContext"
import { formatDistanceToNow } from "date-fns"

export default function NotificationBell() {
  const { profile } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (profile?.uid) {
      loadNotifications()
      // Optional: Polling every 60s
      const timer = setInterval(loadNotifications, 60000)
      return () => clearInterval(timer)
    }
  }, [profile?.uid])

  const loadNotifications = async () => {
    if (!profile?.uid) return
    const data = await notificationService.getUserNotifications(profile.uid)
    setNotifications(data)
    setUnreadCount(data.filter(n => !n.read).length)
  }

  const handleMarkRead = async (id: string) => {
    await notificationService.markAsRead(id)
    loadNotifications()
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-xl transition-all duration-300 ${
          isOpen ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' : 'bg-white/5 text-white hover:bg-white/10'
        }`}
      >
        <Bell className={`h-5 w-5 ${unreadCount > 0 ? 'animate-tada' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-black flex items-center justify-center">
             <span className="text-[7px] font-black text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="fixed md:absolute top-20 md:top-full left-4 md:left-auto right-4 md:right-0 mt-0 md:mt-4 w-auto md:w-[400px] bg-black border border-white/10 rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] z-50 overflow-hidden"
            >
              <div className="p-4 md:p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div>
                    <h4 className="text-sm font-black italic uppercase tracking-tighter text-white">Latest Updates</h4>
                    <p className="text-[9px] font-black uppercase tracking-widest text-yellow-400">Recent messages</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg text-gray-500 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-6 md:p-10 text-center space-y-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-gray-600">
                       <Bell className="h-6 w-6 opacity-20" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">No notifications yet.</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-4 md:p-6 flex gap-4 border-b border-white/5 transition-all group hover:bg-white/5 ${!n.read ? 'bg-yellow-400/5' : ''}`}
                    >
                      <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!n.read ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'bg-gray-800'}`} />
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <h5 className="text-[11px] font-black uppercase tracking-widest text-white group-hover:text-yellow-400 transition-colors">{n.title}</h5>
                          <p className="text-[8px] font-bold text-gray-600 uppercase whitespace-nowrap">
                            {n.createdAt?.toDate ? formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true }) : 'RECENT'}
                          </p>
                        </div>
                        <p className="text-xs text-gray-400 font-medium leading-relaxed italic">{n.message}</p>
                        {!n.read && (
                          <button 
                            onClick={() => handleMarkRead(n.id)}
                            className="text-[8px] font-black uppercase tracking-tighter text-yellow-400 flex items-center gap-1 pt-2 hover:opacity-80"
                          >
                            Mark Read <Check className="h-2 w-2" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-4 bg-white/5 text-center">
                   <button className="text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Clear All Logs</button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

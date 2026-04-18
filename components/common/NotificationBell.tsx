"use client"

import { useState, useEffect } from "react"
import { Bell, X, Check, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { notificationService } from "@/lib/services"
import { useAuth } from "@/context/AuthContext"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"

import ApprovalDialog from "@/components/admin/ApprovalDialog"

export default function NotificationBell() {
  const { profile } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)

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

  const handleClearAll = async () => {
    if (!profile?.uid) return
    try {
      await notificationService.clearAllNotifications(profile.uid)
      loadNotifications()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-xl transition-all duration-300 ${
          isOpen 
            ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' 
            : 'bg-muted/50 text-foreground hover:bg-muted/80 border border-border'
        }`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-background flex items-center justify-center shadow-lg">
             <span className="text-[8px] font-black text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
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
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed md:absolute top-20 md:top-full left-4 md:left-auto right-4 md:right-0 mt-0 md:mt-4 w-auto md:w-[450px] bg-card border border-border rounded-[2.5rem] shadow-premium z-50 overflow-hidden"
            >
              <div className="p-6 md:p-8 border-b border-border flex justify-between items-center bg-muted/20">
                <div>
                     <h4 className="text-sm font-black italic uppercase tracking-tighter text-foreground">Operational Logs</h4>
                     <p className="text-[9px] font-black uppercase tracking-widest text-yellow-500">Security Clearance Level 4</p>
                </div>
                <div className="flex items-center gap-4">
                  {notifications.length > 0 && (
                    <button 
                      onClick={handleClearAll}
                      className="px-4 py-2 bg-muted hover:bg-red-500/20 hover:text-red-500 text-muted-foreground rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-border"
                    >
                      Wipe All
                    </button>
                  )}
                  <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-[500px] overflow-y-auto custom-scrollbar bg-card">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center space-y-6">
                    <div className="w-16 h-16 bg-muted/50 rounded-3xl flex items-center justify-center mx-auto text-muted-foreground border border-border">
                       <Bell className="h-8 w-8 opacity-20" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40">No active transmissions.</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-6 md:p-8 flex gap-6 border-b border-border transition-all group hover:bg-muted/30 ${!n.read ? 'bg-yellow-400/5' : ''}`}
                    >
                      <div className={`mt-2 h-2.5 w-2.5 rounded-full flex-shrink-0 ${!n.read ? 'bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)]' : 'bg-muted'}`} />
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start gap-4">
                          <h5 className="text-[12px] font-black uppercase tracking-widest text-foreground group-hover:text-yellow-600 transition-colors leading-tight">{n.title}</h5>
                          <p className="text-[8px] font-black text-muted-foreground uppercase whitespace-nowrap pt-1">
                            {n.createdAt?.toDate ? formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true }) : 'RECENT'}
                          </p>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-medium leading-relaxed italic opacity-80">{n.message}</p>
                        
                        <div className="flex items-center gap-4 mt-4">
                          {n.type === 'approval_request' && n.metadata?.requestId && (
                            <button 
                              onClick={() => {
                                if (n.metadata?.type === 'internship_ready' || n.metadata?.type === 'revoke_internship') {
                                  router.push('/admin?tab=readiness')
                                } else if (n.metadata?.type === 'curriculum_approval') {
                                  router.push('/admin?tab=content')
                                } else {
                                  setSelectedRequestId(n.metadata.requestId);
                                }
                                setIsOpen(false);
                              }}
                              className="px-4 py-2 bg-yellow-400 text-black text-[9px] font-black uppercase tracking-widest flex items-center gap-2 rounded-lg hover:scale-105 transition-all shadow-lg shadow-yellow-400/20"
                            >
                               Review Request <ArrowRight className="h-3 w-3" />
                            </button>
                          )}
                          {!n.read && (
                            <button 
                              onClick={() => handleMarkRead(n.id)}
                              className="text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                            >
                              Mark Read <Check className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {selectedRequestId && (
        <ApprovalDialog 
          requestId={selectedRequestId} 
          onClose={() => {
            setSelectedRequestId(null);
            loadNotifications();
          }} 
        />
      )}
    </div>
  )
}

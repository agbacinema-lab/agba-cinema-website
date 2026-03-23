"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, User, Shield, MessageSquare, X, Minus, Maximize2, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { chatService } from "@/lib/services"
import { ChatMessage, ChatRoom, UserProfile } from "@/lib/types"
import { toast } from "sonner"

interface GroupChatProps {
  roomId: string
  currentUser: UserProfile
  onClose?: () => void
}

export default function GroupChat({ roomId, currentUser, onClose }: GroupChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState("")
  const [loading, setLoading] = useState(true)
  const [roomDetails, setRoomDetails] = useState<ChatRoom | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!roomId) return

    setLoading(true)
    chatService.getRoomDetails(roomId).then(setRoomDetails)

    const unsubscribe = chatService.subscribeToMessages(roomId, (newMessages) => {
      setMessages(newMessages)
      setLoading(false)
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
      }, 100)
    })

    return () => unsubscribe()
  }, [roomId])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    const text = inputText.trim()
    setInputText("")

    try {
      await chatService.sendMessage(roomId, {
        senderId: currentUser.uid,
        senderName: currentUser.name || "User",
        senderRole: currentUser.role,
        text
      })
    } catch {
      toast.error("Message delivery failed.")
      setInputText(text)
    }
  }

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'super_admin': return 'bg-yellow-400 text-black border-yellow-500/20';
      case 'tutor': return 'bg-blue-500 text-white border-blue-600/20';
      case 'brand': return 'bg-purple-600 text-white border-purple-700/20';
      case 'student': return 'bg-emerald-500 text-white border-emerald-600/20';
      default: return 'bg-muted text-muted-foreground';
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa] dark:bg-[#0f0f0f] border border-muted/50 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all">
      {/* ── Chat Header ── */}
      <div className="p-6 bg-white dark:bg-[#1a1a1a] border-b border-muted/40 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center text-black shadow-lg shadow-yellow-400/20">
              <MessageSquare className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-[#1a1a1a] rounded-full animate-pulse" />
          </div>
          <div>
            <h4 className="font-black text-sm text-foreground tracking-tight leading-none mb-1">
              {roomDetails?.metadata.studentName} Deployment
            </h4>
            <div className="flex items-center gap-2">
               <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-70">
                 {roomDetails?.metadata.brandName} Secure Channel
               </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <div className="hidden md:flex -space-x-3 items-center mr-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center shadow-sm">
                   <User className="h-3 w-3 text-muted-foreground" />
                </div>
              ))}
           </div>
           {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-2xl hover:bg-neutral-100 dark:hover:bg-white/5 h-10 w-10">
                  <X className="h-5 w-5" />
              </Button>
           )}
        </div>
      </div>

      {/* ── Messages Area ── */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed opacity-95"
      >
        {loading ? (
             <div className="h-full flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground italic">Establishing Uplink...</p>
             </div>
        ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-40 grayscale">
                <div className="w-20 h-20 bg-muted/20 rounded-[2rem] flex items-center justify-center mb-6">
                   <Shield className="h-8 w-8" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] leading-relaxed max-w-[200px]">Secure End-to-End Encryption Active. Begin Transmission.</p>
            </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === currentUser.uid
            const isAdmin = msg.senderRole === 'super_admin'
            const isSystem = msg.senderId === 'system'
            
            if (isSystem) return (
               <div key={msg.id || idx} className="flex justify-center my-4">
                  <span className="px-4 py-1.5 bg-yellow-400/10 border border-yellow-400/20 text-yellow-600 dark:text-yellow-400 text-[8px] font-black uppercase tracking-[0.3em] rounded-full">
                    {msg.text}
                  </span>
               </div>
            )

            return (
              <motion.div 
                key={msg.id || idx}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}
              >
                {!isMe && (
                   <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center mt-auto mr-3 shadow-sm flex-shrink-0">
                      <User className="h-4 w-4" />
                   </div>
                )}
                
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  {!isMe && (
                    <div className="flex items-center gap-2 mb-1 ml-1">
                       <span className="text-[9px] font-black uppercase tracking-tight text-foreground/80">{msg.senderName}</span>
                       <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border ${getRoleColor(msg.senderRole)}`}>
                          {msg.senderRole.replace('_', ' ')}
                       </span>
                    </div>
                  )}

                  <div 
                    className={`relative px-5 py-4 rounded-[1.8rem] text-sm font-medium leading-relaxed shadow-sm transition-all ${
                        isMe 
                            ? 'bg-yellow-400 text-black rounded-tr-none hover:shadow-yellow-400/10 hover:shadow-xl' 
                            : 'bg-white dark:bg-[#1a1a1a] text-foreground border border-muted/30 rounded-tl-none hover:shadow-lg dark:hover:shadow-white/5'
                    }`}
                  >
                    {msg.text}
                    {isMe && (
                       <svg className="absolute -right-2 top-0 text-yellow-400 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M0 0h20v15c-5 0-20-15-20-15z" />
                       </svg>
                    )}
                    {!isMe && (
                       <svg className="absolute -left-2 top-0 text-white dark:text-[#1a1a1a] h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M20 0H0v15c5 0 20-15 20-15z" />
                       </svg>
                    )}
                  </div>
                  
                  <div className={`mt-1.5 flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity ${isMe ? 'mr-1' : 'ml-1'}`}>
                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                        {msg.timestamp?.seconds ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}
                    </span>
                    {isMe && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* ── Chat Input ── */}
      <div className="p-6 bg-white dark:bg-[#1a1a1a] border-t border-muted/40 backdrop-blur-md">
        <form onSubmit={handleSend} className="flex gap-4 items-end">
          <div className="flex-1 relative group">
             <textarea 
               value={inputText}
               onChange={(e) => setInputText(e.target.value)}
               onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e as any);
                  }
               }}
               placeholder="Type a message..."
               className="w-full min-h-[56px] max-h-[150px] rounded-3xl border-muted/50 bg-[#f8f9fa] dark:bg-[#0f0f0f] pl-6 pr-14 py-4 font-medium text-sm shadow-inner focus:ring-2 focus:ring-yellow-400/50 outline-none resize-none transition-all placeholder:text-muted-foreground/50"
             />
             <div className="absolute right-4 bottom-4 text-muted-foreground/30 font-black text-[8px] uppercase tracking-widest hidden group-focus-within:block">Enter to fly</div>
          </div>
          
          <Button 
            type="submit" 
            disabled={!inputText.trim()}
            className="h-14 w-14 rounded-2xl bg-yellow-400 text-black hover:bg-black hover:text-[#fbbf24] transition-all shadow-xl shadow-yellow-400/20 group active:scale-90 flex-shrink-0"
          >
            <Send className="h-6 w-6 stroke-[2.5]" />
          </Button>
        </form>
        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 mt-4 text-center">
           Multi-Channel Encryption Protocol Secured
        </p>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, Shield, Search, Users, ExternalLink, Clock, User, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { chatService } from "@/lib/services"
import { ChatRoom, UserProfile } from "@/lib/types"
import GroupChat from "@/components/common/GroupChat"
import { formatDistanceToNow } from "date-fns"

interface ChatMonitoringProps {
  currentUser: UserProfile
}

export default function ChatMonitoring({ currentUser }: ChatMonitoringProps) {
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = chatService.subscribeToRooms((newRooms) => {
      setRooms(newRooms)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const filteredRooms = rooms.filter(r => 
    r.metadata?.studentName?.toLowerCase().includes(search.toLowerCase()) ||
    r.metadata?.brandName?.toLowerCase().includes(search.toLowerCase()) ||
    r.lastMessage?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">Communications Hub</h2>
          <p className="text-muted-foreground font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Official Liaison & Deployment Monitoring</p>
        </div>
        <div className="flex w-full md:w-96 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search channels..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="h-16 rounded-2xl pl-14 border-muted bg-card text-foreground font-bold shadow-sm" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Chat List */}
        <div className="lg:col-span-4 space-y-4">
          {loading ? (
             <div className="p-12 text-center space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-yellow-400 mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Syncing uplink...</p>
             </div>
          ) : filteredRooms.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-muted rounded-[3rem]">
              <MessageSquare className="h-10 w-10 text-muted/30 mx-auto mb-4" />
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground italic">No active transmissions detected.</p>
            </div>
          ) : (
            filteredRooms.map((room) => (
              <motion.div
                key={room.roomId}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveRoomId(room.roomId)}
                className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${
                  activeRoomId === room.roomId 
                    ? "bg-yellow-400 border-yellow-400 text-black shadow-xl shadow-yellow-400/20" 
                    : "bg-card border-muted hover:border-yellow-400/50 text-foreground"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                   <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${activeRoomId === room.roomId ? 'bg-black text-yellow-400' : 'bg-yellow-400 text-black'}`}>
                         {room.metadata.studentName?.[0] || "?"}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[120px]">
                        {room.metadata.studentName}
                      </span>
                   </div>
                   <div className="flex items-center gap-1 opacity-50">
                      <Clock className="h-3 w-3" />
                      <span className="text-[8px] font-bold">
                        {room.lastMessageAt?.seconds ? formatDistanceToNow(new Date(room.lastMessageAt.seconds * 1000), { addSuffix: true }) : "N/A"}
                      </span>
                   </div>
                </div>
                
                <h4 className="text-xs font-black uppercase tracking-tighter mb-2 italic">
                  Ref: {room.metadata.brandName}
                </h4>
                
                <p className={`text-[10px] font-medium line-clamp-2 ${activeRoomId === room.roomId ? 'text-black/70' : 'text-muted-foreground'}`}>
                  {room.lastMessage || "Deployment channel open."}
                </p>

                <div className="flex items-center gap-2 mt-4">
                   <div className="flex -space-x-2">
                      {room.participants.slice(0, 3).map((p) => (
                         <div key={p} className="w-5 h-5 rounded-full border-2 border-background bg-muted flex items-center justify-center">
                            <User className="h-2 w-2" />
                         </div>
                      ))}
                      {room.participants.length > 3 && (
                         <div className="w-5 h-5 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[7px] font-black">
                            +{room.participants.length - 3}
                         </div>
                      )}
                   </div>
                   <span className="text-[8px] font-black uppercase tracking-widest opacity-50">{room.participants.length} Active Participants</span>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-8 h-[700px]">
           {activeRoomId ? (
              <GroupChat roomId={activeRoomId} currentUser={currentUser} onClose={() => setActiveRoomId(null)} />
           ) : (
             <div className="h-full bg-muted/20 border-2 border-dashed border-muted rounded-[3rem] flex flex-col items-center justify-center text-center p-12 space-y-6">
                <div className="w-24 h-24 bg-card rounded-[2.5rem] flex items-center justify-center shadow-sm border border-muted">
                   <Zap className="h-10 w-10 text-yellow-400" />
                </div>
                <div className="space-y-2">
                   <h3 className="text-xl font-black uppercase tracking-tighter">Communications Terminal</h3>
                   <p className="text-sm text-muted-foreground font-medium max-w-sm">Select an active deployment channel from the list to initiate monitoring and official oversight.</p>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground opacity-50">
                   <div className="flex items-center gap-1.5">
                      <Shield className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Admin Control</span>
                   </div>
                   <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                   <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Tutor Verification</span>
                   </div>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  )
}

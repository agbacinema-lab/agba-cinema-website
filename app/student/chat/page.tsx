"use client"

import { useAuth } from "@/context/AuthContext"
import ChatMonitoring from "@/components/admin/ChatMonitoring"
import { motion } from "framer-motion"

export default function StudentChatPage() {
  const { profile } = useAuth()

  if (!profile) return null

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-white/5 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden min-h-[800px]"
      >
        <ChatMonitoring 
          currentUser={profile as any} 
          title="My Messages"
          subtitle="Chat Room"
        />
      </motion.div>
    </div>
  )
}

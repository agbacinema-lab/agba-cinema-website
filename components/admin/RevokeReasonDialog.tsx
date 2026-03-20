"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, XCircle, Send, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface RevokeReasonDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  studentName: string
}

export default function RevokeReasonDialog({ isOpen, onClose, onConfirm, studentName }: RevokeReasonDialogProps) {
  const [reason, setReason] = useState("")

  const handleSubmit = () => {
    if (!reason.trim()) return
    onConfirm(reason)
    setReason("")
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-[#0A0A0A] border border-red-500/20 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_-12px_rgba(239,68,68,0.3)]"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 bg-gradient-to-b from-red-500/5 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight uppercase">Revocation Protocol</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500/60">Status Revision Required</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-gray-500 transition-all">
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Subject for Revision</p>
                <p className="text-lg font-black text-white tracking-tight">{studentName}</p>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  <AlertCircle className="h-3.5 w-3.5" /> Tactical Reason for Status Change
                </label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why this student's internship readiness should be revoked..."
                  className="bg-black/40 border-white/10 rounded-2xl min-h-[150px] focus:ring-red-500/50 focus:border-red-500/50 text-white placeholder:text-gray-700 resize-none p-6 text-sm leading-relaxed"
                />
              </div>

              <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/10 flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-red-500/80 font-medium leading-relaxed uppercase tracking-wider">
                  Attention: This justification will be forwarded to the Super Admin for clearance. Ensure your assessment is accurate.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 bg-white/5 flex gap-4">
              <Button 
                onClick={onClose}
                variant="outline"
                className="flex-1 h-14 bg-transparent border-white/10 text-gray-400 hover:bg-white/5 rounded-2xl font-black text-[10px] uppercase tracking-widest"
              >
                Abort Protocol
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!reason.trim()}
                className="flex-[2] h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 group transition-all disabled:opacity-50 disabled:grayscale"
              >
                Submit for Approval <Send className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

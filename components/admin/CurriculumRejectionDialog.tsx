"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, XCircle, Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface CurriculumRejectionDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  curriculumTitle: string
}

export default function CurriculumRejectionDialog({ isOpen, onClose, onConfirm, curriculumTitle }: CurriculumRejectionDialogProps) {
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
            className="relative w-full max-w-lg bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-premium"
          >
            {/* Header */}
            <div className="p-8 border-b border-border bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
                    <XCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-foreground tracking-tight uppercase italic">Rejection Feed</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">Curriculum Clearance Restricted</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl text-muted-foreground transition-all">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              <div className="p-6 bg-muted/30 rounded-2xl border border-border">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Target Content</p>
                <p className="text-lg font-black text-foreground tracking-tight italic">{curriculumTitle}</p>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="h-3.5 w-3.5" /> Directives for Revision
                </label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain what needs to be fixed or improved in this curriculum..."
                  className="bg-background border-border rounded-2xl min-h-[150px] focus:ring-red-500/50 focus:border-red-500/50 text-foreground placeholder:text-muted-foreground/30 resize-none p-6 text-sm leading-relaxed"
                />
              </div>

              <div className="p-4 bg-yellow-400/5 rounded-xl border border-yellow-400/10 flex gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-yellow-600 font-medium leading-relaxed uppercase tracking-wider">
                  Important: This feedback will be visible to the tutor immediately. Be specific with your instructions.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 bg-muted/10 flex gap-4">
              <Button 
                onClick={onClose}
                variant="outline"
                className="flex-1 h-14 bg-transparent border-border text-muted-foreground hover:bg-muted rounded-2xl font-black text-[10px] uppercase tracking-widest"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!reason.trim()}
                className="flex-[2] h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 group transition-all disabled:opacity-50 disabled:grayscale"
              >
                Send Feedback <Send className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

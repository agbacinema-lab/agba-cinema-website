"use client"

import { useState, useEffect } from "react"
import { adminService } from "@/lib/services"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import { CheckCircle2, XCircle, Search, User, Shield, GraduationCap, ArrowRight, ExternalLink } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function ApprovalDialog({ requestId, onClose }: { requestId: string, onClose: () => void }) {
  const { profile } = useAuth()
  const [request, setRequest] = useState<any>(null)
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [reason, setReason] = useState("")
  const [processing, setProcessing] = useState(false)
  const [view, setView] = useState<'request' | 'details'>('request')

  const [submissions, setSubmissions] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [requestId])

  const loadData = async () => {
    try {
      const { db } = await import("@/lib/firebase")
      const { doc, getDoc, collection, query, getDocs, where } = await import("firebase/firestore")
      
      const reqSnap = await getDoc(doc(db, "approvals", requestId))
      if (!reqSnap.exists()) {
        toast.error("Request not found")
        onClose()
        return
      }
      const r: any = { id: reqSnap.id, ...reqSnap.data() }
      setRequest(r)

      if (r.data?.userId) {
        const u = await adminService.getUserById(r.data.userId)
        setStudent(u)

        // Fetch their performance
        const subCol = collection(db, "submissions")
        const q = query(subCol, where("studentUID", "==", r.data.userId))
        const sSnap = await getDocs(q)
        setSubmissions(sSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (approved: boolean) => {
    if (!profile) return
    if (!approved && !reason) {
      toast.error("Please provide a reason for rejection")
      return
    }

    setProcessing(true)
    try {
      await adminService.processApproval(
        requestId, 
        approved, 
        { 
          uid: profile.uid || 'unknown', 
          name: profile.name || 'Admin' 
        }, 
        reason || ''
      )
      toast.success(approved ? "Request approved successfully" : "Request rejected")
      onClose()
    } catch (err) {
      toast.error("Failed to process request")
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="bg-black border border-white/10 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] relative"
      >
        {/* Header */}
        <div className="p-10 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center text-black shadow-xl">
                   <Shield className="h-8 w-8" />
                </div>
                <div>
                   <h2 className="text-3xl font-black tracking-tighter text-white">
                      {request.type === 'revoke_internship' ? 'Revocation Review' : 'Vetting Protocol'}
                   </h2>
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-500">
                      {request.type === 'revoke_internship' ? 'Status Revision' : 'Authority Verification'}
                   </p>
                </div>
            </div>
            <button onClick={onClose} className="p-4 hover:bg-white/10 rounded-2xl text-gray-500 transition-all">
                <XCircle className="h-6 w-6" />
            </button>
        </div>

        <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {/* Requester Info */}
            <div className="flex items-center gap-4 p-6 bg-white/5 rounded-2xl border border-white/5">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                   <User className="h-6 w-6" />
                </div>
                <div className="flex-1">
                   <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Nominated by</p>
                   <p className="text-white font-bold">{request.requestBy.name}</p>
                </div>
                <div className="text-right">
                   <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Nomination ID</p>
                   <p className="text-gray-400 font-mono text-[10px]">{request.id.slice(0,12)}</p>
                </div>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
                <button 
                  onClick={() => setView('request')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'request' ? 'bg-yellow-400 text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                   Nomination
                </button>
                <button 
                  onClick={() => setView('details')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'details' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                   Full Database
                </button>
            </div>

            <AnimatePresence mode="wait">
              {view === 'request' ? (
                <motion.div key="req" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-8">
                    {/* Student Profile Preview */}
                    {student && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-6">
                              <div className="w-24 h-24 bg-white/10 rounded-[2rem] border-2 border-yellow-400 flex items-center justify-center overflow-hidden">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.uid}`} className="w-full h-full object-cover" alt="" />
                              </div>
                              <div className="flex-1">
                                  <h3 className="text-3xl font-black tracking-tight text-white">{student.name}</h3>
                                  <p className="text-yellow-400 font-bold uppercase tracking-widest text-[10px] mt-1">Status: High potential</p>
                                  <div className="flex gap-4 mt-4">
                                    <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] text-gray-400 font-black tracking-widest">
                                        {student.programType?.toUpperCase() || 'GENERAL'}
                                    </div>
                                    <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] text-gray-400 font-black tracking-widest">
                                        {student.specialization?.replace('-', ' ').toUpperCase() || 'CORE'}
                                    </div>
                                  </div>
                              </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                              <div className="p-6 bg-white/5 rounded-2xl border border-white/5 text-center">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Tasks</p>
                                  <p className="text-2xl font-black text-white">{submissions.length}</p>
                              </div>
                              <div className="p-6 bg-white/5 rounded-2xl border border-white/5 text-center">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Graded</p>
                                  <p className="text-2xl font-black text-green-500">{submissions.filter(s => s.status === 'approved').length}</p>
                              </div>
                              <div className="p-6 bg-white/5 rounded-2xl border border-white/5 text-center">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Alerts</p>
                                  <p className="text-2xl font-black text-red-500">{submissions.filter(s => s.status === 'redo').length}</p>
                              </div>
                          </div>

                          <div className="p-8 bg-muted/20 rounded-[2.5rem] border border-muted/30">
                              <p className="text-sm text-gray-300 leading-relaxed font-medium italic">
                                  "This student has demonstrated exceptional proficiency in their core modules and is currently ready for high-level industry placement."
                              </p>
                          </div>
                        </div>
                    )}
                </motion.div>
              ) : (
                <motion.div key="db" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                    <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6">
                       <h4 className="text-sm font-black uppercase tracking-widest text-indigo-400">Work Logs & Submissions</h4>
                       <div className="space-y-4">
                          {submissions.length === 0 ? (
                            <p className="text-xs text-gray-600 italic">No formal submissions recorded in the database yet.</p>
                          ) : (
                            submissions.map(sub => (
                              <div key={sub.id} className="p-4 bg-black/40 rounded-xl border border-white/5 flex items-center justify-between">
                                  <div>
                                     <p className="text-[10px] font-black text-white">{sub.assignmentTitle || 'Academy Project'}</p>
                                     <p className="text-[8px] font-bold text-gray-600">{sub.submittedAt?.toDate ? sub.submittedAt.toDate().toLocaleDateString() : 'LOGGED'}</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                     <span className={`text-[8px] font-black px-2 py-1 rounded-sm ${sub.status === 'approved' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-400/20 text-yellow-500'}`}>
                                        {sub.status.toUpperCase()}
                                     </span>
                                     {sub.driveLink && (
                                       <a href={sub.driveLink} target="_blank" className="p-2 hover:bg-indigo-600 rounded-lg transition-all text-white">
                                          <ExternalLink className="h-4 w-4" />
                                       </a>
                                     )}
                                  </div>
                              </div>
                            ))
                          )}
                       </div>
                    </div>

                    <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center justify-between">
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Student ID Verification</p>
                           <p className="text-white font-bold">{student?.studentId || 'NOT_GENERATED'}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Platform Access</p>
                           <p className="text-gray-400 font-bold">Enabled</p>
                        </div>
                    </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Box */}
            <div className="space-y-4 pt-6">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Operational Feedback (Required for rejections)</label>
                <Textarea 
                   value={reason}
                   onChange={e => setReason(e.target.value)}
                   placeholder="Enter decision rationale..."
                   className="bg-white/5 border-white/10 rounded-2xl min-h-[120px] focus:ring-yellow-400 text-white placeholder:text-gray-700"
                />
            </div>
        </div>

        {/* Footer */}
        <div className="p-10 border-t border-white/5 flex gap-6 bg-white/5">
            <Button 
               onClick={() => handleAction(false)}
               disabled={processing}
               className="flex-1 h-16 bg-white/5 text-white border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-500 transition-all"
            >
               Reject Request
            </Button>
            <Button 
               onClick={() => handleAction(true)}
               disabled={processing}
               className={`flex-2 h-16 ${request.type === 'revoke_internship' ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-yellow-400 text-black shadow-yellow-400/20'} rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.05] active:scale-95 transition-all w-[60%]`}
            >
               {processing ? 'Executing...' : request.type === 'revoke_internship' ? 'Confirm Revocation' : 'Authorize Internship Ready'}
            </Button>
        </div>
      </motion.div>
    </div>
  )
}

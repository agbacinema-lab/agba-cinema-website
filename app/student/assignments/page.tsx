"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { assignmentService } from "@/lib/services"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle2,
  Clock,
  RotateCcw,
  MessageSquare,
  ExternalLink,
  ChevronRight,
  Send,
  X,
  BookOpen,
  Eye,
  Info,
  Calendar,
  Layers,
  Award,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"

const getGradeLabel = (score: number) => {
  if (score >= 75) return { label: "A1 EXCELLENT", color: "text-green-600 bg-green-50" };
  if (score >= 70) return { label: "B2 CORRECTION", color: "text-indigo-600 bg-indigo-50" };
  return { label: "REDO REQUIRED", color: "text-red-600 bg-red-50" };
};

export default function StudentAssignments() {
  const { profile } = useAuth()
  const [assignments, setAssignments] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<Record<string, any>>({}) 
  const [loading, setLoading] = useState(true)
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null)
  const [submitLink, setSubmitLink] = useState("")
  const [submitNotes, setSubmitNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [previewing, setPreviewing] = useState(false)

  useEffect(() => {
    if (profile?.uid) loadData()
  }, [profile?.uid, profile?.programType, profile?.specialization])

  const loadData = async () => {
    setLoading(true)
    try {
      const all = await assignmentService.getAllAssignments()
      const mine = all.filter((a: any) => {
        const programMatch = !a.programType || a.programType === profile?.programType
        const specMatch = !a.specialization || !profile?.specialization || a.specialization === profile?.specialization
        return programMatch && specMatch
      })
      setAssignments(mine.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)))

      const subMap: Record<string, any> = {}
      await Promise.all(
        mine.map(async (a: any) => {
          try {
            const sub = await assignmentService.getSubmissionByStudent(a.id, profile?.uid || "")
            if (sub) subMap[a.id] = sub
          } catch {}
        })
      )
      setSubmissions(subMap)
    } catch (err) {
      console.error("Failed to load assignments:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!submitLink || !selectedAssignment) return
    
    setSubmitting(true)
    try {
      await assignmentService.submitAssignment(selectedAssignment.id, profile?.uid || "", {
        studentId: profile?.uid,
        studentName: profile?.name,
        submissionUrl: submitLink,
        notes: submitNotes,
      })
      toast.success("Assignment submitted successfully!")
      setSelectedAssignment(null)
      setSubmitLink("")
      setSubmitNotes("")
      setPreviewing(false)
      await loadData()
    } catch (err) {
      toast.error("Failed to submit. Please check your connection and try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const getEmbedLink = (url: string) => {
    if (url.includes("drive.google.com")) return url.replace(/\/view\?usp=sharing|\/view/g, "/preview")
    if (url.includes("youtube.com/watch?v=")) return url.replace("watch?v=", "embed/")
    if (url.includes("youtu.be/")) return url.replace("youtu.be/", "youtube.com/embed/")
    return url
  }

  const feedbackHasAction = Object.values(submissions).filter(s => s?.status === "revision_needed" || s?.status === "correction_needed").length

  return (
    <div className="space-y-8 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-tight">Academic Projects</h2>
          <p className="text-gray-500 font-medium mt-1">Striving for A1 Excellence • AGBA Cinema Standard</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-black text-white px-6 py-4 rounded-[2rem] flex items-center gap-4 shadow-xl">
            <Award className="h-5 w-5 text-yellow-400" />
            <div>
              <p className="text-[14px] font-black leading-none">{Object.values(submissions).filter(s => s.status === 'graded' && s.grade >= 75).length}</p>
              <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mt-1">A1 Approved</p>
            </div>
          </div>
          {feedbackHasAction > 0 && (
            <div className="bg-red-600 text-white px-6 py-4 rounded-[2rem] flex items-center gap-4 shadow-xl animate-pulse">
              <RotateCcw className="h-5 w-5" />
              <div>
                <p className="text-[14px] font-black leading-none">{feedbackHasAction}</p>
                <p className="text-[8px] font-black uppercase tracking-widest text-white/50 mt-1">Action Req.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-12 xl:col-span-8 space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-6">Current Coursework</p>
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-28 bg-gray-100 rounded-[2rem] animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignments.map((assignment, i) => {
                const sub = submissions[assignment.id]
                const status = sub?.status
                const isAction = status === "revision_needed" || status === "correction_needed" || status === "redo"

                return (
                  <motion.div
                    key={assignment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className={`group bg-white p-8 rounded-[2.5rem] border transition-all duration-500 flex flex-col justify-between h-full ${
                      isAction ? 'border-red-200 bg-red-50/5 ring-4 ring-red-500/5' : 'border-gray-100 hover:border-black hover:shadow-2xl'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${
                          status === 'graded' && sub.grade >= 75 ? 'bg-black text-white' :
                          status === 'correction_needed' ? 'bg-indigo-600 text-white' :
                          isAction ? 'bg-red-600 text-white animate-pulse' :
                          status === 'submitted' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-400'
                        }`}>
                          {status === 'graded' && sub.grade >= 75 ? <Award className="h-3 w-3 text-yellow-500" /> : isAction ? <RotateCcw className="h-3 w-3" /> : null}
                          {status === 'graded' && sub.grade >= 75 ? 'A1 EXCELLENT' : 
                           status === 'correction_needed' ? 'B2 CORRECTION' :
                           isAction ? 'REDO REQUIRED' : 
                           status === 'submitted' ? 'AWAITING GRADE' : 'PENDING'}
                        </span>
                      </div>
                      
                      <h4 className="text-xl font-black uppercase italic tracking-tighter leading-tight min-h-[3rem]">
                        {assignment.title}
                      </h4>
                    </div>

                    <div className="mt-8 flex items-center justify-between pt-8 border-t border-gray-50 group-hover:border-black/5">
                      <button
                        onClick={() => setSelectedAssignment(assignment)}
                        className={`flex items-center gap-2 px-8 h-12 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:scale-110 shadow-xl ${
                          isAction ? 'bg-red-600 text-white shadow-red-200' :
                          sub ? 'bg-gray-100 text-gray-900' : 'bg-black text-white hover:bg-yellow-400 hover:text-black'
                        }`}
                      >
                       {sub ? (status === 'graded' ? 'Grade Results' : 'View Submission') : 'Start Project'} <ChevronRight className="h-4 w-4" />
                      </button>
                      
                      {status === 'graded' || status === 'correction_needed' ? (
                        <div className={`px-4 py-2 rounded-2xl ${getGradeLabel(sub.grade).color}`}>
                          <p className="text-[10px] font-black uppercase">{sub.grade}%</p>
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-12 xl:col-span-4 space-y-8">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Feedback Node</p>
          
          <div className="space-y-4">
            {Object.values(submissions).filter(s => s?.feedback).length === 0 ? (
              <div className="bg-white p-12 rounded-[2.5rem] text-center border border-gray-50 opacity-50 space-y-4">
                <MessageSquare className="h-10 w-10 text-gray-200 mx-auto" />
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Awaiting evaluations.</p>
              </div>
            ) : (
              Object.values(submissions).filter(s => s?.feedback).map((sub, i) => (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className={`p-8 rounded-[2.5rem] border shadow-sm relative overflow-hidden transition-all duration-500 ${
                    sub.status === 'revision_needed' || sub.status === 'redo' ? 'bg-red-600 text-white' : 
                    sub.status === 'correction_needed' ? 'bg-indigo-600 text-white' : 'bg-white border-gray-100 hover:border-black'
                  }`}
                >
                  <p className={`text-[9px] font-black uppercase tracking-[0.3em] mb-4 ${sub.status !== 'graded' ? 'text-white/60' : 'text-indigo-500'}`}>Course Evaluation</p>
                  <blockquote className={`text-base italic font-bold leading-relaxed mb-6 ${sub.status !== 'graded' ? 'text-white' : 'text-black'}`}>
                    "{sub.feedback}"
                  </blockquote>
                  <div className="flex justify-between items-center">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${sub.status !== 'graded' ? 'text-white/40' : 'text-gray-400'}`}>Protocol Pass: {sub.grade >= 75 ? 'A1' : sub.grade >= 70 ? 'B2' : 'FAIL'}</span>
                    {sub.status !== 'graded' && <RotateCcw className="h-5 w-5 text-white animate-spin-slow" />}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedAssignment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-4 lg:p-12"
            onClick={(e) => e.target === e.currentTarget && setSelectedAssignment(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 60 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[4rem] w-full max-w-7xl shadow-2xl relative overflow-hidden max-h-[92vh] flex flex-col"
            >
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                
                <div className="p-12 lg:p-20 border-b border-gray-50 flex flex-col lg:flex-row gap-16">
                  <div className="lg:w-7/12 space-y-8">
                    <div className="flex items-center gap-4">
                      <span className="bg-black text-yellow-400 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">Official Requirement</span>
                    </div>
                    <h3 className="text-5xl lg:text-7xl font-black italic uppercase tracking-tighter leading-none">{selectedAssignment.title}</h3>
                    
                    <div className="p-10 bg-gray-50 rounded-[3rem] border border-gray-100 shadow-inner">
                      <h5 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6">Briefing Packet</h5>
                      <p className="text-xl text-gray-700 font-bold italic leading-relaxed whitespace-pre-wrap">{selectedAssignment.description}</p>
                    </div>
                  </div>

                  <div className="lg:w-5/12 space-y-10 group bg-gray-50/50 p-12 lg:p-16 rounded-[4rem] border border-gray-100">
                    <button onClick={() => setSelectedAssignment(null)} className="absolute top-12 right-12 p-4 bg-white hover:bg-black hover:text-white rounded-[2rem] shadow-xl transition-all z-10"><X className="h-8 w-8" /></button>

                    <div className="space-y-8">
                      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-3 text-black">
                          <AlertCircle className="h-6 w-6" />
                          <p className="text-[11px] font-black uppercase tracking-widest">A1 Security & Permissions</p>
                        </div>
                        <p className="text-xs text-gray-500 font-bold leading-relaxed">
                          Secure your submission link. Set Google Drive to <span className="text-black font-black">"Anyone with the link can view"</span>. 
                        </p>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Workspace URL *</label>
                          <input
                            type="url"
                            value={submitLink}
                            onChange={e => setSubmitLink(e.target.value)}
                            placeholder="https://drive.google.com/..."
                            className="w-full h-16 px-8 rounded-3xl bg-white border border-gray-200 focus:ring-[12px] ring-yellow-400/10 outline-none transition-all text-sm font-black text-indigo-600"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Protocol Notes</label>
                          <textarea
                            value={submitNotes}
                            onChange={e => setSubmitNotes(e.target.value)}
                            placeholder="Brief context for evaluation..."
                            rows={4}
                            className="w-full p-8 rounded-3xl bg-white border border-gray-200 focus:ring-[12px] ring-yellow-400/10 outline-none transition-all text-sm font-bold resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-4 pt-6">
                          <button
                            type="button"
                            onClick={() => setPreviewing(!previewing)}
                            disabled={!submitLink}
                            className={`w-full h-16 rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 ${previewing ? 'bg-indigo-600 text-white' : 'bg-white border-2 border-black text-black hover:bg-gray-50'}`}
                          >
                           <Eye className="h-5 w-5" /> {previewing ? 'Close Viewport' : 'Open Viewport'}
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleSubmit()}
                            disabled={submitting || !submitLink}
                            className="w-full h-20 bg-black text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-yellow-400 hover:text-black shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
                          >
                            {submitting ? 'Transmitting...' : 'Final Submission'} <Send className="ml-3 h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {submitLink && previewing && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 800 }} className="p-12 lg:p-20 bg-black">
                    <div className="flex items-center justify-between mb-8">
                       <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40 italic">Tutor Visual Recognition Viewport</p>
                    </div>
                    <div className="w-full h-[650px] bg-white rounded-[4rem] overflow-hidden shadow-[0_0_100px_rgba(255,255,255,0.05)]">
                      <iframe src={getEmbedLink(submitLink)} className="w-full h-full border-0" allow="autoplay; encrypted-media" />
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

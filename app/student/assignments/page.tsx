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
  ChevronRight,
  Send,
  X,
  Eye,
  Award,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"

const getGradeLabel = (score: number) => {
  if (score >= 75) return { label: "A1 EXCELLENT", color: "text-green-400 bg-green-400/10 border-green-400/20" };
  if (score >= 70) return { label: "B2 CORRECTION", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" };
  return { label: "REDO REQUIRED", color: "text-red-400 bg-red-400/10 border-red-400/20" };
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
      const { curriculumService } = await import('@/lib/services')
      const curricula = await curriculumService.getAllCurricula()

      const enrolledSpecs = profile?.enrolledSpecializations?.map((s:any) => s.value || s.title || s.id) || []
      if (profile?.specialization) enrolledSpecs.push(profile.specialization)

      const myCurriculumIds = curricula.filter(c => 
        enrolledSpecs.includes(c.specialization) || enrolledSpecs.includes(c.title) || c.specialization === profile?.specialization
      ).map(c => c.id)

      const mine = all.filter((a: any) => {
        // If the assignment is tied to a specific curriculum, check if the student is enrolled in it
        if (a.curriculumId) {
          return myCurriculumIds.includes(a.curriculumId)
        }
        // Fallback for older global assignments
        const programMatch = !a.programType || a.programType === profile?.programType
        const specMatch = !a.specialization || enrolledSpecs.includes(a.specialization)
        return programMatch && specMatch
      })

      setAssignments(mine.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)))

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

  const feedbackHasAction = Object.values(submissions).filter(s => s?.status === "revision_needed" || s?.status === "correction_needed" || s?.status === "redo").length

  return (
    <div className="space-y-12 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 bg-card border border-muted p-10 rounded-[3rem] shadow-premium">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-400 mb-2">Operational Hub</p>
          <h2 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter leading-tight text-foreground">Academic Evaluations</h2>
          <p className="text-muted-foreground font-medium mt-2">Striving for A1 Excellence • Optimized AGBA Standards</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-foreground text-background px-8 py-5 rounded-[2.5rem] flex items-center gap-5 shadow-2xl">
            <Award className="h-6 w-6 text-yellow-400" />
            <div>
              <p className="text-2xl font-black leading-none">{Object.values(submissions).filter(s => s.status === 'graded' && s.grade >= 75).length}</p>
              <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mt-2">A1 Approved</p>
            </div>
          </div>
          {feedbackHasAction > 0 && (
            <div className="bg-red-600 text-white px-8 py-5 rounded-[2.5rem] flex items-center gap-5 shadow-2xl animate-pulse ring-4 ring-red-600/20">
              <RotateCcw className="h-6 w-6" />
              <div>
                <p className="text-2xl font-black leading-none">{feedbackHasAction}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/50 mt-2">Action Required</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-12 xl:col-span-8 space-y-6">
          <div className="flex items-center gap-3 mb-2 px-2">
             <div className="w-2 h-2 rounded-full bg-yellow-400" />
             <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground">Current Deployment</p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-card border border-muted rounded-[3rem] animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assignments.map((assignment, i) => {
                const sub = submissions[assignment.id]
                const status = sub?.status
                const isAction = status === "revision_needed" || status === "correction_needed" || status === "redo"

                return (
                  <motion.div
                    key={assignment.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * i }}
                    className={`group bg-card p-10 rounded-[3rem] border transition-all duration-500 flex flex-col justify-between h-full relative overflow-hidden ${
                      isAction ? 'border-red-500/50 bg-red-500/5 ring-4 ring-red-500/5' : 'border-muted hover:border-yellow-400/50 hover:shadow-2xl hover:-translate-y-1'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-8">
                        <span className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border ${
                          status === 'graded' && sub.grade >= 75 ? 'bg-foreground text-background border-foreground' :
                          status === 'correction_needed' ? 'bg-indigo-600/10 text-indigo-400 border-indigo-600/20' :
                          isAction ? 'bg-red-600 text-white animate-pulse border-red-500 shadow-lg shadow-red-600/20' :
                          status === 'submitted' ? 'bg-yellow-400/10 text-yellow-500 border-yellow-400/20' :
                          'bg-muted/30 text-muted-foreground border-muted'
                        }`}>
                          {status === 'graded' && sub.grade >= 75 ? <Award className="h-3 w-3 text-yellow-400" /> : isAction ? <RotateCcw className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                          {status === 'graded' && sub.grade >= 75 ? 'A1 EXCELLENT' : 
                           status === 'correction_needed' ? 'B2 CORRECTION' :
                           isAction ? 'REDO REQUIRED' : 
                           status === 'submitted' ? 'SIGNAL TRANSMITTED' : 'OPERATIONAL'}
                        </span>
                      </div>
                      
                      <h4 className="text-2xl font-black uppercase italic tracking-tighter leading-tight min-h-[4rem] text-foreground">
                        {assignment.title}
                      </h4>
                    </div>

                    <div className="mt-10 flex items-center justify-between pt-10 border-t border-muted group-hover:border-yellow-400/20">
                      <button
                        onClick={() => setSelectedAssignment(assignment)}
                        className={`flex items-center gap-3 px-10 h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 shadow-xl ${
                          isAction ? 'bg-red-600 text-white shadow-red-600/20' :
                          sub ? 'bg-muted/30 text-foreground border border-muted' : 'bg-foreground text-background hover:bg-yellow-400 hover:text-black'
                        }`}
                      >
                       {sub ? (status === 'graded' || status === 'correction_needed' ? 'Evaluation Data' : 'View Protocol') : 'Initiate Project'} <ChevronRight className="h-4 w-4" />
                      </button>
                      
                      {(status === 'graded' || status === 'correction_needed') ? (
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 ${getGradeLabel(sub.grade).color}`}>
                          <p className="text-sm font-black italic">{sub.grade}%</p>
                        </div>
                      ) : null}
                    </div>
                    
                    {selectedAssignment?.id === assignment.id && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 blur-[50px] -mr-16 -mt-16" />
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-12 xl:col-span-4 space-y-8">
          <div className="flex items-center gap-3 mb-2 px-2">
             <div className="w-2 h-2 rounded-full bg-indigo-500" />
             <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground">Evaluation Log</p>
          </div>
          
          <div className="space-y-6">
            {Object.values(submissions).filter(s => s?.feedback).length === 0 ? (
              <div className="bg-card p-16 rounded-[3rem] text-center border border-muted border-dashed opacity-50 space-y-6">
                <div className="w-16 h-16 bg-muted/20 rounded-[2rem] flex items-center justify-center mx-auto">
                   <MessageSquare className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground leading-relaxed">No tactical feedback<br/>received yet.</p>
              </div>
            ) : (
              Object.values(submissions).filter(s => s?.feedback).map((sub, i) => (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className={`p-10 rounded-[3rem] border shadow-2xl relative overflow-hidden transition-all duration-500 group ${
                    sub.status === 'revision_needed' || sub.status === 'redo' ? 'bg-red-600 text-white' : 
                    sub.status === 'correction_needed' ? 'bg-indigo-600 text-white' : 'bg-card border-muted hover:border-yellow-400/30'
                  }`}
                >
                  <div className="flex justify-between items-center mb-6">
                     <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${sub.status !== 'graded' && sub.status !== 'submitted' ? 'text-white/60' : 'text-indigo-400'}`}>Evaluation Unit</p>
                     {sub.status === 'graded' && sub.grade >= 75 && <Award className="h-4 w-4 text-yellow-400" />}
                  </div>
                  <blockquote className={`text-lg italic font-bold leading-relaxed mb-8 ${sub.status !== 'graded' && sub.status !== 'submitted' ? 'text-white' : 'text-foreground'}`}>
                    "{sub.feedback}"
                  </blockquote>
                  <div className="flex justify-between items-center pt-6 border-t border-white/10">
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${sub.status !== 'graded' && sub.status !== 'submitted' ? 'text-white/40' : 'text-muted-foreground'}`}>
                       Result Code: <span className={sub.status !== 'graded' && sub.status !== 'submitted' ? 'text-white' : 'text-foreground'}>{sub.grade >= 75 ? 'A1' : sub.grade >= 70 ? 'B2' : 'F-REDO'}</span>
                    </span>
                    {(sub.status === 'revision_needed' || sub.status === 'redo') && <RotateCcw className="h-4 w-4 text-white/50 animate-spin-slow" />}
                  </div>
                  <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/5 blur-[50px] group-hover:scale-150 transition-transform duration-700" />
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
            className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-6 lg:p-12"
            onClick={(e) => e.target === e.currentTarget && setSelectedAssignment(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 60 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-card border border-muted rounded-[4rem] w-full max-w-7xl shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden max-h-[92vh] flex flex-col"
            >
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                
                <div className="p-12 lg:p-24 flex flex-col lg:flex-row gap-20">
                  <div className="lg:w-7/12 space-y-10">
                    <div className="flex items-center gap-4">
                      <span className="bg-foreground text-background px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.4em]">Official Project Brief</span>
                    </div>
                    <h3 className="text-5xl lg:text-7xl font-black italic uppercase tracking-tighter leading-none text-foreground">{selectedAssignment.title}</h3>
                    
                    <div className="p-12 bg-muted/20 rounded-[3.5rem] border border-muted shadow-inner relative overflow-hidden group">
                      <div className="relative z-10">
                         <h5 className="text-[12px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 mb-8 flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" /> Operational Objectives
                         </h5>
                         <p className="text-2xl text-foreground font-bold italic leading-relaxed whitespace-pre-wrap">{selectedAssignment.description}</p>
                      </div>
                      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 blur-[60px] -mr-32 -mt-32 transition-all duration-1000 group-hover:scale-150" />
                    </div>
                  </div>

                  <div className="lg:w-5/12 space-y-12 bg-muted/10 p-12 lg:p-20 rounded-[4.5rem] border border-muted shadow-2xl relative overflow-hidden">
                    <button onClick={() => setSelectedAssignment(null)} 
                       className="absolute top-10 right-10 p-5 bg-card border border-muted hover:bg-foreground hover:text-background rounded-[2.5rem] shadow-xl transition-all z-20 group active:scale-95"
                    >
                       <X className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
                    </button>

                    <div className="space-y-10 relative z-10">
                      <div className="bg-card p-10 rounded-[3rem] border border-muted shadow-lg space-y-6">
                        <div className="flex items-center gap-4 text-foreground">
                          <div className="w-10 h-10 bg-yellow-400/10 rounded-2xl flex items-center justify-center border border-yellow-400/20">
                             <AlertCircle className="h-5 w-5 text-yellow-400" />
                          </div>
                          <p className="text-[11px] font-black uppercase tracking-widest">Protocol Permissions</p>
                        </div>
                        <p className="text-sm text-muted-foreground font-medium leading-relaxed italic">
                           Ensure your host credentials are set to <span className="text-foreground font-black">"Anyone with the link can view"</span> before transmitting.
                        </p>
                      </div>

                      <div className="space-y-8">
                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-6">Deployment URL *</label>
                          <input
                            type="url"
                            value={submitLink}
                            onChange={e => setSubmitLink(e.target.value)}
                            placeholder="https://drive.google.com/..."
                            className="w-full h-20 px-10 rounded-[2.5rem] bg-card border border-muted focus:border-yellow-400/50 focus:ring-[15px] ring-yellow-400/5 outline-none transition-all text-base font-bold text-foreground placeholder:text-muted-foreground/30 shadow-inner"
                          />
                        </div>

                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-6">Liaison Notes</label>
                          <textarea
                            value={submitNotes}
                            onChange={e => setSubmitNotes(e.target.value)}
                            placeholder="Contextual data for the evaluator..."
                            rows={4}
                            className="w-full p-10 rounded-[2.5rem] bg-card border border-muted focus:border-yellow-400/50 focus:ring-[15px] ring-yellow-400/5 outline-none transition-all text-base font-bold text-foreground placeholder:text-muted-foreground/30 shadow-inner resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-6 pt-10">
                          <button
                            type="button"
                            onClick={() => setPreviewing(!previewing)}
                            disabled={!submitLink}
                            className={`w-full h-20 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 active:scale-95 ${previewing ? 'bg-indigo-600 text-white shadow-[0_0_30px_rgba(79,70,229,0.3)]' : 'bg-card border-2 border-muted text-foreground hover:border-foreground'}`}
                          >
                           <Eye className="h-6 w-6" /> {previewing ? 'Close Viewport' : 'Open Viewport'}
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleSubmit()}
                            disabled={submitting || !submitLink}
                            className={`w-full h-24 rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.5em] transition-all shadow-2xl active:scale-95 disabled:opacity-40 flex items-center justify-center gap-4 ${submitting ? 'bg-muted text-muted-foreground' : 'bg-foreground text-background hover:bg-yellow-400 hover:text-black hover:shadow-[0_20px_50px_rgba(250,204,21,0.25)] hover:-translate-y-1'}`}
                          >
                            {submitting ? 'Transmitting...' : 'Initiate Submission'} <Send className="h-6 w-6" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {submitLink && previewing && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="p-12 lg:p-24 bg-black/40 border-t border-muted">
                    <div className="flex items-center justify-between mb-10">
                       <div className="flex items-center gap-4">
                          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/40 italic">Live Evaluation Reconnaissance Viewport</p>
                       </div>
                       <button onClick={() => setPreviewing(false)} className="text-white/40 hover:text-white transition-colors"><X className="h-6 w-6" /></button>
                    </div>
                    <div className="w-full aspect-video lg:h-[800px] bg-card rounded-[4rem] overflow-hidden shadow-[0_0_150px_rgba(250,204,21,0.05)] border-4 border-muted/20 transition-colors">
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

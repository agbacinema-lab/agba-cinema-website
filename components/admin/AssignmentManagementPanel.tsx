"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  ClipboardList,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  RefreshCw,
  User,
  Eye,
  X,
  Award,
  ArrowLeft,
  AlertCircle,
  ShieldCheck
} from "lucide-react"
import { assignmentService, studentService, adminService } from "@/lib/services"
import { useAuth } from "@/context/AuthContext"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

// ─── INTERNAL VIEWER ──────────────────────────────────────────────────────────
function InternalViewer({ url, onClose }: { url: string; onClose: () => void }) {
  let embedUrl = url;
  if (url.includes("drive.google.com")) {
    const matches = url.match(/\/d\/(.+?)\/|\/d\/(.+?)$|id=(.+?)&|id=(.+?)$/)
    const fileId = matches ? (matches[1] || matches[2] || matches[3] || matches[4]) : null
    if (fileId) embedUrl = `https://drive.google.com/file/d/${fileId}/preview`
  } else if (url.includes("youtube.com/watch?v=")) {
    embedUrl = url.replace("watch?v=", "embed/")
  } else if (url.includes("youtu.be/")) {
    embedUrl = url.replace("youtu.be/", "youtube.com/embed/")
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[9999] flex flex-col"
    >
      <div className="w-full px-8 h-24 flex justify-between items-center border-b border-white/10">
        <div className="flex items-center gap-6">
          <button onClick={onClose} className="flex items-center gap-3 bg-foreground text-background px-8 h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-yellow-400 hover:text-black transition-all shadow-2xl">
            <ArrowLeft className="h-4 w-4" /> Exit Review
          </button>
          <div>
            <h3 className="text-foreground font-black italic uppercase tracking-widest text-[11px]">Tutor Evaluation Workspace</h3>
            <p className="text-muted-foreground text-[9px] font-black uppercase tracking-[0.4em]">Protocol: A1-SECURE-VIEW</p>
          </div>
        </div>
        <button onClick={onClose} className="group p-4 bg-red-500/10 hover:bg-red-500 rounded-2xl text-red-500 hover:text-white transition-all">
          <X className="h-6 w-6 group-hover:rotate-90 transition-transform" />
        </button>
      </div>
      <div className="flex-1 p-8">
        <div className="w-full h-full bg-card rounded-[3rem] overflow-hidden shadow-2xl border border-muted">
          <iframe src={embedUrl} className="w-full h-full border-0" allow="autoplay; encrypted-media" allowFullScreen
            sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox" />
        </div>
      </div>
    </motion.div>
  )
}

// ─── Grading Logic ────────────────────────────────────────────────────────────
const getGradeCategory = (score: number) => {
  if (score >= 75) return { label: "A1 (Pass)", status: "graded", color: "text-green-600" }
  if (score >= 70) return { label: "B2 (Correction)", status: "correction_needed", color: "text-indigo-600" }
  return { label: "Redo Required", status: "revision_needed", color: "text-red-600" }
}

// ─── Main Panel ───────────────────────────────────────────────────────────────
export default function AssignmentManagementPanel() {
  const { profile, isSuperAdmin } = useAuth()
  const [assignments, setAssignments] = useState<any[]>([])
  const [myStudentIds, setMyStudentIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null)
  const [submissions, setSubmissions] = useState<Record<string, any[]>>({})
  const [loadingSubmissions, setLoadingSubmissions] = useState<Record<string, boolean>>({})
  const [gradingId, setGradingId] = useState<string | null>(null)
  const [gradeData, setGradeData] = useState<{ grade: string; feedback: string }>({ grade: "", feedback: "" })
  const [viewingUrl, setViewingUrl] = useState<string | null>(null)

  useEffect(() => {
    if (profile?.uid) loadData()
  }, [profile?.uid])

  const loadData = async () => {
    setLoading(true)
    try {
      const [assignmentData, myStudents] = await Promise.all([
        assignmentService.getAllAssignments(),
        isSuperAdmin ? Promise.resolve([]) : studentService.getStudentsByTutor(profile?.uid || "")
      ])
      setAssignments(assignmentData)
      // Super admins see EVERYTHING; tutors only see their assigned students
      if (!isSuperAdmin) {
        setMyStudentIds(new Set(myStudents.map((s: any) => s.uid)))
      }
    } catch (error) {
      console.error("Error loading panel:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAssignment = async (assignmentId: string) => {
    if (expandedAssignment === assignmentId) { setExpandedAssignment(null); return }
    setExpandedAssignment(assignmentId)
    if (!submissions[assignmentId]) loadSubs(assignmentId)
  }

  const loadSubs = async (assignmentId: string) => {
    setLoadingSubmissions(prev => ({ ...prev, [assignmentId]: true }))
    try {
      const data = await assignmentService.getSubmissions(assignmentId)
      // ── KEY FILTER: If tutor (not super admin), only show their assigned students' work
      const filtered = isSuperAdmin
        ? data
        : data.filter((sub: any) => myStudentIds.has(sub.studentId))
      setSubmissions(prev => ({ ...prev, [assignmentId]: filtered }))
    } catch (error) {
      console.error("Error loading submissions:", error)
    } finally {
      setLoadingSubmissions(prev => ({ ...prev, [assignmentId]: false }))
    }
  }

  const handleGrade = async (assignmentId: string, submissionId: string, submission: any) => {
    const score = Number(gradeData.grade)
    if (!gradeData.grade || !gradeData.feedback) { toast.error("Score and feedback are required."); return }
    const { status, label } = getGradeCategory(score)
    try {
      await assignmentService.gradeSubmission(assignmentId, submissionId, score, gradeData.feedback, status as any)

      // ── EMAIL NOTIFICATION ──────────────────────────────────────────────────
      try {
        const student = await adminService.getUserById(submission.studentUID || submission.studentId);
        if (student?.email) {
          await fetch("/api/notifications/email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to_email: student.email,
              to_name: student.name ?? "Academy Student",
              subject: `Evaluation Result: ${label}`,
              message: `Your project for ${assignmentId} has been graded by a tutor.`,
              template_params: {
                grade: `${score}%`,
                status: label,
                feedback: gradeData.feedback,
                assignment_title: assignments.find(a => a.id === assignmentId)?.title || "Your Project"
              }
            })
          });
        }
      } catch (emailErr) {
        console.error("Email notification failed", emailErr);
      }

      toast.success(`Project finalized as ${label}!`)
      setGradingId(null)
      setGradeData({ grade: "", feedback: "" })
      loadSubs(assignmentId)
    } catch (error) {
      toast.error("Failed to grade: " + (error as any).message)
    }
  }

  const statusColor = (status: string) => {
    if (status === "graded") return "bg-green-100 text-green-700"
    if (status === "correction_needed") return "bg-indigo-100 text-indigo-700"
    if (status === "revision_needed" || status === "redo") return "bg-red-100 text-red-700"
    return "bg-yellow-100 text-yellow-800"
  }

  if (loading) return (
    <div className="flex items-center justify-center h-[70vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400" />
    </div>
  )

  return (
    <div className="space-y-8 pb-32">
      <div className="flex justify-between items-end">
        <div className="space-y-4">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-foreground">Academic Evaluation</h2>
          <p className="text-muted-foreground font-medium">A1 Excellence Protocol — 75%+ Required</p>
          {!isSuperAdmin && (
            <div className="flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 px-6 py-3 rounded-2xl w-fit">
              <ShieldCheck className="h-4 w-4 text-indigo-500" />
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                Scope: Your Assigned Students Only ({myStudentIds.size} enrolled)
              </p>
            </div>
          )}
        </div>
        <Button 
          variant="ghost" 
          onClick={loadData} 
          className="rounded-[1.5rem] flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] bg-muted/20 hover:bg-yellow-400 hover:text-black hover:scale-105 active:scale-95 transition-all h-14 px-8 border border-muted/50 text-foreground shadow-lg"
        >
          <RefreshCw className="h-4 w-4" /> Nexus Refresh
        </Button>
      </div>

      {assignments.length === 0 ? (
        <Card className="border border-muted shadow-sm rounded-[3rem] bg-card p-20 text-center transition-colors">
          <ClipboardList className="h-16 w-16 mx-auto mb-4 text-muted/20" />
          <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">No assignments found.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {assignments.map((assignment) => {
            const isOpen = expandedAssignment === assignment.id
            const subs = submissions[assignment.id] || []
            const pendingCount = subs.filter(s => s.status === "submitted").length

            return (
              <motion.div key={assignment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className={`border border-muted shadow-premium rounded-[3rem] overflow-hidden transition-all duration-700 bg-card ${isOpen ? 'ring-[8px] ring-yellow-400/5' : 'hover:shadow-2xl hover:-translate-y-1'}`}>
                  <CardHeader className="cursor-pointer p-10 lg:p-14 hover:bg-muted/10 transition-colors relative group" onClick={() => toggleAssignment(assignment.id)}>
                    <div className="flex justify-between items-start gap-10 relative z-10">
                      <div className="flex-1 space-y-6">
                        <div className="flex items-center gap-4">
                          <span className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                            assignment.programType === 'gopro' 
                              ? 'bg-yellow-400/10 text-yellow-500 border-yellow-400/20' 
                              : 'bg-indigo-600/10 text-indigo-400 border-indigo-600/20'
                          }`}>
                            {assignment.programType === 'gopro' ? 'PRO TRACK' : 'ELITE MENTORSHIP'}
                          </span>
                          {pendingCount > 0 && (
                            <span className="bg-red-600 text-white px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] animate-pulse shadow-lg shadow-red-600/20">
                              {pendingCount} SIGNAL{pendingCount > 1 ? 'S' : ''} PENDING
                            </span>
                          )}
                        </div>
                        <h3 className="text-4xl lg:text-5xl font-black uppercase italic tracking-tighter leading-none text-foreground transition-colors">{assignment.title}</h3>
                        <p className="text-muted-foreground text-base font-medium italic line-clamp-1 opacity-70 group-hover:opacity-100 transition-opacity">{assignment.description}</p>
                      </div>
                      <div className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center transition-all duration-500 shadow-xl border ${
                        isOpen 
                          ? 'bg-foreground text-background border-foreground scale-110 rotate-180' 
                          : 'bg-muted/20 text-muted-foreground border-muted group-hover:bg-yellow-400 group-hover:text-black group-hover:border-yellow-400'
                      }`}>
                        {isOpen ? <ChevronUp className="h-8 w-8" /> : <ChevronDown className="h-8 w-8" />}
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[80px] pointer-events-none" />
                  </CardHeader>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                        <CardContent className="px-10 lg:px-14 pb-14 pt-0 border-t border-muted bg-muted/5 transition-colors">
                          {loadingSubmissions[assignment.id] ? (
                            <div className="py-24 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400" /></div>
                          ) : subs.length === 0 ? (
                            <div className="py-24 text-center space-y-6">
                              <div className="w-20 h-20 bg-muted/10 rounded-[2rem] flex items-center justify-center mx-auto border border-muted/20 shadow-inner">
                                 <User className="h-10 w-10 text-muted-foreground/20" />
                              </div>
                              <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-[10px] italic">
                                {!isSuperAdmin && myStudentIds.size === 0
                                  ? "Nexus Offline: No students are currently assigned to your evaluation unit."
                                  : "Signal Clear: No submissions detected for your assigned personnel."
                                }
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-6 pt-10">
                              {subs.map((submission) => (
                                <div key={submission.id} className="bg-muted/30 border border-muted rounded-[3rem] p-10 group hover:bg-card hover:shadow-2xl transition-all duration-500">
                                  <div className="flex flex-col lg:flex-row justify-between items-start gap-14">
                                    <div className="flex-grow space-y-10">
                                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                                        <div className="flex items-center gap-6">
                                          <div className="w-20 h-20 bg-foreground text-background rounded-[1.8rem] flex items-center justify-center shadow-2xl transition-colors group-hover:bg-yellow-400 group-hover:text-black">
                                            <User className="h-10 w-10" />
                                          </div>
                                          <div>
                                            <p className="text-2xl font-black uppercase tracking-tighter text-foreground italic">{submission.studentName || 'Academy Student'}</p>
                                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.4em] mt-1">NEXUS ID: {submission.studentId?.slice(-10).toUpperCase()}</p>
                                          </div>
                                        </div>
                                        <span className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl border ${statusColor(submission.status).replace('bg-', 'bg-').replace('text-', 'text-')}`}>
                                          {submission.status?.replace('_', ' ')}
                                        </span>
                                      </div>

                                      <div className="flex flex-wrap gap-4">
                                        <button
                                          onClick={() => setViewingUrl(submission.submissionUrl)}
                                          className="flex items-center gap-3 bg-foreground text-background px-10 h-16 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all hover:bg-yellow-400 hover:text-black hover:scale-105 active:scale-95 shadow-2xl"
                                        >
                                          <Eye className="h-5 w-5" /> View Project
                                        </button>
                                        <div className="px-8 h-16 rounded-[1.5rem] border-2 border-dashed border-muted flex items-center gap-3">
                                          <AlertCircle className="h-5 w-5 text-muted/30" />
                                          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Internal Secured Stream</p>
                                        </div>
                                      </div>

                                      {submission.status !== 'submitted' && (
                                        <div className="p-8 bg-card rounded-[2rem] border border-muted flex items-center justify-between shadow-sm transition-colors">
                                          <div className="flex items-center gap-5">
                                            <Award className={`h-8 w-8 ${getGradeCategory(submission.grade).color}`} />
                                            <div>
                                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Grade on Record</p>
                                              <p className={`text-2xl font-black ${getGradeCategory(submission.grade).color}`}>
                                                {submission.grade}% — {getGradeCategory(submission.grade).label}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    <div className="w-full lg:w-[450px] lg:pl-12 lg:border-l border-muted transition-colors">
                                      {gradingId === submission.id ? (
                                        <div className="space-y-8">
                                          <div className="space-y-3">
                                            <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-4">Score (%)</label>
                                            <Input
                                              type="number"
                                              value={gradeData.grade}
                                              onChange={(e) => setGradeData(prev => ({ ...prev, grade: e.target.value }))}
                                              className="h-16 rounded-[1.5rem] border-muted bg-muted/30 shadow-inner font-black text-xl text-foreground px-8"
                                              placeholder="0-100"
                                            />
                                          </div>
                                          <div className="space-y-3">
                                            <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-4">Evaluation Feedback</label>
                                            <Textarea
                                              value={gradeData.feedback}
                                              onChange={(e) => setGradeData(prev => ({ ...prev, feedback: e.target.value }))}
                                              placeholder="Constructive feedback for student..."
                                              className="min-h-[200px] rounded-[2rem] border-muted bg-muted/30 p-10 font-medium text-base leading-relaxed text-foreground"
                                            />
                                          </div>
                                          <div className="flex flex-col gap-4 pt-4">
                                            <Button
                                              onClick={() => handleGrade(assignment.id, submission.id, submission)}
                                              className="w-full bg-foreground text-background font-black h-20 rounded-[1.5rem] hover:bg-yellow-400 hover:text-black transition-all shadow-2xl uppercase tracking-widest text-xs"
                                            >
                                              Commit Evaluation
                                            </Button>
                                            <button onClick={() => setGradingId(null)} className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-red-500 transition-colors py-2 text-center">
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="space-y-6">
                                          <Button
                                            onClick={() => {
                                              setGradingId(submission.id)
                                              setGradeData({ grade: String(submission.grade || ""), feedback: submission.feedback || "" })
                                            }}
                                            className="w-full bg-foreground text-background font-black h-20 rounded-[1.5rem] shadow-xl hover:bg-yellow-400 hover:text-black transition-all uppercase tracking-widest text-[11px]"
                                          >
                                            <Award className="h-5 w-5 mr-4 text-yellow-400" />
                                            {submission.status === 'submitted' ? 'Grade This Project' : 'Modify Grade'}
                                          </Button>
                                          <div className="p-6 bg-muted/50 rounded-[1.5rem] text-center border border-muted transition-colors">
                                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">A1 = 75%+ | B2 = 70–74% | Redo = Below 70%</p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      <AnimatePresence>
        {viewingUrl && <InternalViewer url={viewingUrl} onClose={() => setViewingUrl(null)} />}
      </AnimatePresence>
    </div>
  )
}

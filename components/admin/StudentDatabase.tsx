"use client"

import { useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import { collection, query, getDocs, where, orderBy } from "firebase/firestore"
import { adminService, assignmentService, notificationService } from "@/lib/services"
import { useAuth } from "@/context/AuthContext"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { 
  Users, Search, ExternalLink, Play, 
  CheckCircle2, XCircle, Clock, 
  GraduationCap, BookOpen, BarChart3,
  ArrowRight, ShieldCheck, User, Check, X,
  ArrowLeft
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import RevokeReasonDialog from "./RevokeReasonDialog"

// Internal Viewer for integrated grading
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[9999] flex flex-col">
      <div className="w-full px-8 h-24 flex justify-between items-center border-b border-white/10">
        <div className="flex items-center gap-6">
          <button onClick={onClose} className="flex items-center gap-3 bg-foreground text-background px-8 h-14 rounded-2xl font-black tracking-[0.2em] text-[10px] hover:bg-yellow-400 hover:text-black transition-all shadow-2xl">
            <ArrowLeft className="h-4 w-4" /> Exit review
          </button>
          <div className="text-left">
            <h3 className="text-white font-black tracking-widest text-[11px] uppercase">Reviewing Intelligence Asset</h3>
            <p className="text-gray-500 text-[9px] font-black tracking-[0.4em]">ADMIN_OVERRIDE_ACTIVE</p>
          </div>
        </div>
        <button onClick={onClose} className="p-4 bg-red-500/10 hover:bg-red-500 rounded-2xl text-red-500 hover:text-white transition-all">
          <X className="h-6 w-6" />
        </button>
      </div>
      <div className="flex-1 p-8">
        <div className="w-full h-full bg-card rounded-[3rem] overflow-hidden shadow-2xl border border-white/10">
          <iframe src={embedUrl} className="w-full h-full border-0" allow="autoplay; encrypted-media" allowFullScreen />
        </div>
      </div>
    </motion.div>
  )
}

export default function StudentDatabase() {
  const { profile: currentAdmin } = useAuth()
  const [students, setStudents] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [assignmentMap, setAssignmentMap] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [activeFilter, setActiveFilter] = useState<'all' | 'ready' | 'active'>('all')
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([])
  
  const [viewingUrl, setViewingUrl] = useState<string | null>(null)
  const [gradingId, setGradingId] = useState<string | null>(null)
  const [gradeData, setGradeData] = useState({ grade: "75", feedback: "" })
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)
  const [revokingStudent, setRevokingStudent] = useState<any>(null)

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const [userSnap, assignSnap, approvalSnap] = await Promise.all([
        getDocs(query(collection(db, "users"), where("role", "==", "student"))),
        getDocs(collection(db, "assignments")),
        getDocs(query(collection(db, "approvals"), where("status", "==", "pending")))
      ])
      
      const stList = userSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      const asList = assignSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      const appList = approvalSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      
      setStudents(stList)
      setAssignments(asList)
      setPendingApprovals(appList)
      
      const map: Record<string, any> = {}
      asList.forEach(a => { map[a.id] = a })
      setAssignmentMap(map)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadStudentDetails = async (student: any) => {
    setSelectedStudent(student)
    try {
      const subCol = collection(db, "submissions")
      const q = query(subCol, where("studentUID", "==", student.uid), orderBy("submittedAt", "desc"))
      const snap = await getDocs(q)
      setSubmissions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    } catch (err) {
      console.error(err)
      const qAlt = query(collection(db, "submissions"), where("studentUID", "==", student.uid))
      const snapAlt = await getDocs(qAlt)
      setSubmissions(snapAlt.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }
  }

  const getLateStatus = (sub: any) => {
    const assignment = assignmentMap[sub.assignmentId] || assignmentMap[sub.assignmentRef]
    if (!assignment?.dueDate || !sub.submittedAt) return null
    
    const due = assignment.dueDate?.toMillis?.() || new Date(assignment.dueDate).getTime()
    const submitted = sub.submittedAt?.toMillis?.() || new Date(sub.submittedAt).getTime()
    
    if (submitted > due) {
      const diff = submitted - due
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      
      if (days > 0) return `${days}d ${hours}h late`
      return `${hours}h late`
    }
    return null
  }

  const handleGrade = async (sub: any, approved: boolean) => {
    if (!gradeData.feedback && !approved) { toast.error("Feedback is required for re-dos."); return }
    const score = approved ? 75 : 40
    const status = approved ? "approved" : "redo"
    
    try {
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore')
      await updateDoc(doc(db, "submissions", sub.id), {
        status,
        grade: score,
        feedback: gradeData.feedback || "Approved via Leadership Review",
        gradedAt: serverTimestamp(),
        gradedBy: "Management"
      })

      // Also notify student
      await notificationService.sendNotification({
        recipientId: sub.studentUID,
        title: approved ? "PROJECT APPROVED" : "REVISION REQUIRED",
        message: `Your work on ${sub.assignmentTitle} has been reviewed by the Director. Status: ${status.toUpperCase()}`,
        type: 'assignment_update'
      })

      toast.success(approved ? "Work validated!" : "Revision requested.")
      setGradingId(null)
      setGradeData({ grade: "75", feedback: "" })
      loadStudentDetails(selectedStudent)
    } catch (err) {
      toast.error("Failed to update submission.")
    }
  }

  const handleApproveStudent = async (userId: string, isApprove: boolean) => {
    if (!currentAdmin) return
    const request = pendingApprovals.find(a => 
      (a.type === 'internship_ready' || a.type === 'revoke_internship') && 
      a.data?.userId === userId && 
      a.status === 'pending'
    )
    if (!request) return
    try {
      setLoading(true)
      await adminService.processApproval(
        request.id, 
        isApprove, 
        { uid: currentAdmin.uid, name: currentAdmin.name, email: currentAdmin.email },
        isApprove ? undefined : "Declined by admin"
      )
      toast.success(isApprove ? "Status change approved!" : "Request rejected")
      window.location.reload()
    } catch (err) {
      toast.error("Operation failed")
    } finally {
      setLoading(false)
    }
  }

  const handleRevokeStudent = async (userId: string) => {
    if (!currentAdmin) return
    try {
      if (currentAdmin.role === 'super_admin' || currentAdmin.role === 'director') {
        setLoading(true)
        await adminService.revokeInternshipReadiness(userId)
        toast.success("Ready status revoked instantly")
        window.location.reload()
      } else {
        setRevokingStudent(selectedStudent)
        setRevokeDialogOpen(true)
      }
    } catch (err) {
      toast.error("Process failed")
    } finally {
      setLoading(false)
    }
  }

  const confirmRevocation = async (reason: string) => {
    if (!currentAdmin || !revokingStudent) return
    try {
      setLoading(true)
      await adminService.createApprovalRequest({
         type: 'revoke_internship',
         requestBy: { uid: currentAdmin.uid, name: currentAdmin.name, email: currentAdmin.email },
         data: { userId: revokingStudent.id, userName: revokingStudent.name, reason: reason }
      })
      toast.success("Revoke request sent for Super Admin approval")
      window.location.reload()
    } catch (err) {
      toast.error("Process failed")
    } finally {
      setLoading(false)
    }
  }

  const handleNominateStudent = async (student: any) => {
    if (!currentAdmin) return
    try {
      setLoading(true)
      if (currentAdmin.role === 'super_admin' || currentAdmin.role === 'director') {
        await adminService.setInternshipStatus(student.id, 'internship_ready')
        toast.success("Student approved for internship instantly")
        window.location.reload()
      } else {
        await adminService.createApprovalRequest({
          type: 'internship_ready',
          requestBy: { uid: currentAdmin.uid, name: currentAdmin.name, email: currentAdmin.email },
          data: { userId: student.id, userName: student.name }
        })
        toast.success("Nomination request sent for Super Admin approval")
        window.location.reload()
      }
    } catch (err) {
      toast.error("Nomination failed")
    } finally {
      setLoading(false)
    }
  }

  const filtered = students.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = activeFilter === 'all' ? true : 
                          activeFilter === 'ready' ? s.status === 'internship_ready' :
                          s.status !== 'internship_ready'
    return matchesSearch && matchesFilter
  })

  if (loading) return <div className="p-12 text-center text-gray-500 font-bold uppercase tracking-widest">Accessing Talent Records...</div>

  return (
    <div className="space-y-8 pb-20">
      <AnimatePresence>
        {viewingUrl && <InternalViewer url={viewingUrl} onClose={() => setViewingUrl(null)} />}
      </AnimatePresence>

      {/* Search & Stats Header */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2 relative group">
           <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-yellow-400 transition-colors" />
           <input 
             type="text" 
             placeholder="Search by name, email or ID..."
             className="w-full h-16 pl-16 pr-8 bg-card border border-muted rounded-[2rem] text-sm font-black tracking-widest outline-none focus:border-yellow-400 transition-all shadow-premium"
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
        <div className="flex bg-card border border-muted rounded-[2rem] p-1 shadow-premium">
           <button onClick={() => setActiveFilter('all')} className={`flex-1 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === 'all' ? 'bg-yellow-400 text-black' : 'text-gray-500 hover:text-white'}`}>All</button>
           <button onClick={() => setActiveFilter('active')} className={`flex-1 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === 'active' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-white'}`}>Active</button>
           <button onClick={() => setActiveFilter('ready')} className={`flex-1 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === 'ready' ? 'bg-green-600 text-white' : 'text-gray-500 hover:text-white'}`}>Ready</button>
        </div>
        <div className="bg-black border border-white/10 rounded-[2rem] p-4 flex items-center justify-between shadow-premium">
           <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Total Talent</p>
              <p className="text-2xl font-black text-white">{students.length}</p>
           </div>
           <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center text-black">
              <Users className="h-6 w-6" />
           </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map(s => (
          <motion.div 
            key={s.id}
            layoutId={s.id}
            onClick={() => loadStudentDetails(s)}
            className="group bg-card border border-muted hover:border-yellow-400 rounded-[2.5rem] p-8 transition-all duration-300 cursor-pointer relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-2xl overflow-hidden border border-white/5 shadow-inner">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${s.uid}`} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-lg font-black text-white tracking-tighter leading-tight">{s.name}</h3>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{s.programType || 'ACADEMY'}</p>
                    </div>
                </div>
                {s.status === 'internship_ready' && (
                    <div className="bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-[8px] font-black tracking-widest border border-green-500/20">READY</div>
                )}
            </div>

            <div className="space-y-4">
                <p className="text-[10px] text-gray-400 font-medium italic line-clamp-1 opacity-60 text-left">"Focused on mastering {s.specialization?.replace('-', ' ') || 'creative excellence'}."</p>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex -space-x-2">
                         {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-lg bg-white/5 border border-black flex items-center justify-center text-[8px] font-black text-gray-600">A</div>)}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-yellow-400 uppercase tracking-tighter">
                        View Dossier <ArrowRight className="h-3 w-3" />
                    </div>
                </div>
            </div>

            <div className="absolute inset-0 bg-yellow-400/0 group-hover:bg-yellow-400/[0.02] transition-colors" />
          </motion.div>
        ))}
      </div>

      {/* Detail Overlay */}
      <AnimatePresence>
        {selectedStudent && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              layoutId={selectedStudent.id}
              className="fixed inset-y-0 right-0 z-[101] w-full max-w-5xl bg-black border-l border-white/10 shadow-2xl flex flex-col overflow-hidden"
            >
               {/* Detail Header */}
               <div className="p-10 border-b border-white/10 bg-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-8">
                     <button onClick={() => setSelectedStudent(null)} className="p-3 hover:bg-white/10 rounded-xl text-gray-500"><XCircle className="h-6 w-6" /></button>
                     <div className="w-20 h-20 bg-yellow-400 rounded-[2rem] flex items-center justify-center text-black shadow-xl">
                        <GraduationCap className="h-10 w-10" />
                     </div>
                     <div className="text-left">
                        <h2 className="text-4xl font-black tracking-tighter text-white">{selectedStudent.name}</h2>
                        <div className="flex items-center gap-4 mt-2">
                           <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Student ID: {selectedStudent.studentId || 'PENDING'}</span>
                           <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500">{selectedStudent.specialization?.replace('-', ' ')}</span>
                        </div>
                     </div>
                  </div>
                   <div className="flex flex-col items-end gap-4">
                      <div className="flex flex-col items-end">
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1 leading-none">Deployment Status</p>
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest ${selectedStudent.status === 'internship_ready' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-400/20 text-yellow-500'}`}>
                            {selectedStudent.status?.toUpperCase().replace('_', ' ')}
                          </span>
                      </div>

                        <div className="flex gap-2">
                            {selectedStudent.status === 'internship_ready' ? (
                              pendingApprovals.find(a => a.type === 'revoke_internship' && a.data?.userId === selectedStudent.id) ? (
                                (currentAdmin?.role === 'super_admin' || currentAdmin?.role === 'director') ? (
                                   <div className="flex gap-2">
                                      <Button onClick={() => handleApproveStudent(selectedStudent.id, true)} className="bg-green-600 text-white h-10 px-6 rounded-xl font-black text-[9px] uppercase tracking-widest">Approve Revoke</Button>
                                      <Button onClick={() => handleApproveStudent(selectedStudent.id, false)} className="bg-white/10 text-gray-400 h-10 px-6 rounded-xl font-black text-[9px] uppercase tracking-widest">Reject Revoke</Button>
                                   </div>
                                ) : (
                                   <Button disabled className="bg-red-500/10 text-red-500 border border-red-500/10 h-10 px-6 rounded-xl font-black text-[9px] uppercase tracking-widest cursor-default">
                                      Revoke Pending
                                   </Button>
                                )
                              ) : (
                                <Button 
                                  onClick={() => handleRevokeStudent(selectedStudent.id)}
                                  className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white h-10 px-6 rounded-xl font-black text-[9px] tracking-widest uppercase transition-all"
                                >
                                  { (currentAdmin?.role === 'super_admin' || currentAdmin?.role === 'director') ? "Revoke Clearance" : "Initiate Revoke" }
                                </Button>
                              )
                            ) : pendingApprovals.find(a => a.data?.userId === selectedStudent.id) ? (
                              (currentAdmin?.role === 'super_admin' || currentAdmin?.role === 'director') ? (
                                <>
                                  <Button 
                                    onClick={() => handleApproveStudent(selectedStudent.id, true)}
                                    className="bg-green-500 text-white hover:bg-green-600 h-10 px-6 rounded-xl font-black text-[9px] tracking-widest uppercase transition-all shadow-lg shadow-green-500/20"
                                  >
                                    Approve
                                  </Button>
                                  <Button 
                                    onClick={() => handleApproveStudent(selectedStudent.id, false)}
                                    className="bg-white/5 text-gray-400 border border-white/10 hover:bg-red-500 hover:text-white h-10 px-6 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all"
                                  >
                                    Reject
                                  </Button>
                                </>
                              ) : (
                                <Button disabled className="bg-yellow-400/10 text-yellow-600 border border-yellow-400/10 h-10 px-6 rounded-xl font-black text-[9px] uppercase tracking-widest cursor-default">
                                  Waiting for Approval
                                </Button>
                              )
                           ) : (
                             <Button 
                               onClick={() => handleNominateStudent(selectedStudent)}
                               className="bg-yellow-400 text-black hover:bg-black hover:text-white h-10 px-6 rounded-xl font-black text-[9px] tracking-widest uppercase transition-all"
                             >
                               Nominate for Internship
                             </Button>
                           )}
                        </div>
                   </div>
               </div>

               {/* Detail Content */}
               <div className="flex-1 overflow-y-auto p-12 custom-scrollbar space-y-12">
                  {/* Bio & Stats */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-6">
                          <h4 className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                             <User className="h-4 w-4" /> Personal Dossier
                          </h4>
                          <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 shadow-inner text-left">
                             <p className="text-gray-300 leading-relaxed italic font-medium">
                                {selectedStudent.bio || "No biographical information has been recorded in the platform database yet. This student is currently undergoing tactical assessment."}
                             </p>
                          </div>
                      </div>
                      <div className="space-y-6">
                          <h4 className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                             <BarChart3 className="h-4 w-4" /> Performance Stats
                          </h4>
                          <div className="space-y-4">
                             <div className="p-6 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center transition-all hover:bg-white/10">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total Submissions</span>
                                <span className="text-xl font-black text-white">{submissions.length}</span>
                             </div>
                             <div className="p-6 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center transition-all hover:bg-white/10">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Late Submissions</span>
                                <span className="text-xl font-black text-red-500">
                                  {submissions.filter(s => {
                                    const assignment = assignmentMap[s.assignmentId] || assignmentMap[s.assignmentRef]
                                    if (!assignment?.dueDate || !s.submittedAt) return false
                                    const due = assignment.dueDate?.toMillis?.() || new Date(assignment.dueDate).getTime()
                                    const sub = s.submittedAt?.toMillis?.() || new Date(s.submittedAt).getTime()
                                    return sub > due
                                  }).length}
                                </span>
                             </div>
                             <div className="p-6 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center transition-all hover:bg-white/10">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Early Submissions</span>
                                <span className="text-xl font-black text-green-500">
                                  {submissions.filter(s => {
                                    const assignment = assignmentMap[s.assignmentId] || assignmentMap[s.assignmentRef]
                                    if (!assignment?.dueDate || !s.submittedAt) return false
                                    const due = assignment.dueDate?.toMillis?.() || new Date(assignment.dueDate).getTime()
                                    const sub = s.submittedAt?.toMillis?.() || new Date(s.submittedAt).getTime()
                                    return sub <= due
                                  }).length}
                                </span>
                             </div>
                             <div className="p-6 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center transition-all hover:bg-white/10">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Graded Pass</span>
                                <span className="text-xl font-black text-green-500">{submissions.filter(s => s.status === 'approved').length}</span>
                             </div>
                             <div className="p-6 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center transition-all hover:bg-white/10">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Wait/Redo</span>
                                <span className="text-xl font-black text-red-500">{submissions.filter(s => s.status === 'redo').length}</span>
                             </div>
                          </div>
                      </div>
                  </div>

                  {/* Work Archive */}
                  <div className="space-y-8">
                      <div className="flex items-center justify-between">
                          <h4 className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                             <BookOpen className="h-4 w-4" /> Work Archive & Video Submissions
                          </h4>
                          <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{submissions.length} Records Found</span>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                          {submissions.length === 0 ? (
                            <div className="p-20 text-center bg-white/5 rounded-[3rem] border border-white/10 border-dashed">
                               <p className="text-gray-600 font-black uppercase tracking-widest text-[10px]">No formal work archive exists for this unit.</p>
                            </div>
                          ) : (
                            submissions.map(sub => {
                              const lateValue = getLateStatus(sub)
                              return (
                                <div key={sub.id} className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] transition-all group/sub hover:border-white/20">
                                   <div className="flex flex-col md:flex-row gap-8 items-start">
                                     <div 
                                       onClick={() => sub.submissionUrl && setViewingUrl(sub.submissionUrl)}
                                       className="w-full md:w-56 aspect-video bg-black rounded-2xl flex items-center justify-center relative overflow-hidden shadow-2xl border border-white/10 cursor-pointer"
                                     >
                                         <Play className="h-10 w-10 text-yellow-400 opacity-40 group-hover/sub:scale-125 transition-all" />
                                         <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                            <p className="text-[8px] font-black text-white uppercase tracking-widest">Protocol Video #{(sub.id).slice(0,4)}</p>
                                         </div>
                                     </div>
                                     <div className="flex-1 space-y-3 text-left">
                                         <div className="flex flex-wrap justify-start gap-4 mb-2">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest ${sub.status === 'approved' ? 'bg-green-500/20 text-green-500' : sub.status === 'redo' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-400/20 text-yellow-500'}`}>
                                               {sub.status.toUpperCase()}
                                            </span>
                                            {lateValue && (
                                              <span className="px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse">
                                                {lateValue.toUpperCase()}
                                              </span>
                                            )}
                                            <span className="text-[10px] font-bold text-gray-600 px-4 py-1.5 bg-black/40 rounded-full border border-white/5 uppercase">
                                               {sub.submittedAt?.toDate ? sub.submittedAt.toDate().toLocaleDateString() : 'LEGACY RECORD'}
                                            </span>
                                         </div>
                                         <h5 className="text-2xl font-black text-white tracking-tighter">{sub.assignmentTitle || 'Academy Submission'}</h5>
                                         <p className="text-sm text-gray-400 font-medium leading-relaxed italic opacity-80">
                                            {sub.notes || "Official project submission for curriculum advancement. Evaluated under standard grading parameters."}
                                         </p>
  
                                         {gradingId === sub.id ? (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-6 bg-white/5 rounded-[2rem] border border-white/10 space-y-6">
                                                <div className="space-y-2">
                                                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Official Evaluation Feedback</label>
                                                   <Textarea 
                                                     placeholder="Enter tactical feedback for the student..."
                                                     value={gradeData.feedback}
                                                     onChange={e => setGradeData({ ...gradeData, feedback: e.target.value })}
                                                     className="bg-black/40 border-white/10 rounded-xl min-h-[120px] text-sm italic"
                                                   />
                                                </div>
                                                <div className="flex gap-4">
                                                   <Button 
                                                     onClick={() => handleGrade(sub, true)}
                                                     className="flex-1 bg-green-600 hover:bg-green-500 text-white font-black text-[10px] tracking-widest h-14 rounded-xl"
                                                   >
                                                     <Check className="h-4 w-4 mr-2" /> Validate & Approve
                                                   </Button>
                                                   <Button 
                                                     onClick={() => handleGrade(sub, false)}
                                                     className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black text-[10px] tracking-widest h-14 rounded-xl"
                                                   >
                                                     <X className="h-4 w-4 mr-2" /> Request Revision
                                                   </Button>
                                                   <button 
                                                     onClick={() => setGradingId(null)}
                                                     className="px-6 bg-white/5 hover:bg-white/10 text-gray-500 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all"
                                                   >
                                                      Cancel
                                                   </button>
                                                </div>
                                            </motion.div>
                                         ) : (
                                            <div className="flex items-center gap-6 pt-6">
                                                <button 
                                                  onClick={() => sub.submissionUrl && setViewingUrl(sub.submissionUrl)}
                                                  className="flex items-center gap-2 text-[10px] font-black text-yellow-500 hover:text-white transition-all uppercase tracking-widest"
                                                >
                                                   <Play className="h-4 w-4" /> Watch Submission
                                                </button>
                                                <button 
                                                  onClick={() => setGradingId(sub.id)}
                                                  className="flex items-center gap-2 text-[10px] font-black text-indigo-400 hover:text-white transition-all uppercase tracking-widest"
                                                >
                                                   <ShieldCheck className="h-4 w-4" /> Grade Intel
                                               </button>
                                            </div>
                                         )}
                                     </div>
                                   </div>
                                </div>
                              )
                            })
                          )}
                      </div>
                  </div>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <RevokeReasonDialog 
        isOpen={revokeDialogOpen} 
        onClose={() => setRevokeDialogOpen(false)} 
        onConfirm={confirmRevocation} 
        studentName={revokingStudent?.name || "Student"} 
      />
    </div>
  )
}

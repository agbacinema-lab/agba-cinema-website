"use client"

import { useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import { collection, query, getDocs, where } from "firebase/firestore"
import { adminService } from "@/lib/services"
import { useAuth } from "@/context/AuthContext"
import { StudentProfile } from "@/lib/types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GraduationCap, Search, CheckCircle, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import PasswordVerifyDialog from "./PasswordVerifyDialog"
import RevokeReasonDialog from "./RevokeReasonDialog"

export default function StudentReadiness() {
  const { profile: currentAdmin } = useAuth()
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [verifyOpen, setVerifyOpen] = useState(false)
  const [pendingStudent, setPendingStudent] = useState<StudentProfile | null>(null)
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([])
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)
  const [revokingStudent, setRevokingStudent] = useState<any>(null)

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { collection, getDocs, query, where } = await import("firebase/firestore")
        
        // Fetch all students, pending approvals, and ALL submissions in parallel
        const [snap, approvalSnap, subSnap, assignmentSnap, activationSnap] = await Promise.all([
          getDocs(query(collection(db, "users"), where("role", "==", "student"))),
          getDocs(query(collection(db, "approvals"), where("status", "==", "pending"))),
          getDocs(collection(db, "submissions")),
          getDocs(collection(db, "assignments")),
          getDocs(collection(db, "assignmentActivations"))
        ])
        
        const approvals = approvalSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }))
        setPendingApprovals(approvals)

        const assignmentMap: Record<string, any> = {}
        assignmentSnap.docs.forEach(d => { assignmentMap[d.id] = d.data() })

        const activationMap: Record<string, any> = {}
        activationSnap.docs.forEach(d => {
           const data = d.data()
           activationMap[`${data.studentId}_${data.assignmentId}`] = data
        })

        const subMap: Record<string, { late: number, early: number }> = {}
        subSnap.docs.forEach(d => {
           const data = d.data()
           const uid = data.studentUID || data.userId || data.studentId
           if (!uid) return
           if (!subMap[uid]) subMap[uid] = { late: 0, early: 0 }
           
           const aid = data.assignmentId || data.assignmentRef
           const assignment = assignmentMap[aid]
           const activation = activationMap[`${uid}_${aid}`]

           const effectiveDueDate = activation?.dueDate || assignment?.dueDate

           if (effectiveDueDate && data.submittedAt) {
              const due = effectiveDueDate?.toMillis?.() || new Date(effectiveDueDate).getTime()
              const sub = data.submittedAt?.toMillis?.() || new Date(data.submittedAt).getTime()
              if (sub > due) subMap[uid].late++
              else subMap[uid].early++
           } else {
              subMap[uid].early++ // Assumption: if no due date, it's early/on-time
           }
        })

        const allStudents = snap.docs.map(doc => {
          const data = doc.data()
          const isNominated = approvals.some(a => a.type === 'internship_ready' && a.data?.userId === doc.id)
          const stats = subMap[doc.id] || { late: 0, early: 0 }
          return {
            ...data,
            userId: doc.id,
            studentUID: doc.id,
            fullName: data.name || "Anonymous Student",
            status: data.status || "active",
            isNominated,
            stats
          } as any
        })
        
        let available = allStudents

        // If the current user is a tutor, restrict the view to ONLY their assigned students
        if (currentAdmin?.role === 'tutor') {
           available = available.filter(s => (s as any).tutorId === currentAdmin.uid || (s as any).tutorName === currentAdmin.name)
        }

        setStudents(available as any)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching students:", err)
        setLoading(false)
      }
    }
    if (currentAdmin) fetchStudents()
  }, [currentAdmin])

  const handleRevoke = async (userId: string) => {
    if (!currentAdmin) return
    try {
      if (currentAdmin.role === 'super_admin' || currentAdmin.role === 'director') {
        setLoading(true)
        await adminService.revokeInternshipReadiness(userId)
        toast.success("Internship ready status revoked instantly.")
        window.location.reload()
      } else {
        const student = students.find(s => s.userId === userId)
        setRevokingStudent(student)
        setRevokeDialogOpen(true)
      }
    } catch (err) {
      toast.error("Process failed.")
    } finally {
      setLoading(false)
    }
  }

  const confirmRevokeRequest = async (reason: string) => {
    if (!currentAdmin || !revokingStudent) return
    try {
      setLoading(true)
      await adminService.createApprovalRequest({
         type: 'revoke_internship',
         requestBy: { uid: currentAdmin.uid, name: currentAdmin.name, email: currentAdmin.email },
         data: { userId: revokingStudent.userId, userName: revokingStudent.fullName, reason: reason }
      })
      toast.success("Revoke request sent for Super Admin approval.")
      window.location.reload()
    } catch (err) {
      toast.error("Process failed.")
    } finally {
      setLoading(false)
    }
  }

  const initiateReadiness = async (student: any) => {
    if (!currentAdmin) return
    try {
      setLoading(true)
      if (currentAdmin.role === 'super_admin' || currentAdmin.role === 'director') {
        await adminService.setInternshipStatus(student.userId, 'internship_ready')
        toast.success("Student approved for internship instantly.")
        window.location.reload()
      } else {
        await adminService.createApprovalRequest({
          type: 'internship_ready',
          requestBy: { uid: currentAdmin.uid, name: currentAdmin.name, email: currentAdmin.email },
          data: { userId: student.userId, userName: student.fullName }
        })
        toast.success("Nomination request for internship sent to Super Admin.")
      }
    } catch (err) {
      toast.error("Nomination failed")
    } finally {
      setLoading(false)
    }
  }

  const processRequest = async (userId: string, isApprove: boolean) => {
    if (!currentAdmin || (currentAdmin.role !== 'super_admin' && currentAdmin.role !== 'director')) {
      toast.error("Unauthorized action")
      return
    }

    const request = pendingApprovals.find(a => a.type === 'internship_ready' && a.data?.userId === userId && a.status === 'pending')
    if (!request) {
      toast.error("No pending request found for this student")
      return
    }

    try {
      setLoading(true)
      await adminService.processApproval(
        request.id, 
        isApprove, 
        { uid: currentAdmin.uid, name: currentAdmin.name, email: currentAdmin.email },
        isApprove ? undefined : "Declined by admin"
      )
      toast.success(isApprove ? "Student approved for internship!" : "Nomination rejected")
      
      // Simple refresh logic - we could just trigger the useEffect by changing a dummy state 
      // but a fresh fetch is cleaner for data integrity
      window.location.reload() 
    } catch (err) {
      toast.error("Action failed")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifiedAction = async () => {
    if (!pendingStudent || !currentAdmin) return

    // Logic: Super Admin approves directly. Others create request.
    if (currentAdmin.role === 'super_admin') {
      // In a real app we'd call a service to update firestore directly
      // For this demo, let's use the approval logic but auto-approve
      await adminService.createApprovalRequest({
        type: 'internship_ready',
        requestBy: { uid: currentAdmin.uid, name: currentAdmin.name, email: currentAdmin.email },
        data: { userId: pendingStudent.userId, userName: pendingStudent.fullName }
      })
      // This is a bit redundant if we want instant, but simpler to reuse the flow.
      toast.success("Status updated or pending approval.")
    } else {
      await adminService.createApprovalRequest({
        type: 'internship_ready',
        requestBy: { uid: currentAdmin.uid, name: currentAdmin.name, email: currentAdmin.email },
        data: { userId: pendingStudent.userId, userName: pendingStudent.fullName }
      })
      toast.success("Promotion request for internship sent to Super Admin.")
    }
  }

  const filtered = students.filter(s => 
    (s.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.studentId || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="p-12 text-left text-gray-500 font-bold">Loading students...</div>

  return (
    <>
      <Card className="border-none shadow-premium rounded-[2.5rem] bg-card p-8 transition-colors">
        <CardHeader className="p-0 mb-8 transition-colors text-left">
          <CardTitle className="flex items-center gap-3 text-2xl font-black text-foreground tracking-tighter">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-black">
              <GraduationCap className="h-5 w-5" />
            </div>
            Internship readiness hub
          </CardTitle>
          <div className="relative mt-6 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by name or student ID..." 
              className="w-full pl-10 pr-4 h-12 rounded-xl border border-muted-foreground/20 bg-background text-foreground transition-all text-sm outline-none focus:border-yellow-400"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.length === 0 ? (
              <div className="col-span-full py-12 text-left px-4">
                <p className="text-muted-foreground font-medium">No students found matching your search.</p>
              </div>
            ) : (
              students.filter(s => 
                (s.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (s.studentId || "").toLowerCase().includes(searchTerm.toLowerCase())
              ).map(s => {
                const isReady = s.status === 'internship_ready'
                const isNominated = s.isNominated || pendingApprovals.some(a => a.type === 'internship_ready' && a.data?.userId === s.userId && a.status === 'pending')
                const isRevokePending = pendingApprovals.some(a => a.type === 'revoke_internship' && a.data?.userId === s.userId && a.status === 'pending')
                
                return (
                  <div key={s.studentUID || s.userId} className={`group bg-muted/30 border ${isReady ? 'border-green-500/30' : isNominated ? 'border-yellow-400/30' : 'border-transparent'} rounded-[2rem] p-6 transition-all duration-300 relative overflow-hidden h-full flex flex-col`}>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full inline-block">
                            {s.studentId || "NO ID"}
                          </span>
                          {isReady && (
                            <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-3 py-1 rounded-full flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" /> Ready
                            </span>
                          )}
                          {isNominated && !isReady && (
                            <span className="text-[10px] font-black text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full flex items-center gap-1">
                              Nomination Pending
                            </span>
                          )}
                          {isRevokePending && (
                            <span className="text-[10px] font-black text-red-500 bg-red-500/10 px-3 py-1 rounded-full flex items-center gap-1">
                              Revoke Pending
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-black text-foreground tracking-tighter">{s.fullName}</h3>
                        <p className="text-xs text-muted-foreground font-medium mb-4">Enrolled in {s.programType === 'mentorship' ? 'Mentorship' : 'Go PRO'}</p>
                        
                        {(currentAdmin?.role === 'super_admin' || currentAdmin?.role === 'director' || currentAdmin?.role === 'head_of_department') && (
                          <div className="flex gap-4 mt-2">
                             <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-50 mb-1">Early/On-time</span>
                                <span className="text-xs font-black text-green-500 bg-green-500/10 px-3 py-1.5 rounded-xl border border-green-500/20 w-fit">
                                   {s.stats?.early || 0}
                                </span>
                             </div>
                             <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-50 mb-1">Late Submissions</span>
                                <span className={`text-xs font-black px-3 py-1.5 rounded-xl border w-fit ${s.stats?.late > 0 ? 'text-red-500 bg-red-500/10 border-red-500/20' : 'text-gray-400 bg-gray-500/5 border-white/5'}`}>
                                   {s.stats?.late || 0}
                                </span>
                             </div>
                          </div>
                        )}
                      </div>
                      <div className="w-12 h-12 bg-muted rounded-2xl overflow-hidden shadow-inner border border-white/5">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${s.userId || s.studentUID}`} alt="" className="w-full h-full object-cover" />
                      </div>
                    </div>

                     <div className="flex flex-col gap-3 mt-auto pt-6 relative z-10 w-full">
                      {isReady ? (
                        isRevokePending ? (
                          <Button 
                            disabled
                            className="w-full bg-red-500/5 text-red-500 border border-red-500/10 h-12 rounded-xl font-black text-[10px] tracking-widest cursor-default uppercase"
                          >
                            Revoke Pending Approval
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => handleRevoke(s.userId)}
                            className="w-full bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white h-12 rounded-xl font-black text-[10px] tracking-widest transition-all uppercase"
                          >
                            Initiate Revoke
                          </Button>
                        )
                      ) : isNominated ? (
                        (currentAdmin?.role === 'super_admin' || currentAdmin?.role === 'director') ? (
                          <div className="flex gap-2 w-full">
                            <Button 
                              onClick={() => processRequest(s.userId, true)}
                              className="flex-1 bg-green-500 text-white hover:bg-green-600 h-12 rounded-xl font-black text-[10px] tracking-widest transition-all uppercase"
                            >
                               Approve
                            </Button>
                            <Button 
                              onClick={() => processRequest(s.userId, false)}
                              className="flex-1 bg-red-500 text-white hover:bg-red-600 h-12 rounded-xl font-black text-[10px] tracking-widest transition-all uppercase"
                            >
                               Reject
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            disabled
                            className="w-full bg-yellow-400/10 text-yellow-600 border border-yellow-400/20 h-12 rounded-xl font-black text-[10px] tracking-widest cursor-default uppercase"
                          >
                            Nomination Pending
                          </Button>
                        )
                      ) : (
                        <div className="flex gap-2 w-full">
                          <Button 
                            onClick={() => initiateReadiness(s)}
                            className="flex-1 bg-foreground text-background hover:bg-yellow-400 hover:text-black h-12 rounded-xl font-black text-[10px] tracking-widest transition-all uppercase"
                          >
                            Nominate Student
                          </Button>
                          <button className="w-12 h-12 bg-card border border-muted rounded-xl flex items-center justify-center hover:bg-muted transition-all text-muted-foreground flex-shrink-0">
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Background Subtle Glow */}
                    {isReady && <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-green-500/5 blur-3xl rounded-full" />}
                    {isNominated && !isReady && <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-yellow-400/5 blur-3xl rounded-full" />}
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      <PasswordVerifyDialog 
        isOpen={verifyOpen}
        onClose={() => setVerifyOpen(false)}
        onVerified={handleVerifiedAction}
        title={`Authorize nomination for ${pendingStudent?.fullName}`}
      />
      <RevokeReasonDialog 
        isOpen={revokeDialogOpen} 
        onClose={() => setRevokeDialogOpen(false)} 
        onConfirm={confirmRevokeRequest} 
        studentName={revokingStudent?.fullName || "Student"} 
      />
    </>
  )
}

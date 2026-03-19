"use client"

import { useState, useEffect } from "react"
import { adminService, studentService } from "@/lib/services"
import { useAuth } from "@/context/AuthContext"
import { UserProfile, UserRole } from "@/lib/types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Shield, UserCheck, ChevronDown, Users, Search, RefreshCw, XCircle, ArrowRight } from "lucide-react"
import PasswordVerifyDialog from "./PasswordVerifyDialog"
import { toast } from "sonner"
import { motion } from "framer-motion"

export default function UserManagement() {
  const { profile: currentAdmin, isSuperAdmin } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [tutors, setTutors] = useState<UserProfile[]>([])

  // Role change security state
  const [verifyOpen, setVerifyOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<{ userId: string; targetRole: UserRole; userName: string; currentRole: string } | null>(null)

  // Tutor assignment state
  const [assigningTo, setAssigningTo] = useState<string | null>(null)
  const [assigningTutorId, setAssigningTutorId] = useState("")
  const [assignLoading, setAssignLoading] = useState(false)
  
  // Track Access state
  const [specs, setSpecs] = useState<any[]>([])

  // Sorting and Bulk state
  const [sortAsc, setSortAsc] = useState(true)
  const [massChangeMode, setMassChangeMode] = useState(false)
  const [massOldTutorId, setMassOldTutorId] = useState("")
  const [massNewTutorId, setMassNewTutorId] = useState("")
  const [massLoading, setMassLoading] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await adminService.getAllUsers()
      setUsers(data)
      setTutors(data.filter(u => u.role === 'tutor' || u.role === 'admin' || u.role === 'director' || u.role === 'head_of_department'))
      
      const { specializationService } = await import("@/lib/services")
      const specsData = await specializationService.getAllSpecializations()
      setSpecs(specsData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const initiateRoleChange = (userId: string, targetRole: UserRole, userName: string, currentRole: string) => {
    setPendingAction({ userId, targetRole, userName, currentRole })
    setVerifyOpen(true)
  }

  const handleVerifiedAction = async () => {
    if (!pendingAction || !currentAdmin) return
    const { userId, targetRole, userName } = pendingAction
    if (currentAdmin.role === 'super_admin' || currentAdmin.role === 'director') {
      await adminService.updateUserRole(userId, targetRole)
      toast.success(`${userName} is now ${targetRole?.replace('_', ' ')}`)
      loadData()
    } else {
      await adminService.createApprovalRequest({
        type: 'role_change',
        requestBy: { uid: currentAdmin.uid, name: currentAdmin.name, email: currentAdmin.email },
        data: { userId, targetRole, userName, currentRole: pendingAction.currentRole }
      })
      toast.success("Role change request sent to Super Admin for approval.")
    }
  }

  const handleUpdateStaffSpec = async (userId: string, specValue: string) => {
    try {
      if (currentAdmin?.role !== 'super_admin' && currentAdmin?.role !== 'director') {
         toast.error("Only Super Admins or Directors can update staff course access."); return;
      }
      const staffUser = users.find(u => u.uid === userId)
      const currentSpecs = (staffUser as any)?.specializations || []
      let newSpecs = []
      
      if (specValue === "") {
        newSpecs = []
      } else if (currentSpecs.includes(specValue)) {
        newSpecs = currentSpecs.filter((s:string) => s !== specValue)
      } else {
        newSpecs = [...currentSpecs, specValue]
      }

      const { doc, updateDoc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      await updateDoc(doc(db, "users", userId), { specializations: newSpecs })
      toast.success("Staff access updated.")
      setUsers(users.map(u => u.uid === userId ? { ...u, specializations: newSpecs } : u))
    } catch(err) {
      toast.error("Error setting access restrictor.");
    }
  }

  const handleAssignTutor = async (studentId: string, specId: string, studentName: string) => {
    if (!assigningTutorId) { toast.error("Please select a tutor."); return }
    const tutor = tutors.find(t => t.uid === assigningTutorId)
    if (!tutor) return
    setAssignLoading(true)
    try {
      const { doc, updateDoc, setDoc, serverTimestamp } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      
      // We store assignments in a map: assignedTutors[specId] = { tutorId, tutorName }
      const student = users.find(u => u.uid === studentId)
      const currentAssignments = (student as any)?.assignedTutors || {}
      const updatedAssignments = {
        ...currentAssignments,
        [specId]: { tutorId: tutor.uid, tutorName: tutor.name }
      }

      await updateDoc(doc(db, "users", studentId), { 
        assignedTutors: updatedAssignments,
        // Fallback for legacy components that expect single tutorId
        tutorId: tutor.uid,
        tutorName: tutor.name, 
        updatedAt: serverTimestamp() 
      })
      
      toast.success(`${tutor.name} assigned for ${specId}.`)
      setAssigningTo(null)
      setAssigningTutorId("")
      const data = await adminService.getAllUsers()
      setUsers(data)
    } catch (e) {
      toast.error("Failed to assign.")
    } finally {
      setAssignLoading(false)
    }
  }

  const handleMassChange = async () => {
    if (!massOldTutorId || !massNewTutorId) { toast.error("Select both tutors."); return }
    if (massOldTutorId === massNewTutorId) { toast.error("Selection must be different."); return }
    
    setMassLoading(true)
    try {
      const { doc, updateDoc, writeBatch } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      const batch = writeBatch(db)
      
      const affectedStudents = students.filter(s => {
        const assignments = (s as any).assignedTutors || {}
        return Object.values(assignments).some((a:any) => a.tutorId === massOldTutorId)
      })

      if (affectedStudents.length === 0) {
        toast.info("No students found assigned to that tutor.")
        return
      }

      const newTutor = tutors.find(t => t.uid === massNewTutorId)
      if (!newTutor) return

      for (const s of affectedStudents) {
        const currentAssignments = (s as any).assignedTutors || {}
        const newAssignments = { ...currentAssignments }
        
        // Update every specialization linked to old tutor
        Object.keys(newAssignments).forEach(key => {
          if (newAssignments[key].tutorId === massOldTutorId) {
            newAssignments[key] = { tutorId: newTutor.uid, tutorName: newTutor.name }
          }
        })

        batch.update(doc(db, "users", s.uid), { 
           assignedTutors: newAssignments,
           tutorId: newTutor.uid,
           tutorName: newTutor.name
        })
      }

      await batch.commit()
      toast.success(`Succesfully moved ${affectedStudents.length} students to ${newTutor.name}.`)
      setMassChangeMode(false)
      loadData()
    } catch (e) {
      toast.error("Mass reassignment failed.")
    } finally {
      setMassLoading(false)
    }
  }

  if (loading) return (
    <div className="p-24 text-center">
       <div className="w-10 h-10 border-4 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
       <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-[10px]">Synchronizing Records...</p>
    </div>
  )

  const students = users.filter(u => u.role === 'student').sort((a,b) => {
    if (sortAsc) return a.name.localeCompare(b.name)
    return b.name.localeCompare(a.name)
  })
  const staff = users.filter(u => u.role !== 'student')

  return (
    <>
      <div className="flex justify-between items-center mb-8 bg-muted/20 p-6 rounded-[2.5rem] border border-muted/50">
        <div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-foreground">Talent Command</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Synchronize and deploy your network assets.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setMassChangeMode(!massChangeMode)}
            className={`h-14 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border ${massChangeMode ? 'bg-red-500 text-white border-red-500' : 'bg-card text-foreground border-muted'}`}
          >
            {massChangeMode ? "CANCEL MASS CHANGE" : "REASSIGN TUTOR POOL"}
          </button>
          <button 
            onClick={loadData}
            disabled={loading}
            className="h-14 px-8 bg-foreground text-background font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-yellow-400 hover:text-black transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center gap-3"
          >
            {loading ? "..." : "REFRESH HUB"}
          </button>
        </div>
      </div>

      {massChangeMode && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 p-10 bg-black text-white rounded-[2.5rem] shadow-2xl border border-white/10 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <RefreshCw className="w-32 h-32 animate-spin-[20s]" />
           </div>
           <h3 className="text-2xl font-black italic uppercase italic tracking-tighter mb-2">Mass Reassignment Engine</h3>
           <p className="text-white/50 text-[10px] uppercase font-black tracking-widest mb-8">Move all students from one tutor to another instantly.</p>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-white/40">From Existing Tutor</label>
                 <select 
                   value={massOldTutorId}
                   onChange={e => setMassOldTutorId(e.target.value)}
                   className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-[10px] font-black outline-none focus:border-yellow-400 transition-all uppercase"
                 >
                    <option value="" className="bg-black">— SELECT SOURCE TUTOR —</option>
                    {tutors.map(t => <option key={t.uid} value={t.uid} className="bg-black">{t.name}</option>)}
                 </select>
              </div>

              <div className="flex items-center justify-center h-14">
                 <ArrowRight className="h-6 w-6 text-yellow-400" />
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-white/40">To Deployment Successor</label>
                 <select 
                   value={massNewTutorId}
                   onChange={e => setMassNewTutorId(e.target.value)}
                   className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-[10px] font-black outline-none focus:border-yellow-400 transition-all uppercase"
                 >
                    <option value="" className="bg-black">— SELECT SUCCESSOR —</option>
                    {tutors.map(t => <option key={t.uid} value={t.uid} className="bg-black">{t.name}</option>)}
                 </select>
              </div>

              <button 
                onClick={handleMassChange}
                disabled={massLoading}
                className="lg:col-span-3 h-16 bg-yellow-400 text-black rounded-2xl font-black uppercase italic tracking-widest hover:scale-[1.02] active:scale-95 transition-all mt-4 disabled:opacity-50"
              >
                 {massLoading ? "PROCESSING BATCH DEPLOYMENT..." : "EXECUTE TOTAL MIGRATION"}
              </button>
           </div>
        </motion.div>
      )}

      {/* ─── Tutor Assignment Table (Students) ─── */}
      <Card className="border border-muted shadow-premium rounded-[3rem] bg-card overflow-hidden transition-colors relative group">
        <CardHeader className="p-10 lg:p-14 border-b border-muted bg-muted/20 transition-colors">
          <CardTitle className="flex items-center gap-5 text-3xl font-black italic uppercase tracking-tighter text-foreground transition-colors">
            <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-xl">
              <UserCheck className="h-7 w-7 text-black" />
            </div>
            Assign Tutors
          </CardTitle>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mt-4 transition-colors opacity-60">
            Assign students to specific tutors based on their specialized curriculum.
          </p>
        </CardHeader>
        <CardContent className="p-0 transition-colors">
          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/50 text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground border-b border-muted transition-colors">
                  <th className="px-10 py-6">
                    <button onClick={() => setSortAsc(!sortAsc)} className="flex items-center gap-2 hover:text-foreground transition-colors uppercase">
                       Student Name 
                       <RefreshCw className={`h-3 w-3 ${sortAsc ? '' : 'rotate-180'} transition-transform`} />
                    </button>
                  </th>
                  <th className="px-10 py-6">Assigned Tutors (Per Specialization)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted transition-colors">
                {students.length === 0 ? (
                  <tr><td colSpan={2} className="py-24 text-center text-muted-foreground/30 font-black uppercase text-[12px] tracking-[0.5em] italic">No students found.</td></tr>
                ) : students.map(u => (
                  <tr key={u.uid} className="hover:bg-muted/10 transition-colors group">
                    <td className="py-8 px-10">
                      <p className="font-black text-foreground uppercase italic tracking-tighter text-xl transition-colors">{u.name}</p>
                      <p className="text-xs text-muted-foreground font-medium mt-1 truncate max-w-sm italic opacity-60 transition-colors">{u.email}</p>
                      <div className="mt-2">
                         <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Original Track: {u.specialization || "UNSET"}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {(u.enrolledSpecializations || [{ value: u.specialization || 'general' }]).map((spec: any) => {
                           const specId = spec.value || spec.id || u.specialization || 'general'
                           const assignment = (u as any).assignedTutors?.[specId]
                           const specLabel = specs.find(s => s.value === specId)?.label || specId
                           
                           return (
                             <div key={specId} className="p-4 bg-muted/10 rounded-2xl border border-muted/50 flex flex-col gap-3">
                               <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">{specLabel}</p>
                               {assigningTo === `${u.uid}_${specId}` ? (
                                  <div className="flex flex-col gap-2">
                                     <select
                                       value={assigningTutorId}
                                       autoFocus
                                       onChange={e => setAssigningTutorId(e.target.value)}
                                       className="h-12 w-full px-4 rounded-xl border border-muted text-[10px] font-black bg-card text-foreground outline-none uppercase shadow-inner"
                                     >
                                        <option value="">— SELECT QLFD TUTOR —</option>
                                        {tutors.filter(t => {
                                          const tSpecs = (t as any).specializations || []
                                          return tSpecs.length === 0 || tSpecs.includes(specId)
                                        }).map(t => (
                                          <option key={t.uid} value={t.uid}>{t.name}</option>
                                        ))}
                                     </select>
                                     <div className="flex gap-2">
                                        <button onClick={() => handleAssignTutor(u.uid, specId, u.name)} disabled={assignLoading} className="flex-1 h-10 bg-black text-white rounded-xl font-black text-[9px] uppercase hover:bg-yellow-400 hover:text-black transition-all">
                                          {assignLoading ? "..." : "CONFIRM"}
                                        </button>
                                        <button onClick={() => setAssigningTo(null)} className="px-4 h-10 bg-muted text-muted-foreground rounded-xl font-black text-[9px] uppercase hover:bg-red-500 hover:text-white transition-all">CANCEL</button>
                                     </div>
                                  </div>
                               ) : (
                                 <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-3">
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${assignment ? 'bg-indigo-500/20 text-indigo-500' : 'bg-muted text-muted-foreground opacity-30'}`}>
                                        {assignment ? (assignment.tutorName[0]) : "?"}
                                      </div>
                                      <span className="font-black text-[12px] uppercase italic text-foreground tracking-tighter">
                                        {assignment?.tutorName || "No Tutor"}
                                      </span>
                                   </div>
                                   {isSuperAdmin && (
                                     <button onClick={() => setAssigningTo(`${u.uid}_${specId}`)} className="h-8 px-3 bg-muted/50 hover:bg-foreground hover:text-background rounded-lg text-[8px] font-black uppercase tracking-widest transition-all">
                                       {assignment ? "CHANGE" : "ASSIGN"}
                                     </button>
                                   )}
                                 </div>
                               )}
                             </div>
                           )
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ─── Role Control Table (All Staff/Admins) ─── */}
      <Card className="border border-muted shadow-premium rounded-[3rem] bg-card overflow-hidden mt-12 transition-colors relative group">
        <CardHeader className="p-10 lg:p-14 border-b border-muted bg-muted/20 transition-colors">
          <CardTitle className="flex items-center gap-5 text-3xl font-black italic uppercase tracking-tighter text-foreground">
            <div className="w-14 h-14 bg-foreground rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl transition-colors group-hover:bg-yellow-400 group-hover:text-black">
              <Shield className="h-7 w-7 transition-colors" />
            </div>
            Access & Role Control
          </CardTitle>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mt-4 transition-colors opacity-60">
            Define system capabilities and course track restrictions for your team.
          </p>
        </CardHeader>
        <CardContent className="p-0 transition-colors">
          <div className="overflow-x-auto relative z-10 transition-colors">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/50 text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground border-b border-muted transition-colors">
                  <th className="px-10 py-6">Staff Name</th>
                  <th className="px-10 py-6">Identity</th>
                  <th className="px-10 py-6">Authorized Specializations</th>
                  <th className="px-10 py-6 text-right">Privilege Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted transition-colors">
                {staff.map(u => (
                  <tr key={u.uid} className="hover:bg-muted/30 transition-colors group">
                    <td className="py-6 px-10">
                      <p className="font-black text-foreground uppercase italic tracking-tighter">{u.name}</p>
                      <p className="text-xs text-muted-foreground font-medium mt-1">{u.email}</p>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        u.role === 'super_admin' ? 'bg-purple-500 text-white' :
                        u.role === 'director' ? 'bg-red-500 text-white' :
                        u.role === 'head_of_department' ? 'bg-indigo-500/20 text-indigo-500' :
                        u.role === 'admin' ? 'bg-blue-500/20 text-blue-500' :
                        u.role === 'tutor' ? 'bg-yellow-400 text-black' :
                        u.role === 'staff' ? 'bg-orange-500/20 text-orange-500' :
                        u.role === 'student' ? 'bg-foreground text-background' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {u.role?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-6 min-w-[250px]">
                      {(u.role === 'tutor' || u.role === 'staff') && (currentAdmin?.role === 'super_admin' || currentAdmin?.role === 'director') ? (
                        <div className="space-y-3">
                          <select 
                            value=""
                            onChange={(e) => handleUpdateStaffSpec(u.uid, e.target.value)}
                            className="w-full px-4 py-2 bg-muted/20 border border-muted rounded-xl text-[10px] font-black uppercase text-foreground outline-none hover:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all cursor-pointer"
                          >
                            <option value="">Toggle Specialization...</option>
                            {specs.map(s => <option key={s.value} value={s.value}>{s.label} {(u as any).specializations?.includes(s.value) ? '✓' : ''}</option>)}
                          </select>
                          <div className="flex flex-wrap gap-1.5">
                             {((u as any).specializations || []).map((sId: string) => (
                               <span key={sId} className="px-2 py-1 bg-yellow-400/10 text-yellow-500 rounded-md text-[8px] font-black uppercase border border-yellow-400/20">
                                 {specs.find(s => s.value === sId)?.label || sId}
                               </span>
                             ))}
                             {((u as any).specializations || []).length === 0 && (
                               <span className="text-[8px] font-black text-muted-foreground/40 italic uppercase">Global Access</span>
                             )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                           {((u as any).specializations || []).map((sId: string) => (
                               <span key={sId} className="px-2 py-1 bg-muted rounded-md text-[8px] font-black uppercase border border-muted">
                                 {specs.find(s => s.value === sId)?.label || sId}
                               </span>
                             ))}
                           {((u as any).specializations || []).length === 0 && (
                             <span className="text-[10px] font-black uppercase text-muted-foreground/50 tracking-widest italic pt-2 block">
                               Global Access
                             </span>
                           )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        {u.role !== 'super_admin' && (
                          <>
                            <RoleButton onClick={() => initiateRoleChange(u.uid, 'director', u.name, u.role)} label="DIR" variant="red" />
                            <RoleButton onClick={() => initiateRoleChange(u.uid, 'head_of_department', u.name, u.role)} label="HOD" variant="indigo" />
                            <RoleButton onClick={() => initiateRoleChange(u.uid, 'admin', u.name, u.role)} label="ADM" variant="blue" />
                            <RoleButton onClick={() => initiateRoleChange(u.uid, 'tutor', u.name, u.role)} label="TUT" variant="yellow" />
                            <RoleButton onClick={() => initiateRoleChange(u.uid, 'staff', u.name, u.role)} label="STAFF" variant="orange" />
                            {u.role !== 'student' && (
                              <RoleButton onClick={() => initiateRoleChange(u.uid, 'student', u.name, u.role)} label="DEACT" variant="gray" />
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <PasswordVerifyDialog 
        isOpen={verifyOpen}
        onClose={() => setVerifyOpen(false)}
        onVerified={handleVerifiedAction}
        title={`Authorize Change for ${pendingAction?.userName}`}
      />
    </>
  )
}

function RoleButton({ onClick, label, variant }: any) {
  const styles: any = {
    red: "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-600 hover:text-white",
    indigo: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 hover:bg-indigo-600 hover:text-white",
    blue: "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-600 hover:text-white",
    yellow: "bg-yellow-400/10 text-yellow-600 border-yellow-400/20 hover:bg-yellow-400 hover:text-black",
    orange: "bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-600 hover:text-white",
    gray: "bg-muted text-muted-foreground border-muted hover:bg-foreground hover:text-background"
  }
  return (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-lg border text-[9px] font-black tracking-widest transition-all ${styles[variant]}`}>
      {label}
    </button>
  )
}

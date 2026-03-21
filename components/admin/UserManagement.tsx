"use client"

import React, { useState, useEffect } from "react"
import { adminService, studentService } from "@/lib/services"
import { useAuth } from "@/context/AuthContext"
import { UserProfile, UserRole } from "@/lib/types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Shield, UserCheck, ChevronDown, Users, Search, RefreshCw, XCircle, ArrowRight, Globe, Trash2 } from "lucide-react"
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
  
  // Tactical Search & Load
  const [searchQuery, setSearchQuery] = useState("")
  const [limitView, setLimitView] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await adminService.getAllUsers()
      setUsers(data)
      setTutors(data.filter(u => 
        u.role === 'tutor' || 
        u.role === 'admin' || 
        u.role === 'super_admin' || 
        u.role === 'director' || 
        u.role === 'head_of_department'
      ))
      
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

  // Super Admin Delete User Function
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (currentAdmin?.role !== "super_admin") {
      toast.error("Only Super Admins can delete accounts.")
      return
    }

    if (!confirm(`SUPER ADMIN ACTION: Are you absolutely sure you want to permanently delete ${userName}? This action cannot be undone.`)) {
      return
    }

    setDeletingUserId(userId)
    const t = toast.loading(`Erasing ${userName} from the system...`)
    
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, requesterRole: currentAdmin?.role })
      })
      
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || "Failed to delete user")
      
      toast.success(data.message, { id: t })
      // Optimistically remove from UI
      setUsers(prev => prev.filter(u => u.uid !== userId))
      setTutors(prev => prev.filter(u => u.uid !== userId))
    } catch (error: any) {
      console.error(error)
      toast.error(`Error: ${error.message}`, { id: t })
    } finally {
      setDeletingUserId(null)
    }
  }

  if (loading) return (
    <div className="p-24 text-left">
       <div className="w-10 h-10 border-4 border-foreground border-t-transparent rounded-full animate-spin mb-4" />
       <p className="text-muted-foreground font-black tracking-[0.3em] text-[10px]">Synchronizing records...</p>
    </div>
  )

  const students = users
    .filter(u => u.role === 'student')
    .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a,b) => {
      if (sortAsc) return a.name.localeCompare(b.name)
      return b.name.localeCompare(a.name)
    })
  
  const displayedStudents = limitView && searchQuery === "" ? students.slice(0, 5) : students
  const staff = users.filter(u => u.role !== 'student' && u.role !== 'brand')
  const brands = users.filter(u => u.role === 'brand')

  return (
    <>
      <div className="flex justify-between items-center mb-8 bg-muted/10 p-6 rounded-[2.5rem] border border-muted/30">
        <div className="text-left">
          <h2 className="text-2xl font-black tracking-tighter text-foreground">Talent command</h2>
          <p className="text-[10px] font-black tracking-widest text-muted-foreground opacity-60">Synchronize and deploy your network assets.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setMassChangeMode(!massChangeMode)}
            className={`h-14 px-6 rounded-2xl font-black tracking-widest text-[10px] transition-all border ${massChangeMode ? 'bg-red-500 text-white border-red-500' : 'bg-card text-foreground border-muted'}`}
          >
            {massChangeMode ? "Cancel mass change" : "Reassign tutor pool"}
          </button>
        </div>
      </div>

      {massChangeMode && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 p-10 bg-black text-white rounded-[2.5rem] shadow-2xl border border-white/10 relative overflow-hidden text-left">
           <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <RefreshCw className="w-32 h-32 animate-spin-[20s]" />
           </div>
           <h3 className="text-xl font-black tracking-tighter mb-2">Mass reassignment engine</h3>
           <p className="text-white/50 text-[10px] font-black tracking-widest mb-8">Move all students from one tutor to another instantly.</p>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-white/40">From existing tutor</label>
                 <select 
                   value={massOldTutorId}
                   onChange={e => setMassOldTutorId(e.target.value)}
                   className="w-full h-14 bg-background border border-muted-foreground/30 rounded-2xl px-6 text-[10px] font-black outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all appearance-none"
                 >
                    <option value="" className="bg-card text-foreground">— Select source tutor —</option>
                    {tutors.map(t => <option key={t.uid} value={t.uid} className="bg-card text-foreground">{t.name}</option>)}
                 </select>
              </div>

              <div className="flex items-center justify-center h-14">
                 <ArrowRight className="h-6 w-6 text-yellow-400" />
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-white/40">To deployment successor</label>
                 <select 
                   value={massNewTutorId}
                   onChange={e => setMassNewTutorId(e.target.value)}
                   className="w-full h-14 bg-background border border-muted-foreground/30 rounded-2xl px-6 text-[10px] font-black outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all appearance-none"
                 >
                    <option value="" className="bg-card text-foreground">— Select successor —</option>
                    {tutors.map(t => <option key={t.uid} value={t.uid} className="bg-card text-foreground">{t.name}</option>)}
                 </select>
              </div>

              <button 
                onClick={handleMassChange}
                disabled={massLoading}
                className="lg:col-span-3 h-16 bg-yellow-400 text-black rounded-2xl font-black tracking-widest hover:scale-[1.02] active:scale-95 transition-all mt-4 disabled:opacity-50"
              >
                 {massLoading ? "Processing batch deployment..." : "Execute total migration"}
              </button>
           </div>
        </motion.div>
      )}

      {/* ─── Tutor Assignment Table (Students) ─── */}
      <Card className="border border-muted shadow-premium rounded-[3rem] bg-card overflow-hidden transition-colors relative group">
        <CardHeader className="p-10 lg:p-14 border-b border-muted bg-muted/20 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4 max-w-lg text-left">
            <CardTitle className="flex items-center gap-5 text-2xl font-black tracking-tighter text-foreground transition-colors">
              <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-xl text-black">
                <UserCheck className="h-7 w-7" />
              </div>
              Assign tutors
            </CardTitle>
            <p className="text-[10px] font-black tracking-[0.4em] text-muted-foreground transition-colors opacity-60 leading-relaxed">
              Tactical student-to-tutor deployment. Search or filter for rapid assignment.
            </p>
          </div>
          
          <div className="relative w-full md:w-80 group">
             <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-yellow-400 transition-colors" />
             </div>
             <input 
               type="text" 
               placeholder="Search talent..." 
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
               className="w-full h-14 pl-14 pr-6 bg-card border border-muted rounded-2xl text-[10px] font-black tracking-widest outline-none focus:border-yellow-400 transition-all shadow-sm"
             />
          </div>
        </CardHeader>
        <CardContent className="p-0 transition-colors">
          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/50 text-[10px] font-black tracking-[0.5em] text-muted-foreground border-b border-muted transition-colors text-left">
                  <th className="px-10 py-6">
                      <button onClick={() => setSortAsc(!sortAsc)} className="flex items-center justify-start gap-2 hover:text-foreground transition-colors w-full uppercase">
                         Talent roster name
                      </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted transition-colors">
                {displayedStudents.length === 0 ? (
                  <tr><td className="py-24 text-left px-10 text-muted-foreground/30 font-black text-[12px] tracking-[0.5em]">No students found.</td></tr>
                ) : displayedStudents.map(u => {
                  const isExpanded = expandedId === u.uid
                  return (
                    <React.Fragment key={u.uid}>
                      <tr onClick={() => setExpandedId(isExpanded ? null : u.uid)} className={`hover:bg-muted/20 transition-all cursor-pointer group ${isExpanded ? 'bg-muted/10' : ''}`}>
                        <td className="py-6 px-10 flex items-center justify-between">
                           <div className="flex items-center gap-6">
                              <div className={`w-3 h-3 rounded-full ${isExpanded ? 'bg-yellow-400' : 'bg-muted'} transition-all shadow-[0_0_10px_rgba(250,204,21,0.5)]`} />
                              <div className="text-left">
                                <p className="font-black text-foreground tracking-tighter text-xl transition-colors">{u.name}</p>
                                <p className="text-[9px] text-muted-foreground font-black tracking-widest mt-1 opacity-40">{u.email}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-4">
                             {isSuperAdmin && (
                               <button
                                 onClick={(e) => {
                                   e.stopPropagation()
                                   handleDeleteUser(u.uid, u.name)
                                 }}
                                 disabled={deletingUserId === u.uid}
                                 className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                                 title="Permanently Delete User"
                               >
                                 <Trash2 className="h-4 w-4" />
                               </button>
                             )}
                             <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-500 ${isExpanded ? 'rotate-180 text-yellow-500' : ''}`} />
                           </div>
                        </td>
                      </tr>
                      
                      {isExpanded && (
                        <tr>
                          <td className="p-0 border-b border-muted bg-muted/5">
                             <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="overflow-hidden">
                                <div className="p-10 lg:p-14 space-y-10">
                                 <div className="flex items-center gap-4 border-b border-muted pb-6 text-left">
                                      <div className="w-10 h-10 bg-foreground/10 rounded-xl flex items-center justify-center text-foreground font-black text-[10px]">
                                         {u.name[0]}
                                      </div>
                                       <div>
                                          <h4 className="text-sm font-black tracking-widest text-foreground">Operational track engagement</h4>
                                          <p className="text-[10px] text-muted-foreground font-medium">Enrolled specializations and assigned tutorial personnel.</p>
                                       </div>
                                   </div>
  
                                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                      {(u.enrolledSpecializations || [{ value: u.specialization || 'general' }]).map((spec: any) => {
                                         const specId = spec.value || spec.id || u.specialization || 'general'
                                         const assignment = (u as any).assignedTutors?.[specId]
                                         const specLabel = specs.find(s => s.value === specId)?.label || specId
                                         
                                         return (
                                           <div key={specId} className="p-8 bg-card rounded-[2rem] border border-muted shadow-xl space-y-6 group/spec hover:border-yellow-400/50 transition-colors text-left">
                                             <div className="flex justify-between items-start">
                                                <p className="text-[10px] font-black text-yellow-500 tracking-[0.2em]">{specLabel}</p>
                                                <div className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />
                                             </div>
                                             
                                             {assigningTo === `${u.uid}_${specId}` ? (
                                                <div className="space-y-4">
                                                   <select
                                                     value={assigningTutorId}
                                                     autoFocus
                                                     onChange={e => setAssigningTutorId(e.target.value)}
                                                     className="h-14 w-full px-6 rounded-2xl border-2 border-muted-foreground/40 text-[10px] font-black bg-background text-foreground outline-none shadow-xl focus:border-yellow-400 transition-all appearance-none"
                                                   >
                                                      <option value="" className="bg-card text-foreground">— Select tutor —</option>
                                                      {tutors.filter(t => {
                                                        const tSpecs = (t as any).specializations || []
                                                        return tSpecs.length === 0 || tSpecs.includes(specId)
                                                      }).map(t => (
                                                        <option key={t.uid} value={t.uid} className="bg-card text-foreground">{t.name}</option>
                                                      ))}
                                                   </select>
                                                   <div className="flex gap-3">
                                                      <button onClick={() => handleAssignTutor(u.uid, specId, u.name)} disabled={assignLoading} className="flex-1 h-12 bg-foreground text-background rounded-xl font-black text-[10px] hover:bg-yellow-400 hover:text-black transition-all shadow-lg active:scale-95">
                                                        {assignLoading ? "..." : "Deploy"}
                                                      </button>
                                                      <button onClick={() => setAssigningTo(null)} className="px-6 h-12 bg-muted text-muted-foreground rounded-xl font-black text-[10px] hover:bg-black hover:text-white transition-all">Close</button>
                                                   </div>
                                                </div>
                                             ) : (
                                               <div className="space-y-6">
                                                 <div className="flex items-center gap-4">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-2xl ${assignment ? 'bg-yellow-400 text-black' : 'bg-muted/20 text-muted-foreground opacity-20'}`}>
                                                      {assignment ? (assignment.tutorName[0]) : "?"}
                                                    </div>
                                                      <div>
                                                        <p className="text-[10px] font-black tracking-widest text-muted-foreground mb-1">Assigned support</p>
                                                        <h5 className="font-black text-lg text-foreground tracking-tighter leading-none">
                                                          {assignment?.tutorName || "Awaiting unit"}
                                                        </h5>
                                                      </div>
                                                 </div>
                                                 
                                                 {isSuperAdmin && (
                                                   <button onClick={(e) => { e.stopPropagation(); setAssigningTo(`${u.uid}_${specId}`) }} className="w-full h-12 bg-muted/30 hover:bg-foreground hover:text-background border-2 border-transparent hover:border-black rounded-xl text-[9px] font-black tracking-widest transition-all">
                                                     {assignment ? "Modify deployment" : "Initialize tutor"}
                                                   </button>
                                                 )}
                                               </div>
                                             )}
                                           </div>
                                         )
                                      })}
                                   </div>
                                </div>
                             </motion.div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>

          {!searchQuery && students.length > 5 && (
            <div className="p-10 border-t border-muted bg-muted/5 flex justify-start">
               <button 
                onClick={() => setLimitView(!limitView)}
                className="px-10 h-14 rounded-2xl border-2 border-foreground text-foreground font-black tracking-widest text-[10px] hover:bg-foreground hover:text-background transition-all shadow-lg active:scale-95"
               >
                 {limitView ? `View all ${students.length} students` : "Collapse student pool"}
               </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Role Control Table (All Staff/Admins) ─── */}
      <Card className="border border-muted shadow-premium rounded-[3rem] bg-card overflow-hidden mt-12 transition-colors relative group">
        <CardHeader className="p-10 lg:p-14 border-b border-muted bg-muted/20 transition-colors text-left">
          <CardTitle className="flex items-center gap-5 text-2xl font-black tracking-tighter text-foreground">
            <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-xl text-black">
              <Shield className="h-7 w-7 transition-colors" />
            </div>
            Access & role control
          </CardTitle>
          <p className="text-[10px] font-black tracking-[0.4em] text-muted-foreground mt-4 transition-colors opacity-60">
            Define system capabilities and course track restrictions for your team.
          </p>
        </CardHeader>
        <CardContent className="p-0 transition-colors">
          <div className="overflow-x-auto relative z-10 transition-colors">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/50 text-[10px] font-black tracking-[0.5em] text-muted-foreground border-b border-muted transition-colors">
                  <th className="px-10 py-6">Staff name</th>
                  <th className="px-10 py-6">Identity</th>
                  <th className="px-10 py-6">Authorized specializations</th>
                  <th className="px-10 py-6 text-right">Privilege control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted transition-colors">
                {staff.map(u => (
                  <tr key={u.uid} className="hover:bg-muted/30 transition-colors group text-left">
                    <td className="py-6 px-10">
                      <p className="font-black text-foreground tracking-tighter">{u.name}</p>
                      <p className="text-xs text-muted-foreground font-medium mt-1">{u.email}</p>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest ${
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
                      {(u.role !== 'student' && u.role !== 'staff' && u.role !== 'brand') && (currentAdmin?.role === 'super_admin' || currentAdmin?.role === 'director') ? (
                        <div className="space-y-3">
                          <select 
                            value=""
                            onChange={(e) => handleUpdateStaffSpec(u.uid, e.target.value)}
                            className="w-full px-4 py-2 bg-card border border-muted-foreground/30 rounded-xl text-[10px] font-black text-foreground outline-none hover:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all cursor-pointer appearance-none"
                          >
                            <option value="" className="bg-card text-foreground">Toggle specialization...</option>
                            {specs.map(s => <option key={s.value} value={s.value} className="bg-card text-foreground">{s.label} {(u as any).specializations?.includes(s.value) ? '✓' : ''}</option>)}
                          </select>
                          <div className="flex flex-wrap gap-1.5">
                             {((u as any).specializations || []).map((sId: string) => (
                               <span key={sId} className="px-2 py-1 bg-yellow-400/10 text-yellow-500 rounded-md text-[8px] font-black border border-yellow-400/20">
                                 {specs.find(s => s.value === sId)?.label || sId}
                               </span>
                             ))}
                             {((u as any).specializations || []).length === 0 && (
                               <span className="text-[8px] font-black text-muted-foreground/40">Global access</span>
                             )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                           {((u as any).specializations || []).map((sId: string) => (
                               <span key={sId} className="px-2 py-1 bg-muted rounded-md text-[8px] font-black border border-muted">
                                 {specs.find(s => s.value === sId)?.label || sId}
                               </span>
                             ))}
                           {((u as any).specializations || []).length === 0 && (
                             <span className="text-[10px] font-black text-muted-foreground/50 tracking-widest pt-2 block">
                               Global access
                             </span>
                           )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex justify-end items-center gap-3">
                        {u.role !== 'super_admin' && (
                          <select 
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                initiateRoleChange(u.uid, e.target.value as UserRole, u.name, u.role)
                              }
                            }}
                            className="h-10 px-4 rounded-xl border border-muted-foreground/30 bg-card text-[10px] font-black text-foreground outline-none hover:border-yellow-400 transition-all cursor-pointer appearance-none"
                          >
                            <option value="" className="bg-card text-foreground">Change role...</option>
                            <option value="director" className="bg-card text-foreground">Director</option>
                            <option value="head_of_department" className="bg-card text-foreground">Head of Department</option>
                            <option value="admin" className="bg-card text-foreground">Admin</option>
                            <option value="tutor" className="bg-card text-foreground">Tutor</option>
                            <option value="staff" className="bg-card text-foreground">Staff</option>
                            {u.role !== 'student' && <option value="student" className="bg-card text-foreground">Deactivate</option>}
                          </select>
                        )}
                        {isSuperAdmin && (
                          <button
                            onClick={() => handleDeleteUser(u.uid, u.name)}
                            disabled={deletingUserId === u.uid}
                            className={`p-2.5 rounded-xl transition-all ${
                              deletingUserId === u.uid 
                                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'
                            }`}
                            title="Permanently Delete Staff"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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
      
      {/* ─── Brand Control Table (Corporate Entities) ─── */}
      <Card className="border border-muted shadow-premium rounded-[3rem] bg-card overflow-hidden mt-12 transition-colors relative group">
        <CardHeader className="p-10 lg:p-14 border-b border-muted bg-muted/20 transition-colors text-left">
          <CardTitle className="flex items-center gap-5 text-2xl font-black tracking-tighter text-foreground">
            <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-xl text-black">
              <Globe className="h-7 w-7 transition-colors" />
            </div>
            Brand assets and corporate control
          </CardTitle>
          <p className="text-[10px] font-black tracking-[0.4em] text-muted-foreground mt-4 transition-colors opacity-60">
            Manage industry partners, recruitment agencies, and corporate collaborators.
          </p>
        </CardHeader>
        <CardContent className="p-0 transition-colors">
          <div className="overflow-x-auto relative z-10 transition-colors">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/50 text-[10px] font-black tracking-[0.5em] text-muted-foreground border-b border-muted transition-colors">
                  <th className="px-10 py-6">Company / client name</th>
                  <th className="px-10 py-6">Identity</th>
                  <th className="px-10 py-6">Access status</th>
                  <th className="px-10 py-6 text-right">Privilege control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted transition-colors">
                {brands.length === 0 ? (
                  <tr><td colSpan={4} className="py-12 text-center text-muted-foreground text-[10px] font-black tracking-widest opacity-40">No brand accounts registered.</td></tr>
                ) : (
                  brands.map(u => (
                    <tr key={u.uid} className="hover:bg-muted/30 transition-colors group text-left">
                      <td className="py-6 px-10">
                        <p className="font-black text-foreground tracking-tighter">{u.name}</p>
                        <p className="text-xs text-muted-foreground font-medium mt-1">{u.email}</p>
                      </td>
                      <td className="px-6 py-6 font-black text-yellow-500 text-[10px] tracking-widest">
                        Brand partner
                      </td>
                      <td className="px-6 py-6">
                        <span className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest ${
                          u.hasPaidAccess ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                        }`}>
                          {u.hasPaidAccess ? 'Paid access' : 'No access'}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex justify-end items-center gap-3">
                           <select 
                              value=""
                              onChange={(e) => {
                                if (e.target.value) {
                                  initiateRoleChange(u.uid, e.target.value as UserRole, u.name, u.role)
                                }
                              }}
                              className="h-10 px-4 rounded-xl border border-muted-foreground/30 bg-card text-[10px] font-black text-foreground outline-none hover:border-yellow-400 transition-all cursor-pointer appearance-none"
                            >
                              <option value="" className="bg-card text-foreground">Change role...</option>
                              <option value="director" className="bg-card text-foreground">Director</option>
                              <option value="head_of_department" className="bg-card text-foreground">Head of department</option>
                              <option value="admin" className="bg-card text-foreground">Admin</option>
                              <option value="tutor" className="bg-card text-foreground">Tutor</option>
                              <option value="staff" className="bg-card text-foreground">Staff</option>
                              <option value="student" className="bg-card text-foreground">Deactivate</option>
                              <option value="brand" className="bg-card text-foreground">Keep as brand</option>
                            </select>
                           {isSuperAdmin && (
                             <button
                               onClick={() => handleDeleteUser(u.uid, u.name)}
                               disabled={deletingUserId === u.uid}
                               className={`p-2.5 rounded-xl transition-all ${
                                 deletingUserId === u.uid 
                                   ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                   : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'
                               }`}
                               title="Permanently Delete Brand Account"
                             >
                               <Trash2 className="h-4 w-4" />
                             </button>
                           )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <PasswordVerifyDialog 
        isOpen={verifyOpen}
        onClose={() => setVerifyOpen(false)}
        onVerified={handleVerifiedAction}
        title={`Authorize change for ${pendingAction?.userName}`}
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

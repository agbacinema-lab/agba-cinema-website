"use client"

import { useState, useEffect } from "react"
import { adminService, studentService } from "@/lib/services"
import { useAuth } from "@/context/AuthContext"
import { UserProfile, UserRole } from "@/lib/types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Shield, UserCheck, ChevronDown } from "lucide-react"
import PasswordVerifyDialog from "./PasswordVerifyDialog"
import { toast } from "sonner"

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

  useEffect(() => {
    adminService.getAllUsers().then(data => {
      setUsers(data)
      setTutors(data.filter(u => u.role === 'tutor' || u.role === 'admin'))
      setLoading(false)
    })
  }, [])

  const initiateRoleChange = (userId: string, targetRole: UserRole, userName: string, currentRole: string) => {
    setPendingAction({ userId, targetRole, userName, currentRole })
    setVerifyOpen(true)
  }

  const handleVerifiedAction = async () => {
    if (!pendingAction || !currentAdmin) return
    const { userId, targetRole, userName } = pendingAction
    if (currentAdmin.role === 'super_admin') {
      await adminService.updateUserRole(userId, targetRole)
      toast.success(`${userName} is now ${targetRole?.replace('_', ' ')}`)
      window.location.reload()
    } else {
      await adminService.createApprovalRequest({
        type: 'role_change',
        requestBy: { uid: currentAdmin.uid, name: currentAdmin.name, email: currentAdmin.email },
        data: { userId, targetRole, userName, currentRole: pendingAction.currentRole }
      })
      toast.success("Role change request sent to Super Admin for approval.")
    }
  }

  const handleAssignTutor = async (studentId: string, studentName: string) => {
    if (!assigningTutorId) { toast.error("Please select a tutor."); return }
    const tutor = tutors.find(t => t.uid === assigningTutorId)
    if (!tutor) return
    setAssignLoading(true)
    try {
      await studentService.assignTutorToStudent(studentId, tutor.uid, tutor.name)
      toast.success(`${tutor.name} has been assigned as tutor for ${studentName}.`)
      setAssigningTo(null)
      setAssigningTutorId("")
      // Refresh user list
      const data = await adminService.getAllUsers()
      setUsers(data)
    } catch (e) {
      toast.error("Failed to assign tutor.")
    } finally {
      setAssignLoading(false)
    }
  }

  if (loading) return (
    <div className="p-12 text-center text-muted-foreground font-black uppercase tracking-widest animate-pulse">Loading Talent Records...</div>
  )

  const students = users.filter(u => u.role === 'student')
  const staff = users.filter(u => u.role !== 'student')

  return (
    <>
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
            Assign students to specific tutors for review and feedback.
          </p>
        </CardHeader>
        <CardContent className="p-0 transition-colors">
          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/50 text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground border-b border-muted transition-colors">
                  <th className="px-10 py-6">Student Name</th>
                  <th className="px-10 py-6">Course Track</th>
                  <th className="px-10 py-6">Assigned Tutor</th>
                  {isSuperAdmin && <th className="px-10 py-6 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-muted transition-colors">
                {students.length === 0 ? (
                  <tr><td colSpan={4} className="py-24 text-center text-muted-foreground/30 font-black uppercase text-[12px] tracking-[0.5em] italic">No students found.</td></tr>
                ) : students.map(u => (
                  <tr key={u.uid} className="hover:bg-muted/10 transition-colors group">
                    <td className="py-8 px-10">
                      <p className="font-black text-foreground uppercase italic tracking-tighter text-xl transition-colors">{u.name}</p>
                      <p className="text-xs text-muted-foreground font-medium mt-1 truncate max-w-sm italic opacity-60 transition-colors">{u.email}</p>
                    </td>
                    <td className="px-10 py-8">
                      <span className="px-5 py-2.5 bg-muted/20 border border-muted/50 rounded-xl text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] whitespace-nowrap transition-all group-hover:border-foreground/30">
                        {u.specialization || "UNSET"}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      {u.tutorName ? (
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                           <span className="px-5 py-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-[10px] font-black uppercase text-indigo-500 tracking-[0.2em] shadow-lg shadow-indigo-500/5">
                             {u.tutorName}
                           </span>
                        </div>
                      ) : (
                        <span className="px-5 py-2.5 border border-dashed border-muted/50 rounded-xl text-[10px] font-black uppercase text-muted-foreground/30 tracking-widest italic transition-colors group-hover:text-muted-foreground/60">
                          Pending...
                        </span>
                      )}
                    </td>
                    {isSuperAdmin && (
                      <td className="px-10 py-8 text-right">
                        {assigningTo === u.uid ? (
                          <div className="flex items-center gap-4 justify-end">
                            <select
                               value={assigningTutorId}
                               onChange={e => setAssigningTutorId(e.target.value)}
                               className="h-14 px-6 rounded-2xl border border-muted text-[11px] font-black bg-card text-foreground outline-none focus:border-yellow-400 focus:ring-8 ring-yellow-400/5 transition-all shadow-inner uppercase tracking-tighter"
                            >
                               <option value="">— SELECT TUTOR —</option>
                              {tutors.map(t => (
                                <option key={t.uid} value={t.uid}>{t.name}</option>
                              ))}
                            </select>
                            <button
                               onClick={() => handleAssignTutor(u.uid, u.name)}
                               disabled={assignLoading}
                               className="h-14 px-8 bg-foreground text-background rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all shadow-2xl active:scale-95 disabled:opacity-50"
                            >
                               {assignLoading ? "..." : "ASSIGN"}
                            </button>
                            <button
                               onClick={() => { setAssigningTo(null); setAssigningTutorId("") }}
                               className="h-14 px-6 text-muted-foreground font-black text-[10px] uppercase tracking-widest hover:text-red-500 transition-colors"
                            >
                               CANCEL
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAssigningTo(u.uid)}
                            className="h-14 px-8 border border-muted rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:bg-foreground hover:text-background hover:scale-105 active:scale-95 transition-all flex items-center gap-3 ml-auto shadow-lg"
                          >
                            <UserCheck className="h-5 w-5" /> {u.tutorName ? "CHANGE TUTOR" : "ASSIGN"}
                          </button>
                        )}
                      </td>
                    )}
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
            Manage Roles
          </CardTitle>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mt-4 transition-colors opacity-60">
            Manage the roles and permissions for all staff members.
          </p>
        </CardHeader>
        <CardContent className="p-0 transition-colors">
          <div className="overflow-x-auto relative z-10 transition-colors">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/50 text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground border-b border-muted transition-colors">
                  <th className="px-10 py-6">Staff Name</th>
                  <th className="px-10 py-6">Current Role</th>
                  <th className="px-10 py-6 text-right">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted transition-colors">
                {users.map(u => (
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

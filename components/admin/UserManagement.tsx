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
    <div className="p-12 text-center text-gray-500 font-bold animate-pulse">Loading Talent Records...</div>
  )

  const students = users.filter(u => u.role === 'student')
  const staff = users.filter(u => u.role !== 'student')

  return (
    <>
      {/* ─── Tutor Assignment Table (Students) ─── */}
      <Card className="border-none shadow-xl rounded-[3rem] bg-white overflow-hidden">
        <CardHeader className="p-10 border-b border-gray-50">
          <CardTitle className="flex items-center gap-4 text-2xl font-black italic uppercase tracking-tighter">
            <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-black" />
            </div>
            Tutor Assignment Matrix
          </CardTitle>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2">
            Assign each student to a dedicated tutor — only that tutor can grade their work.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[9px] font-black uppercase tracking-widest text-gray-400">
                  <th className="px-10 py-5">Student</th>
                  <th className="px-6 py-5">Track</th>
                  <th className="px-6 py-5">Current Tutor</th>
                  {isSuperAdmin && <th className="px-6 py-5 text-right">Assign Tutor</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.length === 0 ? (
                  <tr><td colSpan={4} className="py-16 text-center text-gray-300 font-black uppercase text-[10px] tracking-widest">No students enrolled yet.</td></tr>
                ) : students.map(u => (
                  <tr key={u.uid} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-6 px-10">
                      <p className="font-black text-gray-900 uppercase italic tracking-tighter">{u.name}</p>
                      <p className="text-xs text-gray-400 font-medium mt-1 truncate max-w-[200px]">{u.email}</p>
                    </td>
                    <td className="px-6 py-6">
                      <span className="px-4 py-2 bg-gray-50 rounded-xl text-[10px] font-black uppercase text-gray-500 tracking-widest whitespace-nowrap">
                        {u.specialization || "Unassigned"}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      {u.tutorName ? (
                        <span className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] font-black uppercase text-indigo-700 tracking-widest">
                          {u.tutorName}
                        </span>
                      ) : (
                        <span className="px-4 py-2 border border-dashed border-gray-200 rounded-xl text-[10px] font-black uppercase text-gray-300 tracking-widest">
                          Unassigned
                        </span>
                      )}
                    </td>
                    {isSuperAdmin && (
                      <td className="px-6 py-6 text-right">
                        {assigningTo === u.uid ? (
                          <div className="flex items-center gap-3 justify-end">
                            <select
                              value={assigningTutorId}
                              onChange={e => setAssigningTutorId(e.target.value)}
                              className="h-12 px-4 rounded-2xl border border-gray-200 text-[11px] font-black bg-white outline-none focus:border-black transition-all"
                            >
                              <option value="">— Select Tutor —</option>
                              {tutors.map(t => (
                                <option key={t.uid} value={t.uid}>{t.name}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleAssignTutor(u.uid, u.name)}
                              disabled={assignLoading}
                              className="h-12 px-6 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all disabled:opacity-50"
                            >
                              {assignLoading ? "..." : "Confirm"}
                            </button>
                            <button
                              onClick={() => { setAssigningTo(null); setAssigningTutorId("") }}
                              className="h-12 px-4 text-gray-300 font-black text-[10px] uppercase hover:text-red-500 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAssigningTo(u.uid)}
                            className="h-12 px-8 border border-gray-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-black hover:bg-black hover:text-white transition-all flex items-center gap-2 ml-auto"
                          >
                            <UserCheck className="h-4 w-4" /> {u.tutorName ? "Reassign" : "Assign Tutor"}
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
      <Card className="border-none shadow-xl rounded-[3rem] bg-white overflow-hidden">
        <CardHeader className="p-10 border-b border-gray-50">
          <CardTitle className="flex items-center gap-4 text-2xl font-black italic uppercase tracking-tighter">
            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-yellow-400" />
            </div>
            Access Hierarchy Control
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[9px] font-black uppercase tracking-widest text-gray-400">
                  <th className="px-10 py-5">Name & Email</th>
                  <th className="px-6 py-5">Current Role</th>
                  <th className="px-6 py-5 text-right">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
                  <tr key={u.uid} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-6 px-10">
                      <p className="font-black text-gray-900 uppercase italic tracking-tighter">{u.name}</p>
                      <p className="text-xs text-gray-400 font-medium mt-1">{u.email}</p>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        u.role === 'super_admin' ? 'bg-purple-600 text-white' :
                        u.role === 'director' ? 'bg-red-600 text-white' :
                        u.role === 'head_of_department' ? 'bg-indigo-100 text-indigo-700' :
                        u.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                        u.role === 'tutor' ? 'bg-yellow-400 text-black' :
                        u.role === 'staff' ? 'bg-orange-100 text-orange-700' :
                        u.role === 'student' ? 'bg-gray-900 text-white' :
                        'bg-gray-100 text-gray-700'
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
    red: "bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-600 hover:text-white",
    blue: "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-600 hover:text-white",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-100 hover:bg-yellow-400 hover:text-black",
    orange: "bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-600 hover:text-white",
    gray: "bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-900 hover:text-white"
  }
  return (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-lg border text-[9px] font-black tracking-widest transition-all ${styles[variant]}`}>
      {label}
    </button>
  )
}

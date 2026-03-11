"use client"

import { useState, useEffect } from "react"
import { adminService } from "@/lib/services"
import { useAuth } from "@/context/AuthContext"
import { UserProfile, UserRole } from "@/lib/types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Shield, Lock } from "lucide-react"
import PasswordVerifyDialog from "./PasswordVerifyDialog"

export default function UserManagement() {
  const { profile: currentAdmin } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  
  // Security State
  const [verifyOpen, setVerifyOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<{ userId: string; targetRole: UserRole; userName: string; currentRole: string } | null>(null)

  useEffect(() => {
    adminService.getAllUsers().then(data => {
      setUsers(data)
      setLoading(false)
    })
  }, [])

  const initiateRoleChange = (userId: string, targetRole: UserRole, userName: string, currentRole: string) => {
    setPendingAction({ userId, targetRole, userName, currentRole })
    setVerifyOpen(true)
  }

  const handleVerifiedAction = async () => {
    if (!pendingAction || !currentAdmin) return

    const { userId, targetRole, userName, currentRole } = pendingAction
    
    // Logic: If user is Super Admin, execute directly. Otherwise, create request.
    if (currentAdmin.role === 'super_admin') {
      await adminService.updateUserRole(userId, targetRole)
      alert(`${userName} is now ${targetRole?.replace('_', ' ')}`)
      window.location.reload()
    } else {
      await adminService.createApprovalRequest({
        type: 'role_change',
        requestBy: { uid: currentAdmin.uid, name: currentAdmin.name, email: currentAdmin.email },
        data: { userId, targetRole, userName, currentRole }
      })
      alert("Role change request sent to Super Admin for approval.")
    }
  }

  if (loading) return (
    <div className="p-12 text-center text-gray-500 font-bold animate-pulse">
      Loading Talent Records...
    </div>
  )

  return (
    <>
      <Card className="border-none shadow-premium rounded-[2.5rem] bg-white p-8">
        <CardHeader className="p-0 mb-8">
          <CardTitle className="flex items-center gap-3 text-2xl font-black">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
              <Shield className="h-5 w-5 text-black" />
            </div>
            Talent Hierarchy Control
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-tighter">
                  <th className="pb-4">Name & Email</th>
                  <th className="pb-4">Current Status</th>
                  <th className="pb-4 text-right">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
                  <tr key={u.uid} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-6">
                      <p className="font-bold text-gray-900 leading-tight">{u.name}</p>
                      <p className="text-xs text-gray-400 font-medium">{u.email}</p>
                    </td>
                    <td className="py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        u.role === 'super_admin' ? 'bg-purple-600 text-white' :
                        u.role === 'director' ? 'bg-red-600 text-white' :
                        u.role === 'head_of_department' ? 'bg-indigo-100 text-indigo-700' :
                        u.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                        u.role === 'tutor' ? 'bg-yellow-100 text-yellow-700' :
                        u.role === 'staff' ? 'bg-orange-100 text-orange-700' :
                        u.role === 'student' ? 'bg-gray-800 text-white' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {u.role?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-6 text-right">
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
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-100 hover:bg-yellow-400 hover:text-black",
    orange: "bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-600 hover:text-white",
    gray: "bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-900 hover:text-white"
  }

  return (
    <button 
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg border text-[9px] font-black tracking-widest transition-all ${styles[variant]}`}
    >
      {label}
    </button>
  )
}

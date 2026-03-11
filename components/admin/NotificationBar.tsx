"use client"

import { useState, useEffect } from "react"
import { adminService } from "@/lib/services"
import { ApprovalRequest } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Bell, Check, X, UserCog, GraduationCap } from "lucide-react"

export default function NotificationBar() {
  const [requests, setRequests] = useState<ApprovalRequest[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const fetchRequests = () => {
    adminService.getPendingApprovals().then(setRequests)
  }

  useEffect(() => {
    fetchRequests()
    const interval = setInterval(fetchRequests, 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [])

  const handleProcess = async (id: string, approved: boolean) => {
    await adminService.processApproval(id, approved)
    fetchRequests()
  }

  if (requests.length === 0) return null

  return (
    <div className="fixed top-6 right-6 z-[100]">
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="bg-red-600 text-white p-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all outline-none animate-bounce"
        >
          <Bell className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 bg-white text-red-600 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-red-600">
            {requests.length}
          </span>
        </button>

        {isOpen && (
          <div className="absolute top-16 right-0 w-[400px] bg-white rounded-[2rem] shadow-3xl border border-gray-100 overflow-hidden transform origin-top-right transition-all">
            <div className="bg-gray-900 p-6 text-white">
              <h3 className="text-lg font-black flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-yellow-400" />
                Pending Approvals
              </h3>
              <p className="text-xs text-gray-400 mt-1">These actions require your official authorization</p>
            </div>
            
            <div className="max-h-[500px] overflow-y-auto p-4 space-y-4">
              {requests.map(req => (
                <div key={req.id} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 transition-all hover:border-red-200">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-xl ${req.type === 'role_change' ? 'bg-indigo-100 text-indigo-600' : 'bg-yellow-100 text-yellow-600'}`}>
                      {req.type === 'role_change' ? <UserCog className="h-5 w-5" /> : <GraduationCap className="h-5 w-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">
                        {req.type === 'role_change' 
                          ? `Role Change for ${req.data.userName}` 
                          : `Internship Readiness: ${req.data.userName}`}
                      </h4>
                      <p className="text-[10px] text-gray-500 font-medium">Requested by: {req.requestBy.name}</p>
                      {req.type === 'role_change' && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded text-gray-600">{req.data.currentRole}</span>
                          <span className="text-gray-400 text-xs">→</span>
                          <span className="text-[10px] bg-yellow-400 px-2 py-0.5 rounded text-black font-bold">{req.data.targetRole?.replace('_', ' ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleProcess(req.id, true)}
                      className="flex-1 bg-black text-white hover:bg-green-600 h-10 rounded-xl font-bold text-xs"
                    >
                      <Check className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <button 
                      onClick={() => handleProcess(req.id, false)}
                      className="w-10 h-10 bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-xl flex items-center justify-center transition-all"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ShieldCheck({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

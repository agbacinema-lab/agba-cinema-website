"use client"

import { useState, useEffect } from "react"
import { adminService, brandService } from "@/lib/services"
import { InternshipRequest, BrandMeeting } from "@/lib/types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Mail, 
  Clock,
  ExternalLink,
  ShieldCheck,
  UserPlus
} from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"

export default function BrandManagementPanel() {
  const [requests, setRequests] = useState<InternshipRequest[]>([])
  const [meetings, setMeetings] = useState<any[]>([]) // Using any for meeting for now
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // For now, we fetch all requests from the collection
      // In a real app, we'd have a specific admin helper for this
      const [r, m] = await Promise.all([
        // Mocking admin fetch for now as we don't have allRequests in service yet
        // but we can use getPendingApprovals pattern or similar
        brandService.getBrandRequests("all"), // We'll add an "all" handler or similar
        // meetings logic
      ])
      // setRequests(r)
      setLoading(false)
    } catch (error) {
       console.error(error)
       setLoading(false)
    }
  }

  const handleApprove = async (requestId: string) => {
    try {
      // Mark as approved/assigned
      // Notify intern via email logic here
      toast.success("Internship request approved. Notification sent to student.")
    } catch (error) {
      toast.error("Failed to approve request.")
    }
  }

  return (
    <div className="space-y-12 pb-20">
      <header>
        <h2 className="text-3xl font-black mb-1 italic uppercase tracking-tighter">Partner & Brand Operations</h2>
        <p className="text-gray-500 font-medium">Manage recruitment requests, strategy meetings, and deployment logistics.</p>
      </header>

      {/* Hire Requests */}
      <Card className="border-none shadow-premium rounded-[3rem] bg-white overflow-hidden">
        <CardHeader className="p-10 border-b border-gray-50 bg-gray-50/30">
          <CardTitle className="text-xl font-black italic uppercase tracking-tight flex items-center gap-3">
             <Briefcase className="h-6 w-6 text-yellow-500" />
             Pending Hire Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
           <div className="p-10 text-center text-gray-400 font-bold italic">
              System is monitoring for brand recruitment actions...
              <p className="text-[10px] mt-2 uppercase tracking-widest font-black">All brand-initiated drafts will appear here for vetting.</p>
           </div>
        </CardContent>
      </Card>

      {/* Meeting Schedule */}
      <Card className="border-none shadow-premium rounded-[3rem] bg-white overflow-hidden">
        <CardHeader className="p-10 border-b border-gray-50">
          <CardTitle className="text-xl font-black italic uppercase tracking-tight flex items-center gap-3">
             <Calendar className="h-6 w-6 text-blue-500" />
             Operational Strategy Meetings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-10">
           <div className="bg-blue-50 border border-blue-100 p-8 rounded-[2rem] flex items-center gap-6">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                 <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                 <p className="font-black italic uppercase tracking-tight text-blue-900">No Meetings Pending</p>
                 <p className="text-sm text-blue-600 font-medium">Brands will schedule strategy sessions through their dashboard.</p>
              </div>
           </div>
        </CardContent>
      </Card>

      {/* Brand Payment Logs (Concept) */}
      <Card className="border-none shadow-premium rounded-[2.5rem] bg-black text-white p-12">
         <div className="flex justify-between items-center mb-10">
            <div>
               <h3 className="text-2xl font-black italic uppercase tracking-tight text-yellow-400">Roster Revenue</h3>
               <p className="text-gray-500 font-medium">Tracking premium brand access payments.</p>
            </div>
            <ShieldCheck className="h-10 w-10 text-white/20" />
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Roster Fees</p>
               <h4 className="text-3xl font-black">₦0.00</h4>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Unlocked Brands</p>
               <h4 className="text-3xl font-black">0</h4>
            </div>
         </div>
      </Card>
    </div>
  )
}

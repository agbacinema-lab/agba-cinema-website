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
  UserPlus,
  Zap,
  TrendingUp,
  CreditCard
} from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"

export default function BrandManagementPanel() {
  const [requests, setRequests] = useState<InternshipRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ revenue: 0, brands: 0 })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const { collection, getDocs, query, orderBy, where } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      
      const [r, p, b] = await Promise.all([
        brandService.getBrandRequests("all"),
        adminService.getSalesStats(),
        getDocs(query(collection(db, "users"), where("role", "==", "brand")))
      ])
      
      setRequests(r)
      setStats({
        revenue: p.totalRevenue || 0,
        brands: b.size || 0
      })
    } catch (error) {
       console.error(error)
    } finally {
       setLoading(false)
    }
  }

  const handleApprove = async (requestId: string) => {
    try {
      const { doc, updateDoc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      await updateDoc(doc(db, "internship_requests", requestId), { 
        status: 'assigned',
        updatedAt: new Date()
      })
      toast.success("Internship request approved.")
      loadData()
    } catch (error) {
      toast.error("Failed to approve request.")
    }
  }

  const handleDecline = async (requestId: string) => {
    try {
      const { doc, updateDoc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      await updateDoc(doc(db, "internship_requests", requestId), { 
        status: 'declined',
        updatedAt: new Date()
      })
      toast.success("Request declined.")
      loadData()
    } catch (error) {
      toast.error("Action failed.")
    }
  }

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-muted pb-8 transition-colors">
        <div className="space-y-2">
           <div className="flex items-center gap-3 mb-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.4em]">Corporate Nexus</span>
           </div>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none text-foreground transition-colors">Partner & Brand Operations</h2>
            <p className="text-muted-foreground font-medium mt-2 text-lg">Manage recruitment requests, strategy meetings, and deployment logistics.</p>
         </div>
         <div className="px-10 h-16 bg-foreground text-background rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-widest group transition-all hover:bg-yellow-400 hover:text-black">
            Level 4 Authority
         </div>
      </header>

      {/* Hire Requests */}
      <Card className="border border-muted shadow-premium rounded-[3rem] bg-card overflow-hidden transition-colors relative group">
        <CardHeader className="p-10 border-b border-muted bg-muted/20 transition-colors flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-4 text-foreground transition-colors">
             <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-xl">
                <Briefcase className="h-6 w-6 text-black" />
             </div>
             Pending Recruitment Requests
          </CardTitle>
          <div className="flex items-center gap-2">
             <div className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">REAL-TIME FEED</span>
          </div>
        </CardHeader>
        <CardContent className="p-0 transition-colors">
            {requests.filter(r => r.status === 'pending').length === 0 ? (
              <div className="p-24 text-left space-y-8 relative z-10">
                 <div className="w-20 h-20 bg-muted/10 rounded-[2rem] flex items-center justify-center border border-muted/20">
                    <ShieldCheck className="h-10 w-10 text-muted-foreground/30" />
                 </div>
                 <div>
                   <p className="text-2xl font-black tracking-tight text-foreground transition-colors">Operational silence</p>
                   <p className="text-muted-foreground font-medium mt-2 max-w-sm">No brand recruitment actions currently detected. All drafts will appear here for high-level vetting.</p>
                 </div>
              </div>
           ) : (
             <div className="overflow-x-auto relative z-10">
                <table className="w-full text-left">
                   <thead>
                      <tr className="bg-muted/50 text-[10px] font-black tracking-[0.4em] text-muted-foreground border-b border-muted">
                         <th className="px-10 py-6">Partner brand</th>
                         <th className="px-10 py-6">Target student</th>
                         <th className="px-10 py-6">Status</th>
                         <th className="px-10 py-6 text-right">Deployment</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-muted">
                      {requests.filter(r => r.status === 'pending').map(request => (
                        <tr key={request.requestId} className="group/row hover:bg-muted/10 transition-colors">
                           <td className="px-10 py-6">
                              <p className="text-sm font-black text-foreground tracking-tight">{request.brandName}</p>
                               <p className="text-[10px] text-muted-foreground font-medium">Protocol ID: {request.requestId.slice(0,8)}</p>
                           </td>
                           <td className="px-10 py-6 text-sm font-bold text-foreground">
                              {request.studentName}
                           </td>
                           <td className="px-10 py-6">
                              <span className="px-3 py-1 bg-yellow-400/10 text-yellow-600 rounded-full text-[9px] font-black tracking-widest">Awaiting vetting</span>
                           </td>
                           <td className="px-10 py-6 text-right space-x-2">
                              <button onClick={() => handleApprove(request.requestId)} className="px-4 py-2 bg-green-500 text-white rounded-xl text-[10px] font-black tracking-widest hover:bg-green-600 transition-all">Approve</button>
                              <button onClick={() => handleDecline(request.requestId)} className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-black tracking-widest hover:bg-red-500 hover:text-white transition-all">Decline</button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           )}
           <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-yellow-400/5 blur-[120px] rounded-full pointer-events-none group-hover:bg-yellow-400/10 transition-all duration-700" />
        </CardContent>
      </Card>

      {/* Meeting Schedule */}
      <Card className="border border-muted shadow-premium rounded-[3rem] bg-card overflow-hidden transition-colors relative group">
        <CardHeader className="p-10 border-b border-muted transition-colors">
          <CardTitle className="text-xl font-black tracking-tighter flex items-center gap-4 text-foreground transition-colors">
             <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Calendar className="h-6 w-6 text-white" />
             </div>
             Strategy deployment sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-10 transition-colors relative z-10">
           <div className="bg-indigo-600/5 border border-indigo-600/10 p-10 rounded-[2.5rem] flex items-center gap-10 transition-colors group-hover:bg-indigo-600/10">
              <div className="w-20 h-20 bg-indigo-600/20 rounded-[1.8rem] flex items-center justify-center shrink-0 shadow-2xl">
                 <Clock className="h-10 w-10 text-indigo-500" />
              </div>
              <div>
                 <p className="text-2xl font-black tracking-tighter text-indigo-400 leading-none">Status: Standby</p>
                 <p className="text-muted-foreground font-medium mt-3 text-lg">Partnered brands schedule operational strategy sessions through their respective command dashboards.</p>
              </div>
           </div>
           <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none transition-all group-hover:bg-indigo-600/10" />
        </CardContent>
      </Card>

      {/* Brand Payment Logs */}
      <Card className="border border-muted shadow-premium rounded-[3rem] bg-card p-12 transition-colors relative overflow-hidden group">
         <div className="flex justify-between items-center mb-10 relative z-10">
            <div className="space-y-2">
               <h3 className="text-2xl font-black tracking-tighter text-yellow-500">Roster revenue</h3>
               <p className="text-muted-foreground font-black text-[10px] tracking-widest opacity-60">Ledger synchronization active</p>
            </div>
            <div className="w-16 h-16 bg-muted/10 rounded-2xl flex items-center justify-center border border-muted/20">
               <ShieldCheck className="h-8 w-8 text-muted-foreground/30" />
            </div>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="bg-muted/10 border border-muted p-8 rounded-[2rem] transition-all hover:bg-muted/20 hover:border-foreground/20">
               <p className="text-[10px] font-black tracking-[0.4em] text-muted-foreground mb-3 leading-none">Gross cumulative fees</p>
               <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                  <h4 className="text-3xl font-black text-foreground tracking-tighter leading-none">₦{stats.revenue.toLocaleString()}</h4>
               </div>
            </div>
            
            <div className="bg-muted/10 border border-muted p-8 rounded-[2rem] transition-all hover:bg-muted/20 hover:border-foreground/20">
               <p className="text-[10px] font-black tracking-[0.4em] text-muted-foreground mb-3 leading-none">Activated access points</p>
               <div className="flex items-center gap-3">
                  <Briefcase className="h-6 w-6 text-yellow-500" />
                  <h4 className="text-3xl font-black text-foreground tracking-tighter leading-none">{stats.brands}</h4>
               </div>
            </div>
         </div>

         <div className="mt-12 pt-10 border-t border-muted relative z-10 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
               <CreditCard className="h-5 w-5 text-green-500" />
            </div>
            <div>
               <p className="text-[10px] font-black tracking-widest text-foreground transition-colors">Secured via Paystack API</p>
               <p className="text-[8px] font-black tracking-[0.2em] text-muted-foreground mt-1">Operational endpoints verified</p>
            </div>
         </div>

         <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-yellow-400/5 blur-[120px] rounded-full pointer-events-none transition-all group-hover:bg-yellow-400/10" />
      </Card>
    </div>
  )
}

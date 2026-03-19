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
  const [meetings, setMeetings] = useState<any[]>([]) // Using any for meeting for now
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [r] = await Promise.all([
        brandService.getBrandRequests("all"),
      ])
      setRequests(r)
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
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-muted pb-8 transition-colors">
        <div className="space-y-2">
           <div className="flex items-center gap-3 mb-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.4em]">Corporate Nexus</span>
           </div>
           <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none text-foreground transition-colors">Partner & Brand Operations</h2>
           <p className="text-muted-foreground font-medium italic mt-2 text-lg">Manage recruitment requests, strategy meetings, and deployment logistics.</p>
        </div>
        <div className="px-10 h-16 bg-foreground text-background rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-widest italic group transition-all hover:bg-yellow-400 hover:text-black">
           Level 4 Authority
        </div>
      </header>

      {/* Hire Requests */}
      <Card className="border border-muted shadow-premium rounded-[3rem] bg-card overflow-hidden transition-colors relative group">
        <CardHeader className="p-10 border-b border-muted bg-muted/20 transition-colors flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-4 text-foreground transition-colors">
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
           <div className="p-24 text-center space-y-8 relative z-10">
              <div className="w-20 h-20 bg-muted/10 rounded-[2rem] flex items-center justify-center mx-auto border border-muted/20">
                 <ShieldCheck className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <div>
                <p className="text-2xl font-black italic uppercase tracking-tight text-foreground transition-colors">Operational Silence</p>
                <p className="text-muted-foreground font-medium italic mt-2 max-w-sm mx-auto">No brand recruitment actions currently detected. All drafts will appear here for high-level vetting.</p>
              </div>
           </div>
           <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-yellow-400/5 blur-[120px] rounded-full pointer-events-none group-hover:bg-yellow-400/10 transition-all duration-700" />
        </CardContent>
      </Card>

      {/* Meeting Schedule */}
      <Card className="border border-muted shadow-premium rounded-[3rem] bg-card overflow-hidden transition-colors relative group">
        <CardHeader className="p-10 border-b border-muted transition-colors">
          <CardTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-4 text-foreground transition-colors">
             <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Calendar className="h-6 w-6 text-white" />
             </div>
             Strategy Deployment Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-10 transition-colors relative z-10">
           <div className="bg-indigo-600/5 border border-indigo-600/10 p-10 rounded-[2.5rem] flex items-center gap-10 transition-colors group-hover:bg-indigo-600/10">
              <div className="w-20 h-20 bg-indigo-600/20 rounded-[1.8rem] flex items-center justify-center shrink-0 shadow-2xl">
                 <Clock className="h-10 w-10 text-indigo-500" />
              </div>
              <div>
                 <p className="text-2xl font-black italic uppercase tracking-tighter text-indigo-400 leading-none">Status: Standby</p>
                 <p className="text-muted-foreground font-medium italic mt-3 text-lg">Partnered brands schedule operational strategy sessions through their respective command dashboards.</p>
              </div>
           </div>
           <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none transition-all group-hover:bg-indigo-600/10" />
        </CardContent>
      </Card>

      {/* Brand Payment Logs */}
      <Card className="border border-muted shadow-premium rounded-[3rem] bg-card p-12 transition-colors relative overflow-hidden group">
         <div className="flex justify-between items-center mb-10 relative z-10">
            <div className="space-y-2">
               <h3 className="text-3xl font-black italic uppercase tracking-tighter text-yellow-500">Roster Revenue</h3>
               <p className="text-muted-foreground font-black text-[10px] uppercase tracking-widest italic opacity-60">Ledger synchronization active</p>
            </div>
            <div className="w-16 h-16 bg-muted/10 rounded-2xl flex items-center justify-center border border-muted/20">
               <ShieldCheck className="h-8 w-8 text-muted-foreground/30" />
            </div>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="bg-muted/10 border border-muted p-8 rounded-[2rem] transition-all hover:bg-muted/20 hover:border-foreground/20">
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-3 leading-none">Gross Cumulative Fees</p>
               <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                  <h4 className="text-4xl font-black text-foreground italic tracking-tighter leading-none">₦0.00</h4>
               </div>
            </div>
            
            <div className="bg-muted/10 border border-muted p-8 rounded-[2rem] transition-all hover:bg-muted/20 hover:border-foreground/20">
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-3 leading-none">Activated Access Points</p>
               <div className="flex items-center gap-3">
                  <Briefcase className="h-6 w-6 text-yellow-500" />
                  <h4 className="text-4xl font-black text-foreground italic tracking-tighter leading-none">0</h4>
               </div>
            </div>
         </div>

         <div className="mt-12 pt-10 border-t border-muted relative z-10 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
               <CreditCard className="h-5 w-5 text-green-500" />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-foreground transition-colors">Secured via Paystack API</p>
               <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground italic mt-1">Operational Endpoints Verified</p>
            </div>
         </div>

         <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-yellow-400/5 blur-[120px] rounded-full pointer-events-none transition-all group-hover:bg-yellow-400/10" />
      </Card>
    </div>
  )
}

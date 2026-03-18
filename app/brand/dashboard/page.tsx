"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { brandService, studentService } from "@/lib/services"
import { BrandProfile, InternshipRequest, StudentProfile } from "@/lib/types"
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  ClipboardList, 
  Star, 
  Settings, 
  LogOut,
  Search,
  Lock,
  Zap,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
  ArrowRight
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import PaymentForm from "@/components/services/PaymentForm"

export default function BrandDashboard() {
  const { user, profile, loading } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [brandData, setBrandData] = useState<BrandProfile | null>(null)
  const [talents, setTalents] = useState<StudentProfile[]>([])
  const [requests, setRequests] = useState<InternshipRequest[]>([])
  const [activeInterns, setActiveInterns] = useState<InternshipRequest[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (profile?.uid) {
      loadData()
    }
  }, [profile])

  const loadData = async () => {
    if (!profile?.uid) return
    setFetching(true)
    try {
      const [b, t, r, a] = await Promise.all([
        brandService.getBrandProfile(profile.uid),
        studentService.getAllTalent(),
        brandService.getBrandRequests(profile.uid),
        brandService.getActiveInternships(profile.uid)
      ])
      setBrandData(b)
      setTalents(t)
      setRequests(r)
      setActiveInterns(a)
    } catch (error) {
      console.error(error)
      toast.error("Failed to load dashboard data.")
    } finally {
      setFetching(false)
    }
  }

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFCF6] flex flex-col md:flex-row shadow-2xl overflow-hidden pt-20">
      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-black text-white p-8 flex flex-col border-r border-white/5">
        <div className="mb-12">
          <div className="text-sm font-black uppercase tracking-widest text-yellow-400 mb-2">Partner Portal</div>
          <h1 className="text-2xl font-black">{brandData?.companyName || "Your Brand"}</h1>
        </div>

        <nav className="space-y-2 flex-grow">
          <NavItem active={activeTab === "overview"} icon={<LayoutDashboard className="h-5 w-5" />} label="Overview" onClick={() => setActiveTab("overview")} />
          <NavItem active={activeTab === "roster"} icon={<Users className="h-5 w-5" />} label="Scout Talent" onClick={() => setActiveTab("roster")} />
          <NavItem active={activeTab === "requests"} icon={<ClipboardList className="h-5 w-5" />} label="Hire Requests" onClick={() => setActiveTab("requests")} />
          <NavItem active={activeTab === "interns"} icon={<Clock className="h-5 w-5" />} label="Active Interns" onClick={() => setActiveTab("interns")} />
          <NavItem active={activeTab === "meetings"} icon={<Calendar className="h-5 w-5" />} label="Book Meeting" onClick={() => setActiveTab("meetings")} />
          <NavItem active={activeTab === "settings"} icon={<Settings className="h-5 w-5" />} label="Settings" onClick={() => setActiveTab("settings")} />
        </nav>

        <Button variant="ghost" className="mt-10 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl justify-start p-4 h-auto font-bold">
          <LogOut className="h-5 w-5 mr-3" /> Log Out
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 md:p-16 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-2">The Operational Hub</h2>
            <p className="text-gray-500 font-medium italic">Welcome back, {brandData?.contactPerson.split(' ')[0] || "Partner"}.</p>
          </div>
          <div className="hidden md:flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
             <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center font-black text-black">
                {brandData?.companyName[0] || "B"}
             </div>
             <div>
                <p className="text-xs font-black uppercase tracking-tighter text-gray-900">{brandData?.companyName}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{brandData?.hasPaidAccess ? "LOCKED-IN" : "PROBATION"}</p>
             </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === "overview" && <OverviewTab brandData={brandData} stats={{ interns: activeInterns.length, requests: requests.length }} />}
          {activeTab === "roster" && <RosterTab talents={talents} hasPaidAccess={brandData?.hasPaidAccess || false} onRefresh={loadData} />}
          {activeTab === "requests" && <RequestsTab requests={requests} />}
          {activeTab === "interns" && <InternsTab interns={activeInterns} onRefresh={loadData} />}
          {activeTab === "meetings" && <MeetingTab brandName={brandData?.companyName || ""} brandId={profile?.uid || ""} />}
        </AnimatePresence>
      </main>
    </div>
  )
}

function NavItem({ active, icon, label, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all font-bold ${active ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
      {icon} {label}
    </button>
  )
}

function OverviewTab({ brandData, stats }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard label="Active Interns" value={stats.interns} subtext="Deployed now" color="bg-green-50 text-green-600" />
        <StatCard label="Pending Requests" value={stats.requests} subtext="Awaiting admin" color="bg-blue-50 text-blue-600" />
        <StatCard label="Account Status" value={brandData?.hasPaidAccess ? "Unlock All" : "Restricted"} subtext="Access Level" color="bg-yellow-50 text-yellow-600" />
      </div>

      <div className="bg-white p-12 rounded-[2.5rem] shadow-premium space-y-8">
         <div className="flex justify-between items-start">
            <div>
               <h3 className="text-2xl font-black italic uppercase tracking-tight">Active Requirements</h3>
               <p className="text-sm font-medium text-gray-400 mt-1">What are you looking for currently?</p>
            </div>
            <Button variant="outline" className="rounded-xl font-bold text-xs uppercase tracking-widest">Update Brief</Button>
         </div>
         <div className="bg-gray-50 p-8 rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-500 font-medium italic">
              {brandData?.requirements || "No specific requirements submitted yet. Update your brief to help us find the perfect match."}
            </p>
         </div>
      </div>
    </motion.div>
  )
}

function RosterTab({ talents, hasPaidAccess, onRefresh }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
           <h3 className="text-3xl font-black italic uppercase tracking-tighter">Scout Talent</h3>
           <p className="text-gray-400 font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Deployment-ready specialists</p>
        </div>
        {!hasPaidAccess && (
          <div className="bg-yellow-50 text-yellow-800 px-6 py-3 rounded-2xl border border-yellow-100 flex items-center gap-3 animate-pulse">
             <Star className="h-4 w-4 fill-current" />
             <span className="text-xs font-black uppercase tracking-widest">Premium Scout Mode Disabled</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {talents.map(t => (
          <Card key={t.studentId} className="group p-8 rounded-[2rem] border-none shadow-sm hover:shadow-premium hover:border-black/10 transition-all duration-500 flex flex-col h-full bg-white">
            <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-yellow-400 transition-colors">🎬</div>
                <div className="flex gap-2">
                  {t.skills.slice(0, 2).map(s => (
                    <span key={s} className="bg-gray-100 text-gray-500 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest">{s}</span>
                  ))}
                </div>
            </div>
            <h4 className="text-2xl font-black italic uppercase tracking-tighter mb-2">
              {hasPaidAccess ? t.fullName : `SC_AGENT_${t.studentId.slice(-4)}`}
            </h4>
            <p className="text-xs text-gray-400 font-medium italic line-clamp-2 mb-8">
              {hasPaidAccess ? t.bio : "Classified creative profile. Unlock full access to view complete portfolio and contact details."}
            </p>
            
            <div className="mt-auto space-y-4">
               {hasPaidAccess ? (
                 <Button className="w-full bg-black text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] h-12 hover:bg-yellow-400 hover:text-black transition-all">
                   Initiate Recruitment <ArrowRight className="h-3.5 w-3.5 ml-2" />
                 </Button>
               ) : (
                 <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase text-center text-gray-400">Unlock Full Talent Profile</p>
                    <PaymentForm service="Full Talent Board Access" amount={50000} category="service" />
                 </div>
               )}
            </div>
          </Card>
        ))}
      </div>
    </motion.div>
  )
}

function RequestsTab({ requests }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
      <h3 className="text-3xl font-black italic uppercase tracking-tighter">Hire Requests</h3>
      <div className="space-y-4">
         {requests.length === 0 ? (
           <div className="bg-white p-20 rounded-[2.5rem] border border-dashed border-gray-200 text-center">
              <ClipboardList className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <p className="text-sm font-black uppercase tracking-widest text-gray-400">No active hire requests</p>
           </div>
         ) : (
           requests.map(r => (
             <div key={r.requestId} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between group hover:border-black transition-all">
                <div className="flex items-center gap-6">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${r.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      <CheckCircle2 className="h-6 w-6" />
                   </div>
                   <div>
                      <p className="font-black italic uppercase tracking-tight text-lg">{r.studentName || `Agent ${r.studentId.slice(-4)}`}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Requested on {new Date(r.requestedAt?.toMillis()).toLocaleDateString()}</p>
                   </div>
                </div>
                <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] ${r.status === 'approved' ? 'bg-green-500 text-white' : 'bg-yellow-400 text-black animate-pulse'}`}>
                   {r.status}
                </div>
             </div>
           ))
         )}
      </div>
    </motion.div>
  )
}

function InternsTab({ interns, onRefresh }: any) {
  const [grading, setGrading] = useState<string | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleGrade = async (requestId: string) => {
    setSubmitting(true)
    try {
      await brandService.submitFeedback(requestId, rating, comment)
      toast.success("Feedback submitted successfully!")
      setGrading(null)
      onRefresh()
    } catch {
      toast.error("Failed to submit feedback.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <h3 className="text-3xl font-black italic uppercase tracking-tighter">Active Internships</h3>
      <div className="grid grid-cols-1 gap-6">
         {interns.length === 0 ? (
           <div className="bg-white p-20 rounded-[2.5rem] border border-dashed border-gray-200 text-center">
              <Clock className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <p className="text-sm font-black uppercase tracking-widest text-gray-400">No interns currently deployed</p>
           </div>
         ) : (
           interns.map(i => (
             <Card key={i.requestId} className="p-8 rounded-[2rem] border-none shadow-sm bg-white hover:shadow-premium transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center font-black text-2xl">
                         {i.studentName?.[0] || "S"}
                      </div>
                      <div>
                         <h4 className="text-2xl font-black italic uppercase tracking-tighter">{i.studentName}</h4>
                         <div className="flex items-center gap-3 mt-1">
                            <Clock className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Deployment Duration: {i.duration || "Variable"}</span>
                         </div>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-4">
                      <Button variant="outline" className="rounded-xl h-12 px-6 font-bold text-xs uppercase tracking-widest" onClick={() => setGrading(i.requestId)}>Rate Performance</Button>
                      <Button variant="ghost" className="rounded-xl h-12 w-12 p-0"><MessageSquare className="h-5 w-5" /></Button>
                   </div>
                </div>

                <AnimatePresence>
                  {grading === i.requestId && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-8 pt-8 border-t border-gray-100 overflow-hidden">
                       <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">Internal Performance Review</p>
                       <div className="space-y-6">
                          <div className="flex gap-2">
                             {[1,2,3,4,5].map(v => (
                               <button key={v} onClick={() => setRating(v)} className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-all ${rating >= v ? 'bg-yellow-400 text-black' : 'bg-gray-50 text-gray-300 hover:bg-gray-100'}`}>{v}</button>
                             ))}
                          </div>
                          <Input placeholder="What was your experience with this intern? (Quality, Speed, Communication)" value={comment} onChange={e => setComment(e.target.value)} className="h-14 rounded-2xl border-gray-100 bg-gray-50" />
                          <div className="flex gap-4">
                             <Button onClick={() => handleGrade(i.requestId)} disabled={submitting} className="bg-black text-white rounded-xl h-12 px-8 font-black text-[10px] uppercase tracking-[0.2em]">{submitting ? "Submitting..." : "Submit Grading"}</Button>
                             <Button variant="ghost" onClick={() => setGrading(null)} className="rounded-xl h-12 px-6 font-bold text-xs">Cancel</Button>
                          </div>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
             </Card>
           ))
         )}
      </div>
    </motion.div>
  )
}

function MeetingTab({ brandName, brandId }: any) {
  const [topic, setTopic] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleBook = async () => {
    if (!topic) return
    setSubmitting(true)
    try {
      await brandService.bookMeeting({
        brandId,
        brandName,
        topic,
        scheduledAt: new Date(Date.now() + 86400000) // Default to tomorrow for demo
      })
      toast.success("Meeting request sent! Admin will contact you to confirm the time.")
      setTopic("")
    } catch {
      toast.error("Failed to send meeting request.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl space-y-12">
      <div className="space-y-4">
        <h3 className="text-3xl font-black italic uppercase tracking-tighter">Book Strategy Meeting</h3>
        <p className="text-gray-500 font-medium italic leading-relaxed">Schedule a direct session with our administrative team to discuss custom rosters, project scaling, or long-term partnership strategy.</p>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] shadow-premium space-y-8">
        <div className="space-y-2">
           <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Meeting Agenda / Topic</label>
           <Input placeholder="Hire 3 Senior Motion Designers for Q4 Campaign" value={topic} onChange={e => setTopic(e.target.value)} className="h-16 rounded-2xl border-gray-100 bg-gray-50 text-lg font-bold" />
        </div>
        <Button onClick={handleBook} disabled={submitting || !topic} className="w-full bg-yellow-400 text-black rounded-2xl h-16 font-black uppercase italic tracking-[0.2em] text-sm hover:bg-black hover:text-white transition-all shadow-xl shadow-yellow-400/20">
          {submitting ? "Connecting..." : "Initiate Meeting Request"}
        </Button>
        <div className="flex items-center justify-center gap-3">
           <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
           <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Response time: &lt; 2 hours during operational hours</p>
        </div>
      </div>
    </motion.div>
  )
}

function StatCard({ label, value, subtext, color }: any) {
  return (
    <Card className="border-none shadow-xl bg-white p-10 rounded-[2.5rem] hover:scale-[1.02] transition-transform">
      <div className={`w-12 h-12 rounded-2xl mb-6 flex items-center justify-center font-black ${color}`}>
        {value.toString()[0]}
      </div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-4xl font-black text-gray-900 mb-2">{value}</h3>
      <p className="text-xs text-gray-500 font-medium italic">{subtext}</p>
    </Card>
  )
}

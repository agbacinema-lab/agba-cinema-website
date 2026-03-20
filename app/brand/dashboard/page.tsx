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
import { authService } from "@/lib/auth-service"
import { UserDropdown } from "@/components/common/UserDropdown"
import NotificationBell from "@/components/common/NotificationBell"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import PaymentForm from "@/components/services/PaymentForm"
import BrandSettings from "@/components/brand/BrandSettings"
import PushPrompt from "@/components/common/PushPrompt"

export default function BrandDashboard() {
  const { user, profile, loading } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [brandData, setBrandData] = useState<BrandProfile | null>(null)
  const [talents, setTalents] = useState<StudentProfile[]>([])
  const [requests, setRequests] = useState<InternshipRequest[]>([])
  const [activeInterns, setActiveInterns] = useState<InternshipRequest[]>([])
  const [fetching, setFetching] = useState(true)
  const [isRecruiting, setIsRecruiting] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login'
    } else if (profile?.uid) {
      loadData()
    }
  }, [profile, user, loading])

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

  const handleRecruit = async (student: StudentProfile) => {
    if (!profile?.uid || !brandData) return
    setIsRecruiting(student.studentId || student.userId)
    try {
      await brandService.requestInternship({
        brandId: profile.uid,
        brandName: brandData.companyName,
        studentId: student.userId, // This is the student's personal UID
        studentName: student.fullName,
        duration: "Flexible (Pending Negotiation)",
      })

      // Send Email Notification to Admin
      await fetch("/api/notifications/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to_email: "agbacinema@gmail.com",
          to_name: "Admin",
          subject: `RECRUITMENT SIGNAL: ${brandData.companyName} → ${student.fullName}`,
          message: `${brandData.companyName} has initiated a recruitment protocol for ${student.fullName}.`,
          template_params: {
            brand_name: brandData.companyName,
            brand_contact: brandData.contactPerson,
            brand_email: profile.email,
            talent_name: student.fullName,
            talent_id: student.studentId || student.userId,
            intent: "Internship / Hire"
          }
        })
      }).catch(e => console.error("Recruitment Notification Error:", e))

      toast.success(`Recruitment protocol initiated for ${student.fullName}. Admin will contact you shortly.`)
      loadData()
    } catch (error) {

      console.error(error)
      toast.error("Failed to initiate recruitment.")
    } finally {
      setIsRecruiting(null)
    }
  }

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background transition-colors">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400" />
      </div>
    )
  }

  const BRAND_TABS = [
    { id: "overview",  label: "Overview", icon: LayoutDashboard },
    { id: "roster",    label: "Talent",   icon: Users },
    { id: "requests",  label: "Requests", icon: ClipboardList },
    { id: "interns",   label: "Interns",  icon: Clock },
    { id: "meetings",  label: "Strategy", icon: Calendar },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* ── TOP HEADER ── */}
      <header className="fixed top-0 inset-x-0 z-50 h-16 bg-black text-white flex items-center justify-between px-4 md:px-6 shadow-2xl">
        <div>
          <p className="text-[9px] text-yellow-400 font-black uppercase tracking-[0.3em]">Partner Portal</p>
          <h1 className="text-base font-black tracking-tighter leading-none uppercase">
            {brandData?.companyName || "Your Brand"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <UserDropdown onSettingsClick={() => setActiveTab('settings')} />
        </div>
      </header>

      <div className="flex pt-16">
        {/* ── DESKTOP SIDEBAR ── */}
        <aside className="hidden md:flex flex-col w-72 fixed top-16 bottom-0 left-0 bg-black text-white p-5 border-r border-white/5 overflow-y-auto">
          {/* Status card */}
          <div className="bg-white/5 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${brandData?.hasPaidAccess ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
              <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">
                {brandData?.hasPaidAccess ? "Accredited" : "Probation"}
              </p>
            </div>
            <p className="text-sm font-black truncate">{brandData?.contactPerson}</p>
          </div>

          <nav className="flex-1 space-y-1.5">
            {BRAND_TABS.map(tab => (
              <NavItem key={tab.id} active={activeTab === tab.id} icon={<tab.icon className="h-4 w-4" />} label={tab.label} onClick={() => setActiveTab(tab.id)} />
            ))}
          </nav>
          
          <div className="mt-8 pt-8 border-t border-white/5 mx-auto w-full">
             <button 
                onClick={async () => {
                   await authService.logout()
                   window.location.href = '/login'
                }}
                className="w-full h-12 flex items-center gap-3 px-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all font-black text-xs uppercase tracking-wider"
             >
                <LogOut className="h-4 w-4" />
                Sign Out
             </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 md:ml-72 min-h-[calc(100vh-4rem)] overflow-y-auto">

          <div className="p-4 md:p-12 pb-24 md:pb-12">
            <div className="hidden md:flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
              <div>
                <h2 className="text-3xl font-black text-foreground mb-2 uppercase tracking-tighter">Your Dashboard</h2>
                <p className="text-muted-foreground font-medium">Welcome back, {brandData?.contactPerson?.split(' ')[0] || "Partner"}.</p>
              </div>
              <div className="flex items-center gap-4 bg-card p-4 rounded-3xl shadow-sm border border-muted transition-colors">
                <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center font-black text-xl text-black">{brandData?.companyName?.[0] || "B"}</div>
                <div>
                  <p className="text-xs font-black uppercase tracking-tighter text-foreground">{brandData?.companyName}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${brandData?.hasPaidAccess ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">{brandData?.hasPaidAccess ? "Accredited" : "Probation"}</p>
                  </div>
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "overview" && <OverviewTab brandData={brandData} stats={{ interns: activeInterns.length, requests: requests.length }} onUpdateBrief={() => setActiveTab("settings")} />}
              {activeTab === "roster" && <RosterTab talents={talents} hasPaidAccess={brandData?.hasPaidAccess || false} onRefresh={loadData} onRecruit={handleRecruit} isRecruiting={isRecruiting} />}
              {activeTab === "requests" && <RequestsTab requests={requests} />}
              {activeTab === "interns" && <InternsTab interns={activeInterns} onRefresh={loadData} />}
              {activeTab === "meetings" && <MeetingTab brandName={brandData?.companyName || ""} brandId={profile?.uid || ""} />}
              {activeTab === "settings" && <BrandSettings brandData={brandData} onRefresh={loadData} />}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* ── MOBILE BOTTOM TAB BAR ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-black border-t border-white/10 flex items-stretch">
        {BRAND_TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors ${isActive ? 'text-yellow-400' : 'text-gray-500'}`}
            >
              <tab.icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-[8px] font-black uppercase tracking-wider ${isActive ? 'text-yellow-400' : 'text-gray-600'}`}>{tab.label}</span>
            </button>
          )
        })}
      </nav>

      <PushPrompt />
    </div>
  )
}

function NavItem({ active, icon, label, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 h-12 rounded-2xl transition-all font-black text-xs uppercase tracking-wider ${active ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
      <div className={`${active ? 'text-black' : 'text-gray-500'}`}>{icon}</div>
      {label}
    </button>
  )
}


function OverviewTab({ brandData, stats, onUpdateBrief }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard label="Active Interns" value={stats.interns} subtext="Personnel deployed" color="bg-green-50 text-green-600" />
        <StatCard label="Pending Requests" value={stats.requests} subtext="Recruitment pipeline" color="bg-blue-50 text-blue-600" />
        <StatCard label="Account Authority" value={brandData?.hasPaidAccess ? "Accredited" : "Probation"} subtext="System Access" color="bg-yellow-50 text-yellow-600" />
      </div>

      <div className="bg-card p-10 md:p-14 rounded-[3.5rem] shadow-premium space-y-10 border border-muted transition-colors">
         <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div>
               <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground">Active Requirements Brief</h3>
               <p className="text-sm font-medium text-muted-foreground mt-1">Our HODs use this brief to match specialists to your needs.</p>
            </div>
            <Button onClick={onUpdateBrief} variant="outline" className="rounded-2xl h-14 px-8 font-black text-[10px] uppercase tracking-widest border-2 border-muted hover:bg-foreground hover:text-background transition-all">Update Dispatch Brief</Button>
         </div>
         <div className="bg-muted/30 p-10 rounded-[2.5rem] border border-dashed border-muted transition-colors">
            <p className="text-muted-foreground font-medium text-lg leading-relaxed">
              {brandData?.requirements || "No specific requirements submitted yet. Update your brief to help us find the perfect match."}
            </p>
         </div>
      </div>
    </motion.div>
  )
}

function RosterTab({ talents, hasPaidAccess, onRefresh, onRecruit, isRecruiting }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
           <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground">Scout Talent</h3>
           <p className="text-muted-foreground font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Deployment-ready specialists</p>
        </div>
        {!hasPaidAccess && (
          <div className="bg-yellow-400/10 text-yellow-500 px-6 py-3 rounded-2xl border border-yellow-400/20 flex items-center gap-3 animate-pulse transition-colors">
             <Star className="h-4 w-4 fill-current" />
             <span className="text-xs font-black uppercase tracking-widest">Premium Scout Mode Disabled</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {(talents || []).length === 0 ? (
          <div className="col-span-full bg-card p-20 rounded-[2.5rem] border border-dashed border-muted text-left transition-colors">
             <Search className="h-12 w-12 text-muted/30 mb-4" />
             <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Searching for available specialists...</p>
          </div>
        ) : (
          (talents || []).map((t: StudentProfile) => (
            <Card key={t.studentId || t.userId} className="group p-8 rounded-[2rem] border border-muted shadow-sm hover:shadow-premium hover:border-foreground/30 transition-all duration-500 flex flex-col h-full bg-card">
              <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 bg-muted/30 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-yellow-400 transition-colors">🎬</div>
                  <div className="flex gap-2">
                    {(t.skills || []).slice(0, 2).map((skill: string) => (
                      <span key={skill} className="bg-muted text-muted-foreground px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest">{skill}</span>
                    ))}
                  </div>
              </div>
              <h4 className="text-xl font-black uppercase tracking-tighter mb-2 text-foreground">
                {hasPaidAccess ? (t.fullName || "NAME_REDACTED") : `SC_AGENT_${(t.studentId || t.userId || "").slice(-4)}`}
              </h4>
              <p className="text-xs text-muted-foreground font-medium line-clamp-2 mb-8">
                {hasPaidAccess ? (t.bio || "No biography provided.") : "Classified creative profile. Unlock full access to view complete portfolio and contact details."}
              </p>
              
              <div className="mt-auto space-y-4">
                 {hasPaidAccess ? (
                   <Button 
                      onClick={() => onRecruit(t)}
                      disabled={isRecruiting === (t.studentId || t.userId)}
                      className="w-full bg-black text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] h-12 hover:bg-yellow-400 hover:text-black transition-all"
                   >
                     {isRecruiting === (t.studentId || t.userId) ? "Starting..." : "Hire Specialist"} 
                     <ArrowRight className="h-3.5 w-3.5 ml-2" />
                   </Button>
                 ) : (
                   <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase text-center text-gray-400">Unlock Full Talent Profile</p>
                      <PaymentForm service="Full Talent Board Access" amount={50000} category="service" />
                   </div>
                 )}
              </div>
            </Card>
          ))
        )}
      </div>
    </motion.div>
  )
}

function RequestsTab({ requests }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
      <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground">Hire Requests</h3>
      <div className="space-y-4">
         {(requests || []).length === 0 ? (
           <div className="bg-card p-20 rounded-[2.5rem] border border-dashed border-muted text-left transition-colors">
              <ClipboardList className="h-12 w-12 text-muted/30 mb-4" />
              <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">No active hire requests</p>
           </div>
         ) : (
           (requests || []).map((r: InternshipRequest) => (
             <div key={r.requestId} className="bg-card p-6 rounded-3xl border border-muted flex items-center justify-between group hover:border-foreground/30 transition-all">
                <div className="flex items-center gap-6">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${r.status === 'approved' ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                      <CheckCircle2 className="h-6 w-6" />
                   </div>
                   <div>
                      <p className="font-black uppercase tracking-tight text-lg text-foreground">{r.studentName || `Agent ${(r.studentId || "").slice(-4)}`}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Requested on {r.requestedAt ? new Date(r.requestedAt.toMillis()).toLocaleDateString() : "Pending"}</p>
                   </div>
                </div>
                <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] ${r.status === 'approved' ? 'bg-green-500 text-white' : 'bg-yellow-400 text-black animate-pulse'}`}>
                   {r.status || "Pending"}
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
      <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground">Active Internships</h3>
      <div className="grid grid-cols-1 gap-6">
         {(interns || []).length === 0 ? (
           <div className="bg-card p-20 rounded-[2.5rem] border border-dashed border-muted text-left transition-colors">
              <Clock className="h-12 w-12 text-muted/30 mb-4" />
              <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">No interns currently deployed</p>
           </div>
         ) : (
           (interns || []).map((i: InternshipRequest) => (
             <Card key={i.requestId} className="p-8 rounded-[2rem] border border-muted shadow-sm bg-card hover:shadow-premium transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center font-black text-2xl text-black">
                         {i.studentName?.[0] || "S"}
                      </div>
                      <div>
                         <h4 className="text-xl font-black uppercase tracking-tighter text-foreground">{i.studentName || "Classified Intern"}</h4>
                         <div className="flex items-center gap-3 mt-1">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Deployment Duration: {i.duration || "Variable"}</span>
                         </div>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-4">
                      <Button variant="outline" className="rounded-xl h-12 px-6 font-bold text-xs uppercase tracking-widest border-muted text-foreground" onClick={() => setGrading(i.requestId)}>Rate Performance</Button>
                      <Button variant="ghost" className="rounded-xl h-12 w-12 p-0 text-muted-foreground"><MessageSquare className="h-5 w-5" /></Button>
                   </div>
                </div>
 
                <AnimatePresence>
                   {grading === i.requestId && (
                     <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-8 pt-8 border-t border-muted overflow-hidden">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6">Internal Performance Review</p>
                        <div className="space-y-6">
                           <div className="flex gap-2">
                              {[1,2,3,4,5].map(v => (
                                <button key={v} onClick={() => setRating(v)} className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-all ${rating >= v ? 'bg-yellow-400 text-black' : 'bg-muted text-muted-foreground hover:bg-muted/50'}`}>{v}</button>
                              ))}
                           </div>
                           <Input placeholder="What was your experience with this intern? (Quality, Speed, Communication)" value={comment} onChange={e => setComment(e.target.value)} className="h-14 rounded-2xl border-muted bg-muted/30 text-foreground" />
                           <div className="flex gap-4">
                              <Button onClick={() => handleGrade(i.requestId)} disabled={submitting} className="bg-foreground text-background rounded-xl h-12 px-8 font-black text-[10px] uppercase tracking-[0.2em]">{submitting ? "Submitting..." : "Submit Grading"}</Button>
                              <Button variant="ghost" onClick={() => setGrading(null)} className="rounded-xl h-12 px-6 font-bold text-xs text-muted-foreground">Cancel</Button>
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
        <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground">Book Strategy Meeting</h3>
        <p className="text-muted-foreground font-medium leading-relaxed">Schedule a direct session with our administrative team to discuss custom rosters, project scaling, or long-term partnership strategy.</p>
      </div>
 
      <div className="bg-card p-10 rounded-[2.5rem] shadow-premium space-y-8 border border-muted transition-colors">
        <div className="space-y-2">
           <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Meeting Agenda / Topic</label>
           <Input placeholder="Hire 3 Senior Motion Designers for Q4 Campaign" value={topic} onChange={e => setTopic(e.target.value)} className="h-16 rounded-2xl border-muted bg-muted/30 text-lg font-bold text-foreground" />
        </div>
        <Button onClick={handleBook} disabled={submitting || !topic} className="w-full bg-yellow-400 text-black rounded-2xl h-16 font-black uppercase tracking-[0.2em] text-sm hover:bg-foreground hover:text-background transition-all shadow-xl shadow-yellow-400/20">
          {submitting ? "Connecting..." : "Initiate Meeting Request"}
        </Button>
        <div className="flex items-center justify-center gap-3">
           <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Response time: &lt; 2 hours during operational hours</p>
        </div>
      </div>
    </motion.div>
  )
}

function StatCard({ label, value, subtext, color }: any) {
  return (
    <Card className="border-none shadow-xl bg-card p-10 rounded-[2.5rem] hover:scale-[1.02] transition-transform">
      <div className={`w-12 h-12 rounded-2xl mb-6 flex items-center justify-center font-black ${color}`}>
        {value.toString()[0]}
      </div>
      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-3xl font-black text-foreground mb-2">{value}</h3>
      <p className="text-xs text-muted-foreground font-medium">{subtext}</p>
    </Card>
  )
}

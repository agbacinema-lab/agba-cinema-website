"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
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
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import PaymentForm from "@/components/services/PaymentForm"
import BrandSettings from "@/components/brand/BrandSettings"
import StudentPortfolioPopup from "@/components/brand/StudentPortfolioPopup"
import PushPrompt from "@/components/common/PushPrompt"
import GroupChat from "@/components/common/GroupChat"
import { chatService } from "@/lib/services"
import { AlertTriangle, ShieldAlert, MoreVertical, ShieldCheck } from "lucide-react"

export default function BrandDashboard() {
  return (
    <Suspense fallback={
       <div className="min-h-screen flex items-center justify-center bg-background transition-colors">
         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400" />
       </div>
    }>
       <BrandDashboardContent />
    </Suspense>
  )
}

function BrandDashboardContent() {
  const { user, profile, loading } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const initialTab = searchParams.get('tab') || 'overview'
  const [activeTab, setActiveTab] = useState(initialTab)
  const [brandData, setBrandData] = useState<BrandProfile | null>(null)
  const [talents, setTalents] = useState<StudentProfile[]>([])
  const [requests, setRequests] = useState<InternshipRequest[]>([])
  const [activeInterns, setActiveInterns] = useState<InternshipRequest[]>([])
  const [fetching, setFetching] = useState(true)
  const [isRecruiting, setIsRecruiting] = useState<string | null>(null)
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<StudentProfile | null>(null)
  const [interviewRequests, setInterviewRequests] = useState<string[]>([])
  const [activeChatRoom, setActiveChatRoom] = useState<string | null>(null)
  const [brandSettings, setBrandSettings] = useState<any>(null)

  // Sync tab with URL
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tabId)
    router.replace(`/brand/dashboard?${params.toString()}`, { scroll: false })
  }

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
      const [b, t, r, a, s] = await Promise.all([
        brandService.getBrandProfile(profile.uid),
        studentService.getAllTalent(),
        brandService.getBrandRequests(profile.uid),
        brandService.getActiveInternships(profile.uid),
        brandService.getSettings()
      ])
      
      let codesUsed = 0;
      if (profile.role === 'ngo' || profile.isNGO) {
        const promoCodeService = (await import("@/lib/services")).promoCodeService
        const ngoCodes = await promoCodeService.getCodesByNgo(profile.uid)
        codesUsed = ngoCodes.reduce((sum: number, c: any) => sum + (c.usedCount || 0), 0)
      }

      setBrandData(b)
      setTalents(t)
      setRequests(r)
      setActiveInterns(a)
      setBrandSettings({ ...s, codesUsed })
    } finally {
      setFetching(false)
    }
  }

  const handleOpenChat = async (intern: InternshipRequest) => {
    if (!profile?.uid || !brandData) return
    const t = toast.loading("Establishing secure channel...")
    try {
      const roomId = await chatService.getOrCreateChatRoom({
        brandId: profile.uid,
        studentId: intern.studentId,
        requestId: intern.requestId,
        brandName: brandData.companyName,
        studentName: intern.studentName || "Intern"
      })
      setActiveChatRoom(roomId)
      toast.dismiss(t)
    } catch {
      toast.error("Uplink failed. Retrying sync...", { id: t })
    }
  }

  const handleRecruit = async (student: StudentProfile, plan: 'subscription' | 'onetime') => {
    if (!profile?.uid || !brandData) return
    setIsRecruiting(student.studentId || student.userId)
    try {
      const amount = plan === 'subscription' ? 100000 : 150000;
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          email: profile.email || "partner@agbacinema.com",
          fullName: brandData?.companyName || profile.name || "Brand Partner",
          phone: (brandData as any)?.contactPhone || profile.phone || '0000000000',
          service: `Intern Hire: ${student.fullName}`,
          userId: profile.uid,
          type: "intern_recruitment",
          brandId: profile.uid,
          studentId: student.studentId || student.userId,
          plan
        })
      });
      const data = await res.json();
      if (res.ok && data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        toast.error(data.message || "Payment portal offline");
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to initiate recruitment.")
    } finally {
      setIsRecruiting(null)
    }
  }

  const handleSelectPartnerType = async (type: 'brand' | 'ngo') => {
    if (!profile?.uid) return
    const t = toast.loading("Configuring partner environment...")
    try {
      await brandService.setPartnerType(profile.uid, type)
      toast.success(`Success! Welcome to the ${type === 'ngo' ? 'Social Impact' : 'Recruitment'} Dashboard.`, { id: t })
      loadData()
      // Force refresh auth profile
      window.location.reload()
    } catch {
      toast.error("Failed to sync protocol.", { id: t })
    }
  }

  const handleRequestInterview = (student: StudentProfile) => {
    if (interviewRequests.length >= 3) {
      toast.error("Protocol Limit: You can only request interviews with a maximum of 3 candidates simultaneously.")
      return
    }
    const id = student.userId
    if (interviewRequests.includes(id)) {
      setInterviewRequests(prev => prev.filter(x => x !== id))
    } else {
      setInterviewRequests(prev => [...prev, id])
      toast.info(`Candidate ${student.fullName} added to interview queue.`)
    }
  }

  const handleSubmitInterviews = async () => {
    if (interviewRequests.length === 0) return
    const t = toast.loading("Submitting interview queue...")
    try {
      // Just notify admin about the shortlist for now
      await fetch("/api/notifications/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to_email: "agbacinema@gmail.com",
          to_name: "Admin",
          subject: `INTERVIEW SHORTLIST: ${brandData?.companyName || profile?.name}`,
          message: `${brandData?.companyName || profile?.name} has requested interviews with the following candidates: \n${interviewRequests.join(", ")}`,
          template_params: {
            brand_name: brandData?.companyName || profile?.name,
            number_of_candidates: interviewRequests.length.toString(),
            candidates: interviewRequests.join(", ")
          }
        })
      })
      toast.success("Interview requests submitted to the Admin team.", { id: t })
      setInterviewRequests([])
    } catch {
      toast.error("Failed to submit interview requests.", { id: t })
    }
  }

  const handleQuery = async (intern: InternshipRequest) => {
    const reason = prompt("State the nature of the operational query (Reason for strike):")
    if (!reason) return

    try {
      const newStrikes = await brandService.addStrike(intern.studentId, reason)
      toast.warning(`Query deployed. Student ${intern.studentName} now has ${newStrikes}/3 strikes.`)
      
      // Auto-refresh data
      loadData()

      // Notify Super Admin
      await fetch("/api/notifications/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to_email: "agbacinema@gmail.com",
          to_name: "Admin",
          subject: `DISCIPLINARY SIGNAL: ${brandData?.companyName} → ${intern.studentName}`,
          message: `Reason: ${reason}\nTotal Strikes: ${newStrikes}/3`,
          template_params: {
            brand: brandData?.companyName,
            intern: intern.studentName,
            strikes: newStrikes,
            reason: reason,
            action_required: newStrikes >= 3 ? "URGENT: DISMISSAL REQUIRED" : "Review Performance"
          }
        })
      })

    } catch (e: any) {
      toast.error("Failed to deploy query: " + e.message)
    }
  }

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background transition-colors">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400 mx-auto" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Configuring portal...</p>
        </div>
      </div>
    )
  }

  const isNGO = profile?.role === 'ngo' || profile?.isNGO === true
  const needsOnboarding = profile && profile.isNGO === undefined && profile.role !== 'ngo' && profile.role === 'brand' && !brandData?.isSetupDone

  // ── PORTAL FORK ──────────────────────────────────────────────────────────
  // After a role change by Super Admin, next load re-evaluates isNGO here
  // and mounts the correct portal. No shared sidebar/tab contamination.
  if (isNGO) {
    return (
      <NGOPortal
        profile={profile}
        brandData={brandData}
        talents={talents}
        onTabChange={handleTabChange}
        activeTab={activeTab}
        onRecruit={handleRecruit}
        interviewQueue={interviewRequests}
        onToggleInterview={handleRequestInterview}
        onSubmitInterviews={handleSubmitInterviews}
        isRecruiting={isRecruiting}
      />
    )
  }

  // ── BRAND RECRUITMENT PORTAL ─────────────────────────────────────────────
  const BRAND_TABS = [
    { id: "overview",  label: "Overview", icon: LayoutDashboard },
    { id: "roster",    label: "Talent",   icon: Users },
    { id: "requests",  label: "Requests", icon: ClipboardList },
    { id: "interns",   label: "Interns",  icon: Clock },
    { id: "meetings",  label: "Strategy", icon: Calendar },
    { id: "settings",  label: "Settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* ── TOP HEADER ── */}
      <header className="fixed top-0 inset-x-0 z-50 h-16 bg-black text-white flex items-center justify-between px-4 md:px-6 shadow-2xl">
        <div>
          <p className="text-[9px] text-yellow-400 font-black uppercase tracking-[0.3em]">Brand Portal</p>
          <h1 className="text-base font-black tracking-tighter leading-none uppercase">
            {brandData?.companyName || "Your Brand"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <UserDropdown onSettingsClick={() => handleTabChange('settings')} />
        </div>
      </header>

      <div className="flex pt-16">
        {/* ── DESKTOP SIDEBAR ── */}
        <aside className="hidden md:flex flex-col w-72 fixed top-16 bottom-0 left-0 bg-black text-white p-5 border-r border-white/5 overflow-y-auto">
          {/* Accreditation Status */}
          <div className="bg-white/5 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${brandData?.hasPaidAccess ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
              <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">
                {brandData?.hasPaidAccess ? "Accredited Partner" : "Probation Mode"}
              </p>
            </div>
            <p className="text-sm font-black truncate">{brandData?.contactPerson || brandData?.companyName}</p>
          </div>

          <nav className="flex-1 space-y-1.5">
            {BRAND_TABS.map(tab => (
              <NavItem key={tab.id} active={activeTab === tab.id} icon={<tab.icon className="h-4 w-4" />} label={tab.label} onClick={() => handleTabChange(tab.id)} />
            ))}
          </nav>
          
          <div className="mt-8 pt-8 border-t border-white/5">
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
                <h2 className="text-3xl font-black text-foreground mb-2 uppercase tracking-tighter">Brand Dashboard</h2>
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
              {activeTab === "overview"  && <OverviewTab brandData={brandData} stats={{ interns: activeInterns.length, requests: requests.length }} settings={brandSettings} onUpdateBrief={() => handleTabChange("settings")} isNGO={false} />}
              {activeTab === "roster"    && <RosterTab talents={talents} hasPaidAccess={brandData?.hasPaidAccess || false} onRefresh={loadData} onRecruit={handleRecruit} isRecruiting={isRecruiting} onViewProfile={(s: StudentProfile) => setSelectedStudentForProfile(s)} interviewQueue={interviewRequests} onToggleInterview={handleRequestInterview} onSubmitInterviews={handleSubmitInterviews} settings={brandSettings} brandData={brandData} />}
              {activeTab === "requests"  && <RequestsTab requests={requests} settings={brandSettings} />}
              {activeTab === "interns"   && <InternsTab interns={activeInterns} onRefresh={loadData} onQuery={handleQuery} onOpenChat={handleOpenChat} settings={brandSettings} onNavigateToRoster={() => handleTabChange("roster")} />}
              {activeTab === "meetings"  && <MeetingTab brandName={brandData?.companyName || ""} brandId={profile?.uid || ""} />}
              {activeTab === "settings"  && <BrandSettings brandData={brandData} onRefresh={loadData} />}
            </AnimatePresence>

            {/* Overlays */}
            <AnimatePresence>
              {selectedStudentForProfile && (
                <StudentPortfolioPopup student={selectedStudentForProfile as any} onClose={() => setSelectedStudentForProfile(null)} />
              )}
              {activeChatRoom && profile && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="fixed right-0 top-0 bottom-0 w-full md:w-[450px] z-[100] p-6 pb-24 md:pb-6">
                  <GroupChat roomId={activeChatRoom} currentUser={profile as any} onClose={() => setActiveChatRoom(null)} />
                </motion.div>
              )}
            </AnimatePresence>

            {needsOnboarding && (
              <PartnerTypeOnboarding onSelect={handleSelectPartnerType} />
            )}
          </div>
        </main>
      </div>

      {/* ── MOBILE BOTTOM TAB BAR ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-black border-t border-white/10 flex items-stretch">
        {BRAND_TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button key={tab.id} onClick={() => handleTabChange(tab.id)} className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors ${isActive ? 'text-yellow-400' : 'text-gray-500'}`}>
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

// ─────────────────────────────────────────────────────────────────────────────
// NGO IMPACT PORTAL — Completely separate from Brand Portal
// Tabs: Overview (Impact stats) | Talent (view-only) | Promo Codes | Strategy
// ─────────────────────────────────────────────────────────────────────────────
function NGOPortal({ profile, brandData, talents, onTabChange, activeTab: initialTab, onRecruit, interviewQueue, onToggleInterview, onSubmitInterviews, isRecruiting }: any) {
  const [tab, setTab] = useState(initialTab || "overview")
  const [codes, setCodes] = useState<any[]>([])
  const [loadingCodes, setLoadingCodes] = useState(true)

  const NGO_TABS = [
    { id: "overview", label: "Impact",    icon: LayoutDashboard },
    { id: "talent",   label: "Talent",    icon: Users },
    { id: "promo",    label: "My Codes",  icon: Zap },
    { id: "strategy", label: "Strategy",  icon: Calendar },
  ]

  useEffect(() => {
    if (!profile?.uid) return
    const load = async () => {
      const { promoCodeService } = await import("@/lib/services")
      const res = await promoCodeService.getCodesByNgo(profile.uid)
      setCodes(res)
      setLoadingCodes(false)
    }
    load()
  }, [profile?.uid])

  const changeTab = (id: string) => {
    setTab(id)
    onTabChange?.(id)
  }

  const totalBeneficiaries = codes.reduce((s: number, c: any) => s + (c.usedCount || 0), 0)
  const totalCapacity = codes.reduce((s: number, c: any) => s + (c.maxUses || 0), 0)

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 h-16 bg-black text-white flex items-center justify-between px-4 md:px-6 shadow-2xl">
        <div>
          <p className="text-[9px] text-green-400 font-black uppercase tracking-[0.3em]">NGO Impact Portal</p>
          <h1 className="text-base font-black tracking-tighter leading-none uppercase">
            {brandData?.companyName || profile?.name || "NGO Partner"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <UserDropdown onSettingsClick={() => {}} />
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-72 fixed top-16 bottom-0 left-0 bg-black text-white p-5 border-r border-white/5 overflow-y-auto">
          {/* NGO Identity Card */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-[9px] text-green-400 font-black uppercase tracking-widest">Social Impact Partner</p>
            </div>
            <p className="text-sm font-black truncate">{profile?.name}</p>
            <p className="text-[9px] text-gray-500 font-bold mt-1">{totalBeneficiaries} / {totalCapacity} Students Sponsored</p>
          </div>

          <nav className="flex-1 space-y-1.5">
            {NGO_TABS.map(t => (
              <NavItem key={t.id} active={tab === t.id} icon={<t.icon className="h-4 w-4" />} label={t.label} onClick={() => changeTab(t.id)} />
            ))}
          </nav>

          <div className="mt-8 pt-8 border-t border-white/5">
            <button
              onClick={async () => { 
                const authService = require("@/lib/services").authService;
                await authService.logout(); 
                window.location.href = '/login' 
              }}
              className="w-full h-12 flex items-center gap-3 px-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all font-black text-xs uppercase tracking-wider"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 md:ml-72 min-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="p-4 md:p-12 pb-24 md:pb-12">
            {/* Page Header */}
            <div className="hidden md:flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter">NGO Dashboard</h2>
                <p className="text-muted-foreground font-medium">Welcome back, {profile?.name?.split(' ')[0] || "Partner"}.</p>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-green-500/10 border border-green-500/20 rounded-2xl">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Social Impact Active</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {/* ── IMPACT OVERVIEW ── */}
              {tab === "overview" && (
                <motion.div key="impact" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-10">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                      { label: "Active Codes",       value: codes.length,       sub: "Live sponsorship vouchers",    color: "bg-yellow-400 text-black" },
                      { label: "Students Sponsored", value: totalBeneficiaries,  sub: "Lives impacted",              color: "bg-green-500 text-white" },
                      { label: "Total Capacity",     value: totalCapacity,       sub: "Beneficiary seats allocated", color: "bg-black text-yellow-400" },
                    ].map(s => (
                      <Card key={s.label} className="p-8 rounded-[2.5rem] border-muted bg-card shadow-sm">
                        <div className={`w-12 h-12 rounded-2xl mb-4 flex items-center justify-center font-black text-xl shadow-xl ${s.color}`}>
                          {String(s.value)[0] || "0"}
                        </div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{s.label}</p>
                        <h3 className="text-4xl font-black">{s.value}</h3>
                        <p className="text-xs text-muted-foreground font-medium mt-2">{s.sub}</p>
                      </Card>
                    ))}
                  </div>

                  {/* Impact progress bar */}
                  {totalCapacity > 0 && (
                    <Card className="p-10 rounded-[3rem] border-muted bg-card">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h4 className="text-sm font-black uppercase tracking-widest">Overall Impact Delivery</h4>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">{Math.round((totalBeneficiaries / totalCapacity) * 100)}% capacity deployed</p>
                        </div>
                        <span className="text-3xl font-black italic text-yellow-500">{totalBeneficiaries}/{totalCapacity}</span>
                      </div>
                      <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((totalBeneficiaries / totalCapacity) * 100, 100)}%` }} transition={{ duration: 1.2, ease: "easeOut" }} className="h-full bg-yellow-400 rounded-full" />
                      </div>
                    </Card>
                  )}

                  <div className="p-8 bg-muted/20 border border-muted/50 rounded-[2.5rem] flex items-start gap-6">
                    <Zap className="h-6 w-6 text-yellow-500 shrink-0 mt-1" />
                    <div className="space-y-1">
                      <p className="text-sm font-black uppercase tracking-widest">How your promo codes work</p>
                      <p className="text-muted-foreground font-medium text-sm leading-relaxed">Students enter your assigned promo codes during checkout on the ÀGBÀ CINEMA platform to unlock free or discounted enrollment. Each code has a limited number of uses matching your sponsored seat count.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── TALENT VIEW ── */}
              {tab === "talent" && (
                 <RosterTab 
                    talents={talents}
                    hasPaidAccess={true}
                    onRefresh={() => {}}
                    onRecruit={onRecruit}
                    isRecruiting={isRecruiting}
                    onViewProfile={(student: any) => {
                      if (typeof window !== "undefined") {
                        window.open(`/student/${student.studentId || student.userId}`, '_blank');
                      }
                    }}
                    interviewQueue={interviewQueue}
                    onToggleInterview={onToggleInterview}
                    onSubmitInterviews={onSubmitInterviews}
                    brandData={brandData || profile}
                    settings={{ rosterSubtitle: "Internship recruitment follows the standard payment process." }}
                 />
              )}

              {/* ── PROMO CODES ── */}
              {tab === "promo" && (
                <motion.div key="promo" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-black uppercase tracking-tighter">Active Promo Codes</h3>
                      <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mt-1">Share these with students to sponsor their enrollment for free.</p>
                    </div>
                    <Button
                      onClick={async () => {
                        try {
                          await fetch("/api/notifications/email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to_email: "agbacinema@gmail.com", to_name: "Admin", subject: `NGO PROMO REQUEST: ${profile?.name}`, message: `NGO Partner ${profile?.name} (${profile?.email}) is requesting a new promo code batch.` }) })
                          toast.success("Request sent. Admin will generate a new batch shortly.")
                        } catch { toast.error("Request failed. Try again.") }
                      }}
                      className="bg-yellow-400 text-black hover:bg-foreground hover:text-background h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-yellow-400/10"
                    >
                      Request New Batch
                    </Button>
                  </div>

                  {loadingCodes ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1,2,3].map(i => <div key={i} className="h-56 bg-muted/20 rounded-[3rem] animate-pulse" />)}
                    </div>
                  ) : codes.length === 0 ? (
                    <div className="p-24 text-center border-2 border-dashed border-muted rounded-[3rem]">
                      <Zap className="h-12 w-12 text-muted/30 mx-auto mb-6" />
                      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">No codes assigned yet. Request a batch above.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {codes.map((c: any) => (
                        <Card key={c.id} className="p-10 rounded-[3.5rem] border-muted bg-card hover:border-yellow-400/50 transition-all group">
                          <div className="flex items-center justify-between mb-8">
                            <div className="px-4 py-2 bg-black text-yellow-400 rounded-xl font-black text-lg tracking-tighter uppercase">{c.code}</div>
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                          </div>
                          <div className="space-y-3 mb-6">
                            <div className="flex justify-between">
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Program</p>
                              <p className="text-[10px] font-black uppercase text-foreground">{c.programType || "All"}</p>
                            </div>
                            <div className="flex justify-between">
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Discount</p>
                              <p className="text-[10px] font-black uppercase text-yellow-500">{c.discountValue}% OFF</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Usage</p>
                              <p className="text-sm font-black italic">{c.usedCount || 0} / {c.maxUses}</p>
                            </div>
                            <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(((c.usedCount || 0) / c.maxUses) * 100, 100)}%` }} className="h-full bg-yellow-400 rounded-full" />
                            </div>
                          </div>
                          {c.expiresAt && (
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-4">Expires: {new Date(c.expiresAt.seconds * 1000).toLocaleDateString()}</p>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── STRATEGY ── */}
              {tab === "strategy" && (
                <motion.div key="strategy" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl space-y-12">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black uppercase tracking-tighter">Book Strategy Session</h3>
                    <p className="text-muted-foreground font-medium leading-relaxed">Connect directly with the ÀGBÀ CINEMA admin team to discuss expanding your sponsorship capacity or partnership terms.</p>
                  </div>
                  <MeetingTab brandName={brandData?.companyName || profile?.name || ""} brandId={profile?.uid || ""} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Tab Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-black border-t border-white/10 flex items-stretch">
        {NGO_TABS.map((t) => {
          const isActive = tab === t.id
          return (
            <button key={t.id} onClick={() => changeTab(t.id)} className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors ${isActive ? 'text-green-400' : 'text-gray-500'}`}>
              <t.icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-[8px] font-black uppercase tracking-wider ${isActive ? 'text-green-400' : 'text-gray-600'}`}>{t.label}</span>
            </button>
          )
        })}
      </nav>
      <PushPrompt />
    </div>
  )
}

// Legacy single-tab NGO Code viewer (kept for backward compat within old OverviewTab)
function StatCard({ label, value, subtext, color }: any) {
  return (
    <Card className="border-none shadow-xl bg-card p-10 rounded-[3rem] hover:scale-[1.02] transition-transform">
      <div className={`w-12 h-12 rounded-2xl mb-6 flex items-center justify-center font-black ${color}`}>
        {value.toString()[0]}
      </div>
      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-3xl font-black text-foreground mb-2">{value}</h3>
      <p className="text-xs text-muted-foreground font-medium">{subtext}</p>
    </Card>
  )
}
// No longer need old NGOHome or BRAND_TABS defined inside render — they are now separate portals
function NGOHome({ profile }: any) { return null } // Stub — replaced by NGOPortal
function NavItem({ active, icon, label, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 h-12 rounded-2xl transition-all font-black text-xs uppercase tracking-wider ${active ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
      <div className={`${active ? 'text-black' : 'text-gray-500'}`}>{icon}</div>
      {label}
    </button>
  )
}

function OverviewTab({ brandData, stats, onUpdateBrief, settings, isNGO }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {isNGO ? (
            <>
                <StatCard label="Beneficiaries" value={stats.codesUsed || 0} subtext="Impactful enrollments" color="bg-pink-50 text-pink-600" />
                <StatCard label="Active Programs" value={2} subtext="Scaling creative hope" color="bg-indigo-50 text-indigo-600" />
                <StatCard label="Impact Status" value="Global Partner" subtext="NGO Tier" color="bg-yellow-50 text-yellow-600" />
            </>
        ) : (
            <>
                <StatCard label="Active Personnel" value={stats.interns} subtext={settings?.statsSubtitle || "Deployed across sectors"} color="bg-green-50 text-green-600" />
                <StatCard label="Pipeline Requests" value={stats.requests} subtext={settings?.requestsSubtitle || "Recruitment linkage"} color="bg-blue-50 text-blue-600" />
                <StatCard label="System Authority" value={brandData?.hasPaidAccess ? "Accredited" : "Probation"} subtext="Access level" color="bg-yellow-50 text-yellow-600" />
            </>
        )}
      </div>

      {!isNGO && (
        <div className="bg-card p-10 md:p-14 rounded-[3.5rem] shadow-premium space-y-10 border border-muted transition-colors">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div>
                   <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground">Active Requirements Brief</h3>
                   <p className="text-sm font-medium text-muted-foreground mt-1">{settings?.briefDescription || "Our HODs use this brief to match specialists to your needs."}</p>
                </div>
                <Button onClick={onUpdateBrief} variant="outline" className="rounded-2xl h-14 px-8 font-black text-[10px] uppercase tracking-widest border-2 border-muted hover:bg-foreground hover:text-background transition-all">Update Dispatch Brief</Button>
            </div>
            <div className="bg-muted/30 p-10 rounded-[2.5rem] border border-dashed border-muted transition-colors">
                <p className="text-muted-foreground font-medium text-lg leading-relaxed">
                  {brandData?.requirements || "No specific requirements submitted yet. Update your brief to help us find the perfect match."}
                </p>
            </div>
        </div>
      )}
    </motion.div>
  )
}

function RosterTab({ talents, hasPaidAccess, onRefresh, onRecruit, isRecruiting, onViewProfile, interviewQueue, onToggleInterview, onSubmitInterviews, brandData, settings }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground">Personnel Marketplace</h3>
           <p className="text-muted-foreground font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">{settings?.rosterSubtitle || "Deployment-ready specialists in sectors"}</p>
        </div>
        <div className="flex gap-4">
            {interviewQueue?.length > 0 && (
                <div className="bg-blue-500/10 text-blue-500 px-6 py-3 rounded-2xl border border-blue-500/20 flex items-center gap-3">
                    <span className="text-xs font-black uppercase tracking-widest">{interviewQueue.length}/3 Priority Interviews Selected</span>
                    <Button onClick={onSubmitInterviews} variant="outline" className="h-10 rounded-xl bg-blue-500 text-white font-black border-none text-[10px] uppercase hover:bg-blue-600">Submit List</Button>
                </div>
            )}
            {!hasPaidAccess && (
            <div className="bg-yellow-400/10 text-yellow-500 px-6 py-3 rounded-2xl border border-yellow-400/20 flex items-center gap-3 animate-pulse transition-colors">
                <ShieldCheck className="h-4 w-4 fill-current" />
                <span className="text-xs font-black uppercase tracking-widest">{settings?.accreditationPlaceholder || "Board Locked: Accreditation Required"}</span>
            </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {(talents || []).length === 0 ? (
          <div className="col-span-full bg-card p-20 rounded-[3rem] border border-dashed border-muted text-left transition-colors">
             <Search className="h-12 w-12 text-muted/30 mb-4" />
             <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Searching for available specialists...</p>
          </div>
        ) : (
          (talents || []).map((t: StudentProfile) => (
            <Card key={t.studentId || t.userId} className="group p-10 rounded-[3rem] border border-muted shadow-sm hover:shadow-premium hover:border-foreground/30 transition-all duration-500 flex flex-col h-full bg-card">
              <div className="flex justify-between items-start mb-8">
                  <div className="w-16 h-16 bg-muted/30 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-yellow-400 transition-colors">🎬</div>
                  <div className="flex flex-wrap justify-end gap-2 max-w-[50%]">
                    {(t.skills || []).slice(0, 3).map((skill: string) => (
                      <span key={skill} className="bg-muted text-muted-foreground px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest">{skill}</span>
                    ))}
                  </div>
              </div>
              <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-2">
                    <h4 className="text-2xl font-black uppercase tracking-tighter text-foreground">
                        {t.fullName || "SC_AGENT_" + (t.studentId || t.userId || "").slice(-4)}
                    </h4>
                    {t.strikes && t.strikes > 0 && (
                        <div className="flex gap-1">
                            {[...Array(t.strikes)].map((_, i) => <AlertTriangle key={i} className="h-4 w-4 text-red-500" />)}
                        </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground font-medium line-clamp-3">
                    {t.bio || "No biography provided. Specialist is optimized for creative workflows."}
                  </p>
              </div>
              
              <div className="mt-auto space-y-4 pt-4 border-t border-muted/30">
                  <div className="grid grid-cols-2 gap-4">
                     <Button 
                        onClick={() => onViewProfile(t)}
                        variant="outline"
                        className="rounded-2xl font-black text-[9px] uppercase tracking-widest h-14 border-muted hover:bg-black hover:text-white transition-all shadow-sm col-span-2 sm:col-span-1"
                     >
                       Full Profile
                     </Button>
                     <Button 
                        onClick={() => onToggleInterview(t)}
                        variant={interviewQueue?.includes(t.userId) ? "destructive" : "outline"}
                        className={`rounded-2xl font-black text-[9px] uppercase tracking-widest h-14 col-span-2 sm:col-span-1 ${interviewQueue?.includes(t.userId) ? "bg-red-500 text-white border-none" : "border-muted shadow-sm hover:bg-black hover:text-white"}`}
                     >
                       {interviewQueue?.includes(t.userId) ? "Remove Interview" : "Book Interview"}
                     </Button>
                     <Button 
                        onClick={() => onRecruit(t, 'subscription')}
                        disabled={isRecruiting === (t.studentId || t.userId)}
                        className="col-span-2 sm:col-span-1 bg-yellow-400 text-black rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] h-14 hover:bg-foreground hover:text-background transition-all shadow-xl shadow-yellow-400/10"
                     >
                       {isRecruiting === (t.studentId || t.userId) ? "Linking..." : "Hire (3-Mo) - ₦100k"}
                     </Button>
                     <Button 
                        onClick={() => onRecruit(t, 'onetime')}
                        disabled={isRecruiting === (t.studentId || t.userId)}
                        className="col-span-2 sm:col-span-1 bg-black text-white rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] h-14 hover:bg-yellow-400 hover:text-black transition-all shadow-xl shadow-black/10"
                     >
                       {isRecruiting === (t.studentId || t.userId) ? "Linking..." : "Hire (1-Time) - ₦150k"}
                     </Button>
                  </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </motion.div>
  )
}

function RequestsTab({ requests, settings }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
      <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground">Personnel Pipeline</h3>
      <div className="space-y-4">
         {(requests || []).length === 0 ? (
           <div className="bg-card p-20 rounded-[3rem] border border-dashed border-muted text-left transition-colors">
              <ClipboardList className="h-12 w-12 text-muted/30 mb-4" />
              <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">No active deployment requests in pipeline.</p>
           </div>
         ) : (
           (requests || []).map((r: InternshipRequest) => (
             <div key={r.requestId} className="bg-card p-8 rounded-[2.5rem] border border-muted flex items-center justify-between group hover:border-foreground/20 transition-all shadow-sm">
                <div className="flex items-center gap-6">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${r.status === 'approved' ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                      {r.status === 'approved' ? <CheckCircle2 className="h-7 w-7" /> : <Clock className="h-7 w-7" />}
                   </div>
                   <div>
                      <p className="font-black uppercase tracking-tight text-xl text-foreground">{r.studentName || `Agent ${(r.studentId || "").slice(-4)}`}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Status Report: Operation {r.status?.toUpperCase() || "PENDING"}</p>
                   </div>
                </div>
                <div className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm ${r.status === 'approved' ? 'bg-green-500 text-white' : 'bg-yellow-400 text-black animate-pulse'}`}>
                   {r.status || "Pending Authorization"}
                </div>
             </div>
           ))
         )}
      </div>
    </motion.div>
  )
}

function InternsTab({ interns, onRefresh, onQuery, onOpenChat, settings, onNavigateToRoster }: any) {
  const [grading, setGrading] = useState<string | null>(null)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
 
  const handleGrade = async (requestId: string) => {
    setSubmitting(true)
    try {
      await brandService.submitFeedback(requestId, rating, comment)
      toast.success("Performance grading logged successfully.")
      setGrading(null)
      onRefresh()
    } catch {
      toast.error("Failed to log grading.")
    } finally {
      setSubmitting(false)
    }
  }
 
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex justify-between items-end mb-4">
        <div>
            <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground">Active Operational Fleet</h3>
            <p className="text-muted-foreground font-medium text-[10px] uppercase tracking-widest mt-1">{settings?.internsSubtitle || "Specialists currently deployed to your sectors"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
         {(interns || []).length === 0 ? (
           <div className="bg-card p-20 rounded-[3rem] border border-dashed border-muted text-left transition-colors">
              <Clock className="h-12 w-12 text-muted/30 mb-4" />
              <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">No personnel currently deployed.</p>
           </div>
         ) : (
           (interns || []).map((i: InternshipRequest) => (
             <Card key={i.requestId} className="p-10 rounded-[3rem] border border-muted shadow-sm bg-card hover:border-foreground/20 transition-all group">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                   <div className="flex items-center gap-8">
                      <div className="w-20 h-20 bg-yellow-400 rounded-[2.5rem] flex items-center justify-center font-black text-3xl text-black shadow-xl shadow-yellow-400/10">
                         {i.studentName?.[0] || "S"}
                      </div>
                      <div>
                         <h4 className="text-2xl font-black uppercase tracking-tighter text-foreground">{i.studentName || "Classified Intern"}</h4>
                         <div className="flex flex-wrap items-center gap-4 mt-2">
                             <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">Duration: {i.duration || settings?.defaultDuration || "90 Days"}</span>
                             </div>
                             
                             <div className="flex items-center gap-2 px-3 py-1 bg-muted/10 rounded-lg border border-muted/20">
                                <ShieldAlert className={`h-3 w-3 ${((i as any).strikes || 0) > 0 ? 'text-red-500' : 'text-gray-400'}`} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${((i as any).strikes || 0) > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                                   {((i as any).strikes || 0)}/3 Queries Executed
                                </span>
                             </div>

                             {((i as any).strikes || 0) >= 2 && (
                                <div className="px-3 py-1 bg-red-600/10 text-red-600 rounded-lg border border-red-600/20 text-[9px] font-black uppercase tracking-[0.2em] animate-pulse">
                                   Replacement Protocol Eligible
                                </div>
                             )}

                             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                             <span className="text-[10px] font-black text-green-500 uppercase tracking-widest whitespace-nowrap">Active Linkage</span>
                         </div>
                      </div>
                   </div>
                   
                    <div className="flex flex-wrap items-center gap-3">
                       <Button 
                         onClick={() => onOpenChat(i)}
                         className="rounded-2xl h-14 px-10 font-black text-[11px] uppercase tracking-[0.2em] bg-yellow-400 text-black hover:bg-black hover:text-[#fbbf24] transition-all shadow-xl shadow-yellow-400/20 flex items-center gap-3"
                       >
                          <MessageSquare className="h-4 w-4 stroke-[3]" />
                          Chat with Intern
                       </Button>
                       <Button 
                         variant="outline" 
                         className="rounded-2xl h-14 px-8 font-black text-[10px] uppercase tracking-widest border-2 border-muted text-foreground hover:bg-black hover:text-white transition-all shadow-sm" 
                         onClick={() => setGrading(grading === i.requestId ? null : i.requestId)}
                       >
                          Performance
                       </Button>
                       <Button 
                         onClick={() => onQuery(i)}
                         variant="ghost" 
                         className="rounded-2xl h-14 px-4 bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white font-black text-[9px] uppercase tracking-widest border border-red-500/10 transition-all flex items-center gap-2"
                       >
                          <ShieldAlert className="h-4 w-4" />
                          Send Query
                       </Button>
                       {((i as any).strikes || 0) >= 2 && (
                          <Button 
                            onClick={() => {
                               toast.info("Replacement Protocol Signaling Admin. Prepare for transition.")
                               onNavigateToRoster?.()
                            }}
                            className="rounded-2xl h-14 px-5 bg-black text-[#fbbf24] hover:bg-white hover:text-black font-black text-[9px] uppercase tracking-widest border border-[#fbbf24]/20 transition-all shadow-lg"
                          >
                             Request Replacement
                          </Button>
                       )}
                    </div>
                 </div>
  
                 <AnimatePresence>
                    {grading === i.requestId && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-10 pt-10 border-t border-muted overflow-hidden">
                         <div className="bg-muted/30 p-10 rounded-[2.5rem] space-y-8">
                             <div className="flex items-center justify-between">
                                 <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Internal Performance Metrics</h5>
                                 <div className="flex items-center gap-2">
                                     <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                     <span className="text-xl font-black italic">{rating}/5</span>
                                 </div>
                             </div>
                             <div className="space-y-8">
                                 <div className="flex gap-3">
                                     {[1,2,3,4,5].map(v => (
                                         <button key={v} onClick={() => setRating(v)} className={`flex-1 h-14 rounded-2xl flex items-center justify-center text-sm font-black transition-all ${rating >= v ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' : 'bg-muted text-muted-foreground hover:bg-muted/50'}`}>{v}</button>
                                     ))}
                                 </div>
                                 <Textarea 
                                     placeholder="Execute textual feedback on quality, speed, and communication parameters..." 
                                     value={comment} 
                                     onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)} 
                                     className="min-h-32 rounded-[2rem] border-muted bg-white text-foreground font-medium p-6 leading-relaxed focus:ring-2 focus:ring-yellow-400 outline-none transition-all" 
                                 />
                                 <div className="flex gap-4">
                                     <Button onClick={() => handleGrade(i.requestId)} disabled={submitting} className="bg-foreground text-background rounded-2xl h-16 px-10 font-black text-xs uppercase tracking-[0.2em] shadow-xl">{submitting ? "Processing..." : "Deploy Feedback"}</Button>
                                     <Button variant="ghost" onClick={() => setGrading(null)} className="rounded-2xl h-16 px-8 font-black text-xs text-muted-foreground uppercase tracking-widest">Abort</Button>
                                 </div>
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


function PartnerTypeOnboarding({ onSelect }: { onSelect: (type: 'brand' | 'ngo') => void }) {
    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6"
        >
            <div className="max-w-4xl w-full space-y-12">
                <div className="text-center space-y-4">
                    <p className="text-yellow-400 font-bold uppercase tracking-[0.4em] text-[10px]">Portal Configuration Required</p>
                    <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">Define your Objective</h2>
                    <p className="text-gray-400 max-w-xl mx-auto font-medium">Select your specialization to unlock the correct set of administrative tools and operational protocols.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect('brand')}
                        className="group bg-white/5 border border-white/10 p-12 rounded-[3.5rem] hover:bg-yellow-400 hover:border-transparent transition-all space-y-6"
                    >
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-black transition-colors">
                            <Users className="h-8 w-8 text-white group-hover:text-yellow-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white group-hover:text-black uppercase">Fleet Management</h3>
                            <p className="text-gray-400 group-hover:text-black/70 font-medium mt-2 leading-relaxed">I need to recruit, manage and evaluate creative specialists (interns) for my brand's operational sectors.</p>
                        </div>
                    </motion.button>

                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect('ngo')}
                        className="group bg-white/5 border border-white/10 p-12 rounded-[3.5rem] hover:bg-pink-500 hover:border-transparent transition-all space-y-6"
                    >
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-black transition-colors">
                            <Zap className="h-8 w-8 text-white group-hover:text-pink-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white group-hover:text-black uppercase">Social Impact</h3>
                            <p className="text-gray-400 group-hover:text-black/70 font-medium mt-2 leading-relaxed">I am an NGO partner looking to deploy humanitarian creative sponsorships and track beneficiary growth.</p>
                        </div>
                    </motion.button>
                </div>
            </div>
        </motion.div>
    )
}

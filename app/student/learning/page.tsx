"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { curriculumService, specializationService } from "@/lib/services"
import { motion, AnimatePresence } from "framer-motion"
import {
  PlayCircle,
  FileText,
  Lock,
  ChevronRight,
  CheckCircle2,
  Download,
  Eye,
  Layers,
  Search,
  Zap,
  Users,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Plus,
  Grid,
  Calendar,
  Video,
  Clock
} from "lucide-react"
import { toast } from "sonner"
import { X, ArrowLeft } from "lucide-react"
import PDFViewer from "@/components/curriculum/PDFViewer"
import { classSchedulerService, LiveClassSession } from "@/lib/services"

// ─── INTERNAL VIEWER ──────────────────────────────────────────────────────────
function InternalViewer({ url, onClose }: { url: string; onClose: () => void }) {
  let embedUrl = url;
  if (url.includes("drive.google.com")) {
    const matches = url.match(/\/d\/(.+?)\/|\/d\/(.+?)$|id=(.+?)&|id=(.+?)$/)
    const fileId = matches ? (matches[1] || matches[2] || matches[3] || matches[4]) : null
    if (fileId) embedUrl = `https://drive.google.com/file/d/${fileId}/preview`
  } else if (url.includes("youtube.com/watch?v=")) {
    embedUrl = url.replace("watch?v=", "embed/")
  } else if (url.includes("youtu.be/")) {
    embedUrl = url.replace("youtu.be/", "youtube.com/embed/")
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[9999] flex flex-col"
    >
      <div className="w-full h-16 bg-black flex justify-between items-center px-6 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="group flex items-center gap-2 bg-white/5 hover:bg-yellow-400 text-white hover:text-black px-4 h-10 rounded-xl font-black uppercase tracking-[0.2em] text-[9px] transition-all border border-white/5 active:scale-95">
            <ArrowLeft className="h-3.5 w-3.5" /> Close Workspace
          </button>
          <div className="h-4 w-px bg-white/10 hidden md:block" />
          <div className="hidden md:block">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-400/80">A1 Learning System</p>
          </div>
        </div>
        
        <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          <p className="text-[10px] font-black italic uppercase tracking-widest text-white/40">Secured Internal Stream</p>
        </div>

        <button onClick={onClose} className="p-2.5 bg-red-500/10 hover:bg-red-500 rounded-xl text-red-500 hover:text-white transition-all group">
          <X className="h-5 w-5 group-hover:rotate-90 transition-transform" />
        </button>
      </div>

      <div className="flex-1 bg-black relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center -z-10 bg-[#0a0a0a]">
           <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-[9px] font-black uppercase tracking-widest text-white/20 italic">Loading Media Workspace...</p>
           </div>
        </div>
        <iframe 
          src={embedUrl} 
          className="w-full h-full border-0 shadow-2xl" 
          allow="autoplay; encrypted-media" 
          allowFullScreen
          sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    </motion.div>
  )
}

// ─── Enroll New Specialization Modal ───────────────────────────────────────────
function EnrollModal({ userId, existingIds, profile, onClose }: {
  userId: string
  existingIds: string[]
  profile: any
  onClose: () => void
}) {
  const [programType, setProgramType] = useState<"gopro" | "mentorship">("gopro")
  const [specializations, setSpecializations] = useState<any[]>([])
  const [selected, setSelected] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSpecs()
  }, [programType])

  const loadSpecs = async () => {
    setLoading(true)
    try {
      const data = await specializationService.getSpecializationsByProgram(programType)
      setSpecializations(data.filter((s: any) => !existingIds.includes(s.id)))
    } catch { setSpecializations([]) }
    finally { setLoading(false) }
  }

  const handleEnroll = async () => {
    const spec = specializations.find(s => s.id === selected)
    if (!spec) { toast.error("Select a specialization"); return }
    setSaving(true)
    try {
      // Clean price string for numeric value (e.g. "150,000" -> 150000)
      const rawPrice = spec.price || (programType === 'mentorship' ? "150,000" : "75,000");
      const numericPrice = parseFloat(String(rawPrice).replace(/[^0-9.]/g, ''));
      
      const serviceName = spec.label || spec.title || spec.value;

      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numericPrice,
          service: serviceName,
          fullName: profile?.fullName || profile?.name || "Student",
          email: profile?.email,
          userId: userId,
          type: "academy_enrollment",
          programType: programType
        })
      });

      const data = await res.json();
      if (data.authorization_url) {
        toast.info("Initializing enrollment protocol...");
        window.location.href = data.authorization_url;
      } else {
        throw new Error("Payment link generation failed");
      }
    } catch (e) {
      console.error("Enrollment Error:", e);
      toast.error("Failed to initiate enrollment protocol.");
    } finally { setSaving(false) }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-[999] flex items-center justify-center p-6"
    >
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-card border border-muted rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-12 max-w-2xl w-full shadow-2xl space-y-8 md:space-y-10 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-3xl font-black italic uppercase tracking-tighter text-foreground">Add New Track</h3>
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mt-2">Enroll in an additional specialization</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground font-black text-xs transition-colors uppercase tracking-widest">Cancel</button>
        </div>

        {/* Program Toggle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(["gopro","mentorship"] as const).map(pt => (
            <button key={pt} onClick={() => setProgramType(pt)}
              className={`p-5 md:p-6 rounded-2xl md:rounded-3xl border-2 text-left transition-all duration-300 ${programType === pt ? 'border-yellow-400 bg-yellow-400/5 text-foreground' : 'border-muted bg-muted/20 hover:border-muted-foreground/30 text-muted-foreground'}`}
            >
              {pt === "gopro" ? <Zap className={`h-5 w-5 md:h-6 md:w-6 mb-3 ${programType === pt ? 'text-yellow-400' : 'text-muted-foreground'}`} /> : <Users className={`h-5 w-5 md:h-6 md:w-6 mb-3 ${programType === pt ? 'text-yellow-400' : 'text-muted-foreground'}`} />}
              <p className="font-black uppercase italic tracking-tighter text-sm">{pt === "gopro" ? "Go Pro" : "Mentorship"}</p>
            </button>
          ))}
        </div>

        {/* Spec Picker */}
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Available Specializations</p>
          {loading ? (
            <div className="grid grid-cols-2 gap-3">{[1,2,3,4].map(i => <div key={i} className="h-16 bg-muted/30 rounded-2xl animate-pulse" />)}</div>
          ) : specializations.length === 0 ? (
            <div className="p-8 rounded-3xl border-2 border-dashed border-muted text-center">
              <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">No new tracks available for this program.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {specializations.map(s => (
                <button key={s.id} onClick={() => setSelected(s.id)}
                  className={`p-6 rounded-3xl border-2 text-left flex items-center gap-6 transition-all ${selected === s.id ? 'border-yellow-400 bg-yellow-400/5 text-foreground' : 'border-muted bg-muted/20 hover:border-muted-foreground/30 text-muted-foreground'}`}
                >
                  <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: s.color || '#FCD34D' }} />
                  <div className="flex-1">
                    <p className={`font-black text-sm uppercase tracking-tight ${selected === s.id ? 'text-foreground' : 'text-muted-foreground'}`}>{s.label || s.title}</p>
                    {s.description && <p className={`text-xs mt-1 font-medium ${selected === s.id ? 'text-muted-foreground' : 'text-muted-foreground/60'}`}>{s.description}</p>}
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black uppercase text-yellow-500">₦{s.price || (programType === 'mentorship' ? '150,000' : '75,000')}</p>
                  </div>
                  {selected === s.id && <CheckCircle2 className="h-5 w-5 text-yellow-400 ml-auto" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={handleEnroll} disabled={saving || !selected}
          className="w-full bg-foreground text-background h-16 md:h-20 rounded-[1.8rem] md:rounded-[2.5rem] font-black uppercase tracking-widest text-[10px] md:text-xs flex items-center justify-center gap-3 hover:bg-yellow-400 hover:text-black disabled:opacity-30 transition-all shadow-2xl active:scale-95 hover:scale-[1.02]"
        >
          {saving ? "Deploying Protocol..." : `Complete Enrollment (₦${specializations.find(s=>s.id===selected)?.price || (programType === 'mentorship' ? '150,000' : '75,000')})`} {!saving && <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />}
        </button>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function StudentLearning() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400" />
      </div>
    }>
      <StudentLearningContent />
    </Suspense>
  )
}

function StudentLearningContent() {
  const { profile, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Track persistence
  const initialTrackId = searchParams.get('track') || ""
  const [activeSpecId, setActiveSpecId] = useState(initialTrackId)
  
  const handleTrackChange = (trackId: string) => {
    setActiveSpecId(trackId)
    const params = new URLSearchParams(searchParams.toString())
    params.set('track', trackId)
    const newUrl = `${window.location.pathname}?${params.toString()}`
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl)
  }
  const [showEnroll, setShowEnroll] = useState(false)
  const [viewingUrl, setViewingUrl] = useState<string | null>(null)
  const [viewingDocument, setViewingDocument] = useState<{url: string, title?: string} | null>(null)

  // LMS state
  const [modules, setModules] = useState<any[]>([])
  const [curriculum, setCurriculum] = useState<any | null>(null)
  const [selectedModule, setSelectedModule] = useState<any | null>(null)
  const [materials, setMaterials] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Live Timetable
  const [liveClasses, setLiveClasses] = useState<LiveClassSession[]>([])
  const [upcomingClass, setUpcomingClass] = useState<LiveClassSession | null>(null)

  // Derive enrolled list — supports both old single-spec and new multi-spec
  const enrolled: Array<{ id: string; title: string; value: string; programType: string }> = (() => {
    if (profile?.enrolledSpecializations?.length) return profile.enrolledSpecializations
    if (profile?.specialization && profile?.programType) {
      return [{ id: "legacy", title: (profile.specialization as string).replace(/-/g, " "), value: profile.specialization as string, programType: profile.programType as string }]
    }
    return []
  })()

  const activeSpec = enrolled.find(e => e.id === activeSpecId) || enrolled[0] || null

  useEffect(() => {
    if (enrolled.length > 0 && !activeSpecId) setActiveSpecId(enrolled[0].id)
  }, [profile])

  useEffect(() => {
    if (activeSpec) loadCurriculum(activeSpec.programType, activeSpec.value)
  }, [activeSpecId])

  const loadCurriculum = async (programType: string, specialization: string) => {
    setLoading(true)
    setModules([])
    setCurriculum(null)
    setSelectedModule(null)
    setMaterials([])
    try {
      // 1. Load Live Timetable
      const timetable = await classSchedulerService.getStudentTimetable(user?.uid || "", (profile as any)?.cohort)
      setLiveClasses(timetable)
      
      const upcoming = timetable.find(c => c.status === 'scheduled' || c.status === 'live')
      if (upcoming) setUpcomingClass(upcoming)

      // 2. Load Existing Curriculum Media/Recordings
      const allCurricula = await curriculumService.getAllCurricula()
      let myCurriculum = allCurricula.find(c => c.programType === programType && c.specialization === specialization)
      if (!myCurriculum) myCurriculum = allCurricula.find(c => c.programType === programType)
      if (myCurriculum) {
        setCurriculum(myCurriculum)
        const mods = await curriculumService.getModulesByCurriculum(myCurriculum.id)
        setModules(mods)
        if (mods.length > 0) { setSelectedModule(mods[0]); loadMaterials(mods[0].id, myCurriculum.id) }
      }
    } catch (error) { console.error("Error loading curriculum:", error) }
    finally { setLoading(false) }
  }

  const loadMaterials = async (moduleId: string, curriculumId: string) => {
    try { setMaterials(await curriculumService.getMaterialsByModule(curriculumId, moduleId)) }
    catch { setMaterials([]) }
  }

  const handleSelectModule = (module: any) => {
    setSelectedModule(module)
    if (curriculum) loadMaterials(module.id, curriculum.id)
  }

  const filteredModules = modules.filter(m =>
    m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ── No enrollments yet ──
  if (enrolled.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-8"
      >
        <div className="w-24 h-24 bg-card border border-muted rounded-[3rem] flex items-center justify-center shadow-2xl">
          <GraduationCap className="h-12 w-12 text-yellow-400" />
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-foreground">No Operational Tracks</h2>
          <p className="text-muted-foreground font-medium max-w-md mx-auto leading-relaxed">
             You are currently in baseline status. Enroll in a specialization track to activate your curriculum.
          </p>
        </div>
        <button onClick={() => setShowEnroll(true)}
          className="bg-foreground text-background h-14 md:h-16 px-8 md:px-12 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-sm flex items-center gap-3 hover:bg-yellow-400 hover:text-black transition-all shadow-2xl active:scale-95"
        >
          <Plus className="h-4 w-4 md:h-5 md:w-5" /> Activate First Track
        </button>
        <AnimatePresence>
          {showEnroll && <EnrollModal userId={user?.uid || ""} profile={profile} existingIds={[]} onClose={() => setShowEnroll(false)} />}
        </AnimatePresence>
      </motion.div>
    )
  }

  return (
    <div className="space-y-10 pb-32 w-full max-w-full overflow-x-hidden pt-4 md:pt-0">
      {/* ─── Specialization Switcher ─── */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center border border-yellow-400/20 shrink-0">
               <Grid className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground leading-none mb-2">My Tracks ({enrolled.length})</p>
               <h3 className="text-2xl font-black italic uppercase tracking-tighter text-foreground leading-none">Select Track</h3>
            </div>
          </div>
          <button onClick={() => setShowEnroll(true)}
            className="flex items-center justify-center gap-3 h-14 md:h-16 px-8 md:px-10 bg-foreground text-background rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all shadow-xl active:scale-95 w-full md:w-auto"
          >
            <Plus className="h-4 w-4" /> Enroll in Course
          </button>
        </div>

        <div className="w-full relative px-1">
          <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar scroll-smooth snap-x">
            {enrolled.map((spec) => (
              <button
                key={spec.id}
                onClick={() => handleTrackChange(spec.id)}
                className={`shrink-0 snap-start flex flex-col items-start text-left p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border-2 transition-all duration-500 min-w-[260px] md:min-w-[320px] relative overflow-hidden group ${
                  activeSpec?.id === spec.id
                    ? 'border-yellow-400 bg-card text-foreground shadow-[0_30px_60px_rgba(250,204,21,0.15)] scale-[1.03] z-10'
                    : 'border-muted bg-muted/20 text-muted-foreground hover:border-muted-foreground/30'
                }`}
              >
                <div className={`w-3 h-3 rounded-full mb-6 ${activeSpec?.id === spec.id ? 'bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)] animate-pulse' : 'bg-muted-foreground/30'}`} />
                <p className={`text-[9px] font-black uppercase tracking-[0.3em] mb-3 ${activeSpec?.id === spec.id ? 'text-yellow-400' : 'text-muted-foreground/60'}`}>
                  {spec.programType === 'gopro' ? 'PRO-CORE' : 'MENTORSHIP'}
                </p>
                <h4 className="text-xl font-black uppercase italic tracking-tighter leading-tight line-clamp-2">
                  {spec.title || spec.value.replace(/-/g, " ")}
                </h4>
                {activeSpec?.id === spec.id && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 blur-[50px] -mr-16 -mt-16" />
                )}
                {activeSpec?.id === spec.id && (
                  <motion.div layoutId="spec-active" className="absolute bottom-0 left-0 right-0 h-1.5 bg-yellow-400" />
                )}
              </button>
            ))}
          </div>
          {/* Fading edges for better UX context */}
          <div className="absolute right-0 top-0 bottom-8 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none md:block" />
        </div>
      </div>

      {/* ─── LIVE TIMETABLE HUD ─── */}
      {upcomingClass && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 md:p-12 rounded-[3rem] bg-gradient-to-br from-yellow-400 to-yellow-500 text-black shadow-2xl relative overflow-hidden group">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-black/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-black/10">
                {upcomingClass.status === 'live' ? (
                  <><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> LIVE NOW</>
                ) : (
                  <><div className="w-2 h-2 rounded-full bg-black animate-pulse" /> UPCOMING CLASS</>
                )}
              </div>
              <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-tight">{upcomingClass.topic}</h2>
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2 bg-black/5 px-4 h-10 rounded-xl text-xs font-bold font-mono">
                  <Calendar className="h-4 w-4" /> 
                  {new Date(upcomingClass.startTime.seconds * 1000).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 bg-black/5 px-4 h-10 rounded-xl text-xs font-bold font-mono">
                  <Clock className="h-4 w-4" /> 
                  {new Date(upcomingClass.startTime.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} ({upcomingClass.durationMinutes} mins)
                </div>
                <div className="flex items-center gap-2 bg-black/5 px-4 h-10 rounded-xl text-xs font-bold">
                  <Users className="h-4 w-4" /> Tutor: {upcomingClass.tutorName}
                </div>
              </div>
            </div>
            <div className="shrink-0 w-full md:w-auto flex flex-col gap-3">
              <a href={upcomingClass.meetLink} target="_blank" rel="noopener noreferrer" className="bg-black hover:bg-gray-900 text-white w-full md:w-64 h-16 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl">
                <Video className="h-5 w-5 text-yellow-400" /> Join Google Meet
              </a>
              <p className="text-[10px] font-black uppercase tracking-widest text-black/60 text-center">Class starts promptly</p>
            </div>
          </div>
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/20 blur-3xl rounded-full" />
        </motion.div>
      )}

      {/* ─── LMS Content ─── */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.4)]" />
        </div>
      ) : !curriculum ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center min-h-[40vh] text-center gap-8 py-24 bg-card rounded-[4rem] border border-muted shadow-2xl"
        >
          <div className="w-20 h-20 bg-muted/30 rounded-[2rem] flex items-center justify-center">
             <BookOpen className="h-10 w-10 text-muted-foreground/30" />
          </div>
          <div className="space-y-3">
            <h4 className="text-4xl font-black italic uppercase tracking-tighter text-foreground">Curriculum Pending</h4>
            <p className="text-muted-foreground font-medium text-sm max-w-sm mx-auto leading-relaxed">
              Command has not yet deployed the curriculum for{" "}
              <span className="text-yellow-400 font-black">{activeSpec?.title}</span>. Operational updates will be signaled soon.
            </p>
          </div>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={activeSpecId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} className="space-y-8"
          >
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2 text-foreground">{curriculum?.title || activeSpec?.title}</h3>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-widest text-yellow-600 bg-yellow-400/10 px-4 py-1.5 rounded-full border border-yellow-400/20">
                    {activeSpec?.programType === "gopro" ? "Go Pro" : "Mentorship"}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/30 px-4 py-1.5 rounded-full">
                    {modules.length} Modules
                  </span>
                </div>
              </div>
              <div className="relative w-full md:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-yellow-400 transition-colors" />
                <input type="text" placeholder="Search modules..."
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-card border border-muted h-12 pl-12 pr-6 rounded-2xl text-sm font-medium focus:ring-2 ring-yellow-400/20 shadow-sm transition-all outline-none text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Module Sidebar */}
              <div className="lg:col-span-4 space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
                {filteredModules.length === 0 ? (
                  <div className="text-center py-12 opacity-50">
                    <Layers className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-xs font-black italic tracking-widest uppercase text-muted-foreground">No Modules Found</p>
                  </div>
                ) : filteredModules.map((module, i) => {
                  const isActive = selectedModule?.id === module.id
                  const isLocked = module.order > (modules.filter(m => m.completed).length) + 1 && !isActive
                  return (
                    <motion.button key={module.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }} onClick={() => !isLocked && handleSelectModule(module)}
                      className={`w-full group p-6 rounded-3xl border text-left transition-all ${
                        isActive ? "bg-foreground text-background shadow-2xl border-foreground scale-[1.02]"
                        : isLocked ? "bg-muted/10 border-muted opacity-60 cursor-not-allowed"
                        : "bg-card border-muted hover:border-yellow-400 hover:shadow-lg"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? "text-yellow-400" : "text-indigo-400"}`}>
                          {module.isBonusModule ? "Bonus" : `Module ${module.order}`}
                        </span>
                        {isActive ? <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(250,204,21,1)]" />
                        : isLocked ? <Lock className="h-3 w-3 text-muted-foreground" />
                        : module.completed ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : null}
                      </div>
                      <h4 className={`font-black text-sm uppercase tracking-tight line-clamp-1 transition-colors ${isActive ? "text-background" : "text-foreground group-hover:text-yellow-400"}`}>{module.title}</h4>
                      {module.description && (
                        <p className={`text-xs mt-1 line-clamp-2 font-medium ${isActive ? "text-background/60" : "text-muted-foreground"}`}>{module.description}</p>
                      )}
                    </motion.button>
                  )
                })}
              </div>

              {/* Content Panel */}
              <div className="lg:col-span-8">
                <AnimatePresence mode="wait">
                  {selectedModule ? (
                    <motion.div key={selectedModule.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }} className="space-y-8"
                    >
                      <div className="bg-card p-10 rounded-[3rem] border border-muted shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 blur-[50px] -mr-16 -mt-16 pointer-events-none transition-all duration-700 group-hover:bg-yellow-400/10" />
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                          <div className="space-y-4 max-w-xl">
                            <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">ACTIVE LESSON</span>
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-tight text-foreground">{selectedModule.title}</h2>
                            <p className="text-muted-foreground font-medium leading-relaxed">{selectedModule.description}</p>
                            {selectedModule.topics?.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-2">
                                {selectedModule.topics.map((topic: string) => (
                                  <span key={topic} className="bg-muted/30 text-muted-foreground text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-muted">{topic}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                        <div className="space-y-4">
                          <h5 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><PlayCircle className="h-4 w-4" /> Video Lessons</h5>
                          {materials.filter(m => m.type === "video").length === 0 ? (
                            <div className="bg-muted/10 rounded-2xl p-6 text-center border border-dashed border-muted"><p className="text-xs text-muted-foreground/40 font-black uppercase tracking-widest">No videos yet</p></div>
                          ) : materials.filter(m => m.type === "video").map(mat => (
                            <button key={mat.id} onClick={() => setViewingUrl(mat.videoUrl || mat.externalLink || null)}
                              className="w-full bg-card p-5 rounded-3xl border border-muted shadow-sm flex items-center justify-between group hover:border-yellow-400 transition-all text-left"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-foreground text-background rounded-2xl flex items-center justify-center group-hover:bg-yellow-400 group-hover:text-black transition-all shadow-lg"><PlayCircle className="h-6 w-6" /></div>
                                <div>
                                  <p className="text-xs font-black uppercase tracking-widest text-foreground">{mat.title}</p>
                                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">VIDEO LESSON</p>
                                </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                            </button>
                          ))}
                        </div>

                        <div className="space-y-4">
                          <h5 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><FileText className="h-4 w-4" /> Reading Materials</h5>
                          {materials.filter(m => m.type === "pdf" || m.type === "document").length === 0 ? (
                            <div className="bg-muted/10 rounded-2xl p-6 text-center border border-dashed border-muted"><p className="text-xs text-muted-foreground/40 font-black uppercase tracking-widest">No documents yet</p></div>
                          ) : materials.filter(m => m.type === "pdf" || m.type === "document").map(mat => (
                            <div key={mat.id} className="bg-card p-5 rounded-3xl border border-muted shadow-sm flex items-center justify-between group hover:border-yellow-400 transition-all">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all"><FileText className="h-6 w-6" /></div>
                                <div>
                                  <p className="text-xs font-black uppercase tracking-widest text-foreground">{mat.title}</p>
                                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{mat.fileName || "DOCUMENT"}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {mat.fileUrl && (
                                  <button onClick={() => setViewingDocument({ url: mat.fileUrl, title: mat.title || mat.fileName })} className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all">
                                    <Eye className="h-3 w-3" /> Read Now
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-indigo-600 p-10 rounded-[3rem] shadow-2xl overflow-hidden relative group">
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                          <div className="space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Module Requirement</p>
                            <h4 className="text-3xl font-black text-white italic uppercase tracking-tighter">Ready for Assessment?</h4>
                            <p className="text-indigo-100 text-sm font-medium max-w-sm leading-relaxed">
                               Submit your practical evidence to unlock the next level of tactical training.
                            </p>
                          </div>
                          <button onClick={() => router.push("/student/assignments")}
                            className="bg-white text-indigo-600 px-10 h-16 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:bg-yellow-400 hover:text-black hover:scale-105 active:scale-95 shadow-2xl"
                          >
                            Open Assignment Portal
                          </button>
                        </div>
                        <div className="absolute left-0 bottom-0 w-64 h-64 bg-white/5 blur-[80px] pointer-events-none rounded-full" />
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex items-center justify-center h-full min-h-[400px]">
                      <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-xs">Select a module to begin</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Enroll Modal */}
      <AnimatePresence>
        {showEnroll && (
          <EnrollModal
            userId={user?.uid || ""}
            profile={profile}
            existingIds={enrolled.map(e => e.id)}
            onClose={() => setShowEnroll(false)}
          />
        )}
      </AnimatePresence>

      {/* Internal Viewer Modal */}
      <AnimatePresence>
        {viewingUrl && <InternalViewer url={viewingUrl} onClose={() => setViewingUrl(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {viewingDocument && (
          <PDFViewer 
            fileUrl={viewingDocument.url} 
            fileName={viewingDocument.title || "Document"} 
            onClose={() => setViewingDocument(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}

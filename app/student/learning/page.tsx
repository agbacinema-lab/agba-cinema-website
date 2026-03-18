"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { curriculumService, specializationService } from "@/lib/services"
import { doc, updateDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
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
  AlertCircle,
  Plus,
  Grid,
} from "lucide-react"
import { toast } from "sonner"

// ─── Enroll New Specialization Modal ───────────────────────────────────────────
function EnrollModal({ userId, existingIds, onDone, onClose }: {
  userId: string
  existingIds: string[]
  onDone: () => void
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
      // Use setDoc merge to append to enrolledSpecializations array
      const userRef = doc(db, "users", userId)
      const newEntry = { id: spec.id, title: spec.label || spec.title || spec.value, value: spec.value, programType }
      // Fetch current enrolled list
      const { getDoc } = await import("firebase/firestore")
      const snap = await getDoc(userRef)
      const current: any[] = snap.exists() ? (snap.data().enrolledSpecializations || []) : []
      // If no primary yet, also set programType + specialization for backward compat
      const isPrimary = current.length === 0
      await updateDoc(userRef, {
        enrolledSpecializations: [...current, newEntry],
        ...(isPrimary ? { programType, specialization: spec.value } : {})
      })
      toast.success("Enrolled in track successfully!")
      onDone()
    } catch (e) {
      toast.error("Enrollment failed. Please try again.")
    } finally { setSaving(false) }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-[999] flex items-center justify-center p-6"
    >
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-[4rem] p-12 max-w-2xl w-full shadow-2xl space-y-10"
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-3xl font-black italic uppercase tracking-tighter">Add New Track</h3>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-2">Enroll in an additional specialization</p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-black font-black text-xs transition-colors uppercase tracking-widest">Cancel</button>
        </div>

        {/* Program Toggle */}
        <div className="grid grid-cols-2 gap-4">
          {(["gopro","mentorship"] as const).map(pt => (
            <button key={pt} onClick={() => setProgramType(pt)}
              className={`p-6 rounded-3xl border-2 text-left transition-all duration-300 ${programType === pt ? 'border-black bg-black text-white' : 'border-gray-100 hover:border-gray-200'}`}
            >
              {pt === "gopro" ? <Zap className={`h-6 w-6 mb-3 ${programType === pt ? 'text-yellow-400' : 'text-gray-400'}`} /> : <Users className={`h-6 w-6 mb-3 ${programType === pt ? 'text-yellow-400' : 'text-gray-400'}`} />}
              <p className="font-black uppercase italic tracking-tighter text-sm">{pt === "gopro" ? "Go Pro" : "Mentorship"}</p>
            </button>
          ))}
        </div>

        {/* Spec Picker */}
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Available Specializations</p>
          {loading ? (
            <div className="grid grid-cols-2 gap-3">{[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-50 rounded-2xl animate-pulse" />)}</div>
          ) : specializations.length === 0 ? (
            <div className="p-8 rounded-3xl border-2 border-dashed border-gray-100 text-center">
              <p className="text-gray-300 font-black uppercase text-[10px] tracking-widest">No new tracks available for this program.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {specializations.map(s => (
                <button key={s.id} onClick={() => setSelected(s.id)}
                  className={`p-6 rounded-3xl border-2 text-left flex items-center gap-6 transition-all ${selected === s.id ? 'border-yellow-400 bg-black text-white' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: s.color || '#FCD34D' }} />
                  <div>
                    <p className="font-black text-sm uppercase tracking-tight">{s.label || s.title}</p>
                    {s.description && <p className={`text-xs mt-1 font-medium ${selected === s.id ? 'text-gray-400' : 'text-gray-500'}`}>{s.description}</p>}
                  </div>
                  {selected === s.id && <CheckCircle2 className="h-5 w-5 text-yellow-400 ml-auto" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={handleEnroll} disabled={saving || !selected}
          className="w-full bg-black text-white h-16 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-yellow-400 hover:text-black disabled:opacity-30 transition-all shadow-2xl"
        >
          {saving ? "Enrolling..." : "Enroll in Track"} {!saving && <ArrowRight className="h-5 w-5" />}
        </button>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function StudentLearning() {
  const { profile, user } = useAuth()
  const router = useRouter()

  // Multi-track state
  const [activeSpecId, setActiveSpecId] = useState<string | null>(null)
  const [showEnroll, setShowEnroll] = useState(false)

  // LMS state
  const [modules, setModules] = useState<any[]>([])
  const [curriculum, setCurriculum] = useState<any | null>(null)
  const [selectedModule, setSelectedModule] = useState<any | null>(null)
  const [materials, setMaterials] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

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
        <div className="w-24 h-24 bg-black rounded-[2.5rem] flex items-center justify-center shadow-2xl">
          <GraduationCap className="h-12 w-12 text-yellow-400" />
        </div>
        <div className="space-y-3">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">No Active Tracks</h2>
          <p className="text-gray-400 font-medium max-w-md">You haven't enrolled in any specializations yet. Start your academy journey now.</p>
        </div>
        <button onClick={() => setShowEnroll(true)}
          className="bg-black text-white h-16 px-12 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center gap-3 hover:bg-yellow-400 hover:text-black transition-all shadow-2xl"
        >
          <Plus className="h-5 w-5" /> Enroll in First Track
        </button>
        <AnimatePresence>
          {showEnroll && <EnrollModal userId={user?.uid || ""} existingIds={[]} onDone={() => window.location.reload()} onClose={() => setShowEnroll(false)} />}
        </AnimatePresence>
      </motion.div>
    )
  }

  return (
    <div className="space-y-10 pb-32">
      {/* ─── Specialization Switcher ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Grid className="h-4 w-4 text-gray-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">My Enrolled Tracks ({enrolled.length})</span>
          </div>
          <button onClick={() => setShowEnroll(true)}
            className="flex items-center gap-2 h-12 px-6 border-2 border-dashed border-gray-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-400 hover:border-black hover:text-black hover:bg-black hover:text-white transition-all"
          >
            <Plus className="h-4 w-4" /> Add Track
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {enrolled.map((spec) => (
            <button
              key={spec.id}
              onClick={() => setActiveSpecId(spec.id)}
              className={`shrink-0 flex flex-col items-start text-left p-8 rounded-[2.5rem] border-2 transition-all duration-500 min-w-[220px] relative overflow-hidden group ${
                activeSpec?.id === spec.id
                  ? 'border-black bg-black text-white shadow-[0_30px_60px_rgba(0,0,0,0.3)] scale-105'
                  : 'border-gray-100 bg-white text-gray-500 hover:border-gray-300 hover:shadow-xl'
              }`}
            >
              <div className={`w-3 h-3 rounded-full mb-4 ${activeSpec?.id === spec.id ? 'bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)] animate-pulse' : 'bg-gray-200'}`} />
              <p className={`text-[9px] font-black uppercase tracking-[0.3em] mb-2 ${activeSpec?.id === spec.id ? 'text-yellow-400' : 'text-gray-300'}`}>
                {spec.programType === 'gopro' ? 'Go Pro Track' : 'Mentorship Track'}
              </p>
              <h4 className="text-base font-black uppercase italic tracking-tighter leading-tight line-clamp-2">
                {spec.title || spec.value.replace(/-/g, " ")}
              </h4>
              {activeSpec?.id === spec.id && (
                <motion.div layoutId="spec-active" className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ─── LMS Content ─── */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400" />
        </div>
      ) : !curriculum ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center min-h-[40vh] text-center gap-6 py-20 bg-white rounded-[4rem] border border-gray-100"
        >
          <BookOpen className="h-16 w-16 text-gray-200" />
          <div className="space-y-2">
            <h4 className="text-2xl font-black italic uppercase tracking-tight">Curriculum Being Built</h4>
            <p className="text-gray-400 font-medium text-sm max-w-md">
              Your tutor is still setting up the curriculum for{" "}
              <span className="font-black text-black">{activeSpec?.title}</span>. Check back soon!
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
                <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2">{curriculum?.title || activeSpec?.title}</h3>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-widest text-yellow-600 bg-yellow-50 px-4 py-1.5 rounded-full">
                    {activeSpec?.programType === "gopro" ? "Go Pro" : "Mentorship"}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-gray-100 px-4 py-1.5 rounded-full">
                    {modules.length} Modules
                  </span>
                </div>
              </div>
              <div className="relative w-full md:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-black transition-colors" />
                <input type="text" placeholder="Search modules..."
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-gray-100 h-12 pl-12 pr-6 rounded-2xl text-sm font-medium focus:ring-2 ring-yellow-400/20 shadow-sm transition-all outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Module Sidebar */}
              <div className="lg:col-span-4 space-y-3 max-h-[70vh] overflow-y-auto no-scrollbar pr-2">
                {filteredModules.length === 0 ? (
                  <div className="text-center py-12 opacity-50">
                    <Layers className="h-12 w-12 mx-auto mb-4 text-gray-200" />
                    <p className="text-xs font-black italic tracking-widest uppercase">No Modules Found</p>
                  </div>
                ) : filteredModules.map((module, i) => {
                  const isActive = selectedModule?.id === module.id
                  const isLocked = module.order > (modules.filter(m => m.completed).length) + 1 && !isActive
                  return (
                    <motion.button key={module.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }} onClick={() => !isLocked && handleSelectModule(module)}
                      className={`w-full group p-6 rounded-3xl border text-left transition-all ${
                        isActive ? "bg-black text-white shadow-2xl border-black scale-[1.02]"
                        : isLocked ? "bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed"
                        : "bg-white border-gray-100 hover:border-yellow-400 hover:shadow-lg"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? "text-yellow-400" : "text-indigo-600"}`}>
                          {module.isBonusModule ? "Bonus" : `Module ${module.order}`}
                        </span>
                        {isActive ? <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(250,204,21,1)]" />
                        : isLocked ? <Lock className="h-3 w-3 text-gray-400" />
                        : module.completed ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : null}
                      </div>
                      <h4 className="font-black text-sm uppercase tracking-tight line-clamp-1 group-hover:text-yellow-400 transition-colors">{module.title}</h4>
                      {module.description && (
                        <p className={`text-xs mt-1 line-clamp-2 font-medium ${isActive ? "text-gray-400" : "text-gray-500"}`}>{module.description}</p>
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
                      <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 blur-[50px] -mr-16 -mt-16 pointer-events-none transition-all duration-700 group-hover:bg-yellow-400/10" />
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                          <div className="space-y-4 max-w-xl">
                            <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">ACTIVE LESSON</span>
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-tight">{selectedModule.title}</h2>
                            <p className="text-gray-500 font-medium leading-relaxed">{selectedModule.description}</p>
                            {selectedModule.topics?.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-2">
                                {selectedModule.topics.map((topic: string) => (
                                  <span key={topic} className="bg-gray-100 text-gray-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">{topic}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                        <div className="space-y-4">
                          <h5 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2"><PlayCircle className="h-4 w-4" /> Video Lessons</h5>
                          {materials.filter(m => m.type === "video").length === 0 ? (
                            <div className="bg-gray-50 rounded-2xl p-6 text-center border border-dashed border-gray-200"><p className="text-xs text-gray-400 font-black uppercase tracking-widest">No videos yet</p></div>
                          ) : materials.filter(m => m.type === "video").map(mat => (
                            <a key={mat.id} href={mat.videoUrl || mat.externalLink || "#"} target="_blank" rel="noreferrer"
                              className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-yellow-400 transition-all"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white group-hover:bg-yellow-400 group-hover:text-black transition-all shadow-lg"><PlayCircle className="h-6 w-6" /></div>
                                <div>
                                  <p className="text-xs font-black uppercase tracking-widest text-gray-900">{mat.title}</p>
                                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">VIDEO</p>
                                </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-black transition-colors" />
                            </a>
                          ))}
                        </div>

                        <div className="space-y-4">
                          <h5 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2"><FileText className="h-4 w-4" /> Reading Materials</h5>
                          {materials.filter(m => m.type === "pdf" || m.type === "document").length === 0 ? (
                            <div className="bg-gray-50 rounded-2xl p-6 text-center border border-dashed border-gray-200"><p className="text-xs text-gray-400 font-black uppercase tracking-widest">No documents yet</p></div>
                          ) : materials.filter(m => m.type === "pdf" || m.type === "document").map(mat => (
                            <div key={mat.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-yellow-400 transition-all">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all"><FileText className="h-6 w-6" /></div>
                                <div>
                                  <p className="text-xs font-black uppercase tracking-widest text-gray-900">{mat.title}</p>
                                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{mat.fileName || "DOCUMENT"}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {mat.fileUrl && <a href={mat.fileUrl} target="_blank" rel="noreferrer" className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-black transition-all"><Eye className="h-4 w-4" /></a>}
                                {mat.fileUrl && <a href={mat.fileUrl} download className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-black transition-all"><Download className="h-4 w-4" /></a>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-2xl overflow-hidden relative group">
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Module Requirement</p>
                            <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter">Ready for Assessment?</h4>
                            <p className="text-indigo-200 text-xs font-medium max-w-sm">Submit your practical to unlock the next level of training.</p>
                          </div>
                          <button onClick={() => router.push("/student/assignments")}
                            className="bg-white text-indigo-600 px-8 h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-xl"
                          >
                            Open Assignment Portal
                          </button>
                        </div>
                        <div className="absolute left-0 bottom-0 w-32 h-32 bg-white/10 blur-[60px] pointer-events-none rounded-full" />
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex items-center justify-center h-full min-h-[400px]">
                      <p className="text-gray-300 font-black uppercase tracking-[0.2em] text-xs">Select a module to begin</p>
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
            existingIds={enrolled.map(e => e.id)}
            onDone={() => { setShowEnroll(false); window.location.reload() }}
            onClose={() => setShowEnroll(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

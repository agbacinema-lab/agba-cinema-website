"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Zap, Users, BookOpen, CheckCircle, XCircle, Clock, Send, ChevronLeft, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/context/AuthContext"
import CurriculumCreator from "./CurriculumCreator"
import CurriculumSelector from "./CurriculumSelector"
import CurriculumManager from "./CurriculumManager"
import SpecializationManager from "./SpecializationManager"
import CurriculumRejectionDialog from "./CurriculumRejectionDialog"
import { curriculumService } from "@/lib/services"
import { toast } from "sonner"

// ── Status Badge ──────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    draft:            { label: 'Draft',            className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
    pending_approval: { label: 'Awaiting Approval', className: 'bg-yellow-400/10 text-yellow-500 border-yellow-400/20' },
    approved:         { label: 'Approved',          className: 'bg-green-500/10 text-green-500 border-green-500/20' },
    rejected:         { label: 'Rejected',          className: 'bg-red-500/10 text-red-500 border-red-500/20' },
  }
  const s = map[status] ?? map.draft
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest border uppercase ${s.className}`}>
      {s.label}
    </span>
  )
}

// ── Pending Indicator Bubble ──────────────────────────────────────
function PendingCount({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <div className="absolute -top-3 -right-3 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg border-4 border-background animate-bounce">
      {count}
    </div>
  )
}

export default function CurriculumAdminPanel() {
  const { profile, isSuperAdmin } = useAuth()
  const isExecutive = ['super_admin', 'director'].includes((profile as any)?.role || '')

  const [view, setView] = useState<'programs' | 'specializations' | 'curricula' | 'modules'>('programs')
  const [selectedProgram, setSelectedProgram] = useState<'gopro' | 'mentorship' | null>(null)
  const [selectedSpecialization, setSelectedSpecialization] = useState<any>(null)
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string | null>(null)
  const [curriculumData, setCurriculumData] = useState<any>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(false)
  const [pendingCounts, setPendingCounts] = useState<{program: Record<string, number>, spec: Record<string, number>}>({ program: {}, spec: {} })
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false)

  const isRestricted = !!(profile && !isSuperAdmin && (profile as any).specialization)

  // ── Load hierarchy counts (for Executives only) ───────────────────
  useEffect(() => {
    if (!isExecutive) return
    const fetchPending = async () => {
      const pending = await curriculumService.getPendingCurricula()
      const pCount: Record<string, number> = {}
      const sCount: Record<string, number> = {}
      
      pending.forEach(c => {
        pCount[c.programType] = (pCount[c.programType] || 0) + 1
        sCount[c.specialization] = (sCount[c.specialization] || 0) + 1
      })
      setPendingCounts({ program: pCount, spec: sCount })
    }
    fetchPending()
  }, [isExecutive, refreshKey])

  useEffect(() => {
    const checkRestriction = async () => {
      if (isRestricted) {
        const { specializationService } = await import("@/lib/services")
        const specs = await specializationService.getAllSpecializations()
        const mySpec = specs.find((s: any) => s.value === (profile as any).specialization)
        if (mySpec) {
          setSelectedProgram(mySpec.programType)
          setView('specializations')
        }
      }
    }
    checkRestriction()
  }, [profile, isRestricted, isSuperAdmin])

  const handleSelectProgram = (program: 'gopro' | 'mentorship') => {
    setSelectedProgram(program)
    setView('specializations')
  }

  const handleManageSpecialization = (spec: any) => {
    setSelectedSpecialization(spec)
    setView('curricula')
  }

  const handleSelectCurriculum = (curriculum: any) => {
    setSelectedCurriculumId(curriculum.id)
    setCurriculumData(curriculum)
    setView('modules')
  }

  const handleCurriculumCreated = () => setRefreshKey(prev => prev + 1)

  const handleSubmitForApproval = async (curriculumId: string) => {
    try {
      await curriculumService.submitForApproval(curriculumId, profile?.name || 'Staff')
      toast.success('Submitted for executive approval!')
      const data = await curriculumService.getCurriculumById(curriculumId)
      if (data) setCurriculumData(data)
      setRefreshKey(prev => prev + 1)
    } catch { toast.error('Failed to submit') }
  }

  const handleApprove = async (curriculumId: string) => {
    setLoading(true)
    try {
      await curriculumService.approveCurriculum(curriculumId, profile?.name || 'Executive')
      toast.success('Curriculum approved!')
      const data = await curriculumService.getCurriculumById(curriculumId)
      if (data) setCurriculumData(data)
      setRefreshKey(prev => prev + 1)
    } catch { toast.error('Failed to approve') }
    setLoading(false)
  }

  const handleReject = () => {
    setRejectionDialogOpen(true)
  }

  const confirmRejectCurriculum = async (reason: string) => {
    if (!selectedCurriculumId) return
    setLoading(true)
    try {
      await curriculumService.rejectCurriculum(selectedCurriculumId, profile?.name || 'Executive', reason)
      toast.success('Curriculum rejected')
      const data = await curriculumService.getCurriculumById(selectedCurriculumId)
      if (data) setCurriculumData(data)
      setRefreshKey(prev => prev + 1)
    } catch { toast.error('Failed to reject') }
    setLoading(false)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tighter text-foreground uppercase italic leading-none">
            {isExecutive ? 'Executive Approval Desk' : 'Course Builder'}
          </h2>
          <p className="text-muted-foreground text-[10px] font-black tracking-[0.3em] mt-2 uppercase">
            {view === 'programs' && 'Step 1: Choose Course Program'}
            {view === 'specializations' && 'Step 2: Filter by Specialization'}
            {view === 'curricula' && `Step 3: Browse Weekly Content`}
            {view === 'modules' && `Step 4: Review Daily Modules`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {curriculumData && view === 'modules' && (
            <>
              {(!isExecutive && (curriculumData.approvalStatus === 'draft' || !curriculumData.approvalStatus)) && (
                <button onClick={() => handleSubmitForApproval(curriculumData.id)} className="flex items-center gap-2 px-6 py-2.5 bg-yellow-400 text-black rounded-xl text-[10px] font-black hover:bg-yellow-300 transition-all shadow-lg uppercase tracking-widest">
                  <Send className="h-4 w-4" /> Submit for Approval
                </button>
              )}
              {isExecutive && (curriculumData.approvalStatus === 'pending_approval' || curriculumData.approvalStatus === 'draft' || curriculumData.approvalStatus === 'rejected' || !curriculumData.approvalStatus) && (
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(curriculumData.id)} disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-green-500 text-white rounded-xl text-[10px] font-black hover:bg-green-600 transition-all shadow-lg uppercase tracking-widest">
                    <CheckCircle className="h-4 w-4" /> Approve Week
                  </button>
                  <button onClick={() => handleReject()} disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-red-500 text-white rounded-xl text-[10px] font-black hover:bg-red-600 transition-all shadow-lg uppercase tracking-widest">
                    <XCircle className="h-4 w-4" /> Reject Week
                  </button>
                </div>
              )}
              <div className="ml-3"><StatusBadge status={curriculumData.approvalStatus || 'draft'} /></div>
            </>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* LEVEL 1: PROGRAMS */}
        {view === 'programs' && (
          <motion.div key="programs" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="relative border-none shadow-premium bg-card hover:translate-y-[-8px] transition-all cursor-pointer rounded-[3rem]" onClick={() => handleSelectProgram('gopro')}>
              {isExecutive && <PendingCount count={pendingCounts.program['gopro']} />}
              <CardContent className="p-12 text-left space-y-4 flex flex-col items-start">
                <div className="bg-yellow-400 p-6 rounded-[2rem] shadow-xl shadow-yellow-400/20"><Zap className="h-12 w-12 text-black" /></div>
                <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter italic">Go Pro Program</h3>
                <p className="text-muted-foreground font-medium text-sm leading-relaxed">Filter and manage technical specializations including Mobile and Laptop filmmaking.</p>
                <div className="mt-4 px-8 py-3 bg-foreground text-background rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                   Select Program <ChevronLeft className="h-4 w-4 rotate-180" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="relative border-none shadow-premium bg-card hover:translate-y-[-8px] transition-all cursor-pointer rounded-[3rem]" onClick={() => handleSelectProgram('mentorship')}>
              {isExecutive && <PendingCount count={pendingCounts.program['mentorship']} />}
              <CardContent className="p-12 text-left space-y-4 flex flex-col items-start">
                <div className="bg-blue-600 p-6 rounded-[2rem] shadow-xl shadow-blue-600/20"><Users className="h-12 w-12 text-white" /></div>
                <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter italic">Mentorship Program</h3>
                <p className="text-muted-foreground font-medium text-sm leading-relaxed">Advanced creative tracks focusing on Storyboarding, Strategy, and Directing.</p>
                <div className="mt-4 px-8 py-3 bg-foreground text-background rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                   Select Program <ChevronLeft className="h-4 w-4 rotate-180" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* LEVEL 2: SPECIALIZATIONS */}
        {view === 'specializations' && (
          <motion.div key="specializations" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            {!isRestricted && (
              <Button onClick={() => { setSelectedProgram(null); setView('programs') }} variant="link" className="text-muted-foreground font-black text-[10px] uppercase tracking-widest p-0 flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" /> Back to Programs
              </Button>
            )}
            <div className="bg-card p-10 rounded-[3rem] shadow-premium text-left border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-yellow-400 opacity-20" />
              <SpecializationManager 
                programFilter={selectedProgram as 'gopro' | 'mentorship'} 
                onManageSpecialization={handleManageSpecialization}
                // We'll trust the selector to show counts if we had time to edit it, 
                // but for now we follow the structure.
              />
            </div>
          </motion.div>
        )}

        {/* LEVEL 3: CURRICULA (WEEKS) */}
        {view === 'curricula' && (
          <motion.div key="curricula" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="flex justify-between items-center">
              <Button onClick={() => { setSelectedSpecialization(null); setView('specializations') }} variant="link" className="text-muted-foreground font-black text-[10px] uppercase tracking-widest p-0 flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" /> Back to Specializations
              </Button>
              {!isExecutive && (
                <CurriculumCreator onCurriculumCreated={handleCurriculumCreated} defaultProgramType={selectedProgram as 'gopro' | 'mentorship'} defaultSpecialization={selectedSpecialization?.value} />
              )}
            </div>
            <div key={refreshKey}>
              <CurriculumSelector onSelectCurriculum={handleSelectCurriculum} filter={selectedProgram as 'gopro' | 'mentorship'} specializationFilter={selectedSpecialization?.value} />
            </div>
          </motion.div>
        )}

        {/* LEVEL 4: MODULES (DAYS) */}
        {view === 'modules' && selectedCurriculumId && curriculumData && (
          <motion.div key="modules" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Button onClick={() => { setSelectedCurriculumId(null); setCurriculumData(null); setView('curricula'); setRefreshKey(p => p + 1) }} variant="link" className="mb-6 text-muted-foreground font-black text-[10px] uppercase tracking-widest p-0 flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" /> Back to Weekly Curriculum
            </Button>
            {curriculumData.approvalStatus === 'rejected' && curriculumData.rejectionReason && (
              <div className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] text-red-500 text-sm font-medium flex items-start gap-4 shadow-xl shadow-red-500/5">
                <AlertCircle className="h-6 w-6 shrink-0" />
                <div>
                  <p className="font-black uppercase tracking-widest text-[10px] mb-1">Rejection Feedback:</p>
                  <p className="italic">"{curriculumData.rejectionReason}"</p>
                </div>
              </div>
            )}
            <CurriculumManager curriculumId={selectedCurriculumId} curriculumTitle={curriculumData.title} />
          </motion.div>
        )}
      </AnimatePresence>

      <CurriculumRejectionDialog 
        isOpen={rejectionDialogOpen}
        onClose={() => setRejectionDialogOpen(false)}
        onConfirm={confirmRejectCurriculum}
        curriculumTitle={curriculumData?.title || "Selected Week"}
      />
    </div>
  )
}

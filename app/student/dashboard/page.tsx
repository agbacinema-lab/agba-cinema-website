"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { assignmentService, curriculumService } from "@/lib/services"
import { motion } from "framer-motion"
import {
  Rocket,
  Clock,
  ArrowRight,
  Award,
  Star,
  Zap,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import Link from "next/link"

export default function StudentDashboard() {
  const { profile } = useAuth()
  const [a1Projects, setA1Projects] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [totalModules, setTotalModules] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.uid) loadLiveStats()
  }, [profile?.uid])

  const loadLiveStats = async () => {
    setLoading(true)
    try {
      // 1. Get excellent grades (A1 passes)
      const a1Data = await assignmentService.getA1SubmissionsByStudent(profile?.uid || "")
      setA1Projects(a1Data)
      
      // 2. Load all submissions for the recent activity feed
      const allSubs: any[] = []
      const assignments = await assignmentService.getAllAssignments()
      for (const a of assignments) {
        const sub = await assignmentService.getSubmissionByStudent(a.id, profile?.uid || "")
        if (sub) allSubs.push({ ...sub, assignmentTitle: a.title })
      }
      setSubmissions(allSubs.sort((a, b) => (b.submittedAt?.toMillis() || 0) - (a.submittedAt?.toMillis() || 0)))

      // 3. Calculate dynamic total modules based on student's actual enrollments
      const curricula = await curriculumService.getAllCurricula()
      let total = 0
      
      if (profile?.enrolledSpecializations && profile.enrolledSpecializations.length > 0) {
        const activeSpecs = profile.enrolledSpecializations.map((s:any) => s.value || s.title || s.id)
        curricula.forEach(c => {
          if (activeSpecs.includes(c.specialization) || activeSpecs.includes(c.title)) {
            total += (c.moduleCount || 0)
          }
        })
      } else if (profile?.specialization) {
        curricula.forEach(c => {
          if (c.specialization === profile.specialization) {
            total += (c.moduleCount || 0)
          }
        })
      }
      // If none found for some reason, fallback to a logical number so it doesn't show /0
      setTotalModules(total > 0 ? total : 12)

    } catch (err) {
      console.error("Dashboard Sync Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const latestFeedback = submissions.filter(s => s.feedback).slice(0, 2)
  const pendingProjects = submissions.filter(s => s.status === 'submitted').length

  if (!profile) return null

  return (
    <div className="space-y-10 pb-24 max-w-7xl mx-auto px-4">
      {/* ─── Hero Overview ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8"
      >
        <div className="space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            Active Student
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
            Welcome back,<br />
            <span className="text-yellow-500">{profile.name?.split(' ')[0] || "Student"}</span>
          </h2>

          <p className="text-gray-500 dark:text-gray-400 font-medium max-w-md">
            You are enrolled in the <strong className="text-gray-900 dark:text-white">{String(profile.specialization).replace(/-/g, " ")}</strong> track as part of our <strong className="text-gray-900 dark:text-white capitalize">{profile.programType?.replace(/-/g, " ")}</strong> program.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/student/learning" className="flex items-center gap-2 bg-yellow-400 text-black px-6 h-12 rounded-xl font-bold text-sm transition-all hover:bg-yellow-500 active:scale-95 shadow-sm">
              Go to Classroom <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="relative z-10 bg-white/5 border border-white/5 p-8 rounded-[2rem] text-center md:min-w-[200px] shadow-2xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Excellent Passes</p>
          <p className="text-6xl font-black text-yellow-500 tracking-tighter">{a1Projects.length}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-2">Verified A1 Grades</p>
        </div>
      </motion.div>

      {/* ─── Core Metrics Data ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <LiveStatCard 
          label="Course Progress" 
          value={loading ? "..." : `${a1Projects.length} / ${totalModules}`} 
          icon={Award} 
          color="text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10" 
          sub="Modules Passed"
          delay={0.1}
        />
        <LiveStatCard 
          label="My Path" 
          value={String(profile.specialization).replace(/-/g, " ")} 
          icon={Rocket} 
          color="text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" 
          sub="Active Curriculum"
          delay={0.2}
        />
        <LiveStatCard 
          label="Pending Grades" 
          value={loading ? "..." : String(pendingProjects)} 
          icon={Clock} 
          color="text-orange-500 bg-orange-50 dark:bg-orange-500/10" 
          sub="Submitted Work"
          delay={0.3}
        />
        <LiveStatCard 
          label="Account Status" 
          value={(profile as any).status === 'internship_ready' ? 'Elite Ready' : (profile as any).status || 'Active'} 
          icon={ShieldCheck} 
          color="text-green-500 bg-green-50 dark:bg-green-500/10" 
          sub="Portal Access"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ─── Left Column: Recent Submissions & Portfolio Goal ─── */}
        <div className="lg:col-span-8 space-y-6">
          <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-400" /> Recent Activity
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              [1, 2].map(i => <div key={i} className="h-32 bg-white/5 rounded-3xl animate-pulse" />)
            ) : submissions.filter(s => s.status !== 'graded').length > 0 ? (
               submissions.filter(s => s.status !== 'graded').slice(0, 2).map((sub, i) => (
                <div key={i} className="bg-card border border-white/5 p-6 rounded-[2rem] shadow-2xl hover:border-yellow-400/50 transition-all group">
                  <span className="inline-block bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-500 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md mb-3">
                    Submitted
                  </span>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white leading-tight mb-2 truncate">
                    {sub.assignmentTitle}
                  </h4>
                  <p className="text-xs text-gray-500 font-medium">Awaiting tutor review.</p>
                </div>
               ))
            ) : (
               <div className="col-span-2 bg-white/5 border border-white/5 py-16 px-6 rounded-[2.5rem] text-center italic">
                  <CheckCircle2 className="h-10 w-10 text-gray-800 mx-auto mb-4" />
                  <p className="text-sm font-black uppercase tracking-widest text-gray-500">You're all caught up!</p>
                  <p className="text-[10px] text-gray-600 mt-1 uppercase font-bold">No pending assignments waiting for a grade.</p>
               </div>
            )}
          </div>

          {/* Core App Logic: The 5 A1 rule to unlock profiles */}
          <div className="bg-gray-900 dark:bg-black p-8 rounded-3xl text-white relative overflow-hidden group">
             <div className="relative z-10 space-y-6">
               <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-yellow-400 mb-1">Platform Goal</p>
                    <h4 className="text-xl font-bold text-white">Unlock Live Portfolio</h4>
                  </div>
                  <p className="text-sm font-bold">{Math.round(Math.min((a1Projects.length / 5) * 100, 100))}% Done</p>
               </div>
               
               <div className="h-3 bg-white/10 rounded-full overflow-hidden relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((a1Projects.length / 5) * 100, 100)}%` }}
                    className="h-full bg-yellow-400"
                  />
               </div>
               
               <p className="text-gray-400 font-medium text-sm">
                 You need <strong>5 Excellent (A1) grades</strong> to automatically unlock your public portfolio profile and become visible to brands looking for talent.
               </p>
             </div>
          </div>
        </div>

        {/* ─── Right Column: Feedback & Community ─── */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-gray-400" /> Tutor Feedback
          </h3>
          
          <div className="space-y-4">
            {latestFeedback.length === 0 ? (
               <div className="bg-white/5 border border-white/5 p-10 rounded-[2rem] text-center flex flex-col items-center italic">
                  <AlertCircle className="h-8 w-8 text-gray-800 mb-3" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">No feedback received yet. Submit an assignment to get graded.</p>
               </div>
            ) : (
               latestFeedback.map((sub, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="bg-card p-6 rounded-2xl border border-white/5 shadow-2xl"
                >
                   <div className="flex justify-between items-center mb-4">
                      <div className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${
                        sub.grade >= 75 
                          ? 'bg-green-500/10 text-green-500' 
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                         {sub.grade >= 75 ? 'A1 Excellent' : 'Needs Work'}
                      </div>
                   </div>
                   <p className="font-black text-white italic uppercase text-sm leading-tight mb-2 truncate">{sub.assignmentTitle}</p>
                   <p className="text-[11px] text-gray-400 font-medium italic line-clamp-2 leading-relaxed">"{sub.feedback}"</p>
                </motion.div>
              ))
            )}
          </div>

          <a href="https://whatsapp.com/channel/0029Vb5q75L4CrffFHSsd20Z" target="_blank" rel="noopener noreferrer" className="block bg-green-500 hover:bg-green-600 p-6 rounded-3xl text-white shadow-md transition-colors text-center mt-6">
             <Star className="h-6 w-6 text-white fill-white mx-auto mb-3" />
             <h4 className="text-sm font-bold uppercase tracking-widest">Join WhatsApp Channel</h4>
             <p className="text-xs text-green-100 mt-1">Connect with the community</p>
          </a>
        </div>
      </div>
    </div>
  )
}

function LiveStatCard({ label, value, icon: Icon, color, sub, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card p-6 rounded-[2rem] border border-white/5 shadow-2xl flex flex-col justify-between relative overflow-hidden group hover:border-yellow-400/30 transition-all"
    >
      <div className="flex justify-between items-start mb-6">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-white/5 opacity-80 group-hover:scale-110 transition-transform ${color.replace('dark:', '')}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
        <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight truncate">{value}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">{sub}</p>
      </div>
    </motion.div>
  )
}

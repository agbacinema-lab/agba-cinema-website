"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { assignmentService, studentService } from "@/lib/services"
import { motion, AnimatePresence } from "framer-motion"
import {
  Rocket,
  Clock,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Trophy,
  AlertCircle,
  FileText,
  Award,
  Star,
  Zap,
  ChevronRight,
  ShieldCheck
} from "lucide-react"
import Link from "next/link"

export default function StudentDashboard() {
  const { profile } = useAuth()
  const [a1Projects, setA1Projects] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.uid) loadLiveStats()
  }, [profile?.uid])

  const loadLiveStats = async () => {
    setLoading(true)
    try {
      const a1Data = await assignmentService.getA1SubmissionsByStudent(profile?.uid || "")
      setA1Projects(a1Data)
      
      // Load all submissions for the "Recent Activity" feed
      const allSubs: any[] = []
      const assignments = await assignmentService.getAllAssignments()
      for (const a of assignments) {
        const sub = await assignmentService.getSubmissionByStudent(a.id, profile?.uid || "")
        if (sub) allSubs.push({ ...sub, assignmentTitle: a.title })
      }
      setSubmissions(allSubs.sort((a, b) => (b.submittedAt?.toMillis() || 0) - (a.submittedAt?.toMillis() || 0)))
    } catch (err) {
      console.error("Dashboard Sync Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const latestFeedback = submissions.filter(s => s.feedback).slice(0, 2)
  const pendingProjects = submissions.filter(s => s.status === 'submitted').length

  return (
    <div className="space-y-10 pb-24">
      {/* ─── Hero Intelligence Hub ─── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[4rem] bg-black p-10 md:p-16 text-white shadow-[0_50px_100px_rgba(0,0,0,0.3)]"
      >
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-8 space-y-8">
             <div className="flex items-center gap-4">
                <span className="bg-yellow-400 text-black px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">Operational Status: Active</span>
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
             </div>
             
             <h2 className="text-5xl md:text-8xl font-black italic tracking-tighter leading-tight uppercase">
               SYSTEMS ENGAGED,<br />
               <span className="text-yellow-400 not-italic">{profile?.name?.split(' ')[0] || "STUDENT"}</span>
             </h2>

             <p className="text-gray-400 font-bold max-w-xl text-lg italic leading-relaxed">
               You are currently navigating the <span className="text-white uppercase tracking-wider">{profile?.specialization || "Unassigned"}</span> track within our <span className="text-white italic">{profile?.programType === 'gopro' ? 'Go Pro' : 'Mentorship'}</span> framework.
             </p>

             <div className="flex flex-wrap gap-4 pt-4">
               <Link href="/student/learning" className="flex items-center gap-3 bg-white text-black px-10 h-16 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-yellow-400 hover:scale-105 active:scale-95 shadow-2xl">
                 Resume Curriculum <ArrowRight className="h-5 w-5" />
               </Link>
               <Link href="/student/portfolio" className="flex items-center gap-3 bg-white/10 text-white border border-white/20 px-8 h-16 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-white hover:text-black shadow-xl">
                 Visibility Profile
               </Link>
             </div>
          </div>

          <div className="lg:col-span-4 hidden lg:block">
            <div className="p-10 bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 space-y-8 relative group">
               <div className="absolute inset-0 bg-yellow-400/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-2">A1 Success Rate</p>
                  <p className="text-6xl font-black italic tracking-tighter text-yellow-400">{a1Projects.length}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mt-2">Verified Projects</p>
               </div>
               <div className="h-px bg-white/10 w-full" />
               <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-500">Tier Status</span>
                  <span className="text-white">{a1Projects.length >= 5 ? 'ELITE PRO' : 'RISING TALENT'}</span>
               </div>
            </div>
          </div>
        </div>

        {/* Cinematic Backdrop Elements */}
        <div className="absolute top-0 right-0 w-[80%] h-full bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.08)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-yellow-400/10 rounded-full blur-[120px] pointer-events-none" />
      </motion.div>

      {/* ─── Metric Command Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <LiveStatCard 
          label="Course Milestone" 
          value={loading ? "..." : `${a1Projects.length} / 12`} 
          icon={Award} 
          color="text-yellow-500" 
          sub="A1 Passes"
          delay={0.1}
        />
        <LiveStatCard 
          label="Track Focus" 
          value={profile?.specialization || "Initializing"} 
          icon={Rocket} 
          color="text-indigo-500" 
          sub="Current Path"
          delay={0.2}
        />
        <LiveStatCard 
          label="Active Pending" 
          value={loading ? "..." : String(pendingProjects)} 
          icon={Clock} 
          color="text-orange-500" 
          sub="Awaiting Grade"
          delay={0.3}
        />
        <LiveStatCard 
          label="Security Pass" 
          value="LEVEL 1" 
          icon={ShieldCheck} 
          color="text-green-500" 
          sub="Access Verified"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* ─── Recent Broadcasts/Feedback ─── */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter">Live Transmission Feed</h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Real-time Intel</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              [1, 2].map(i => <div key={i} className="h-48 bg-gray-50 rounded-[3rem] animate-pulse" />)
            ) : submissions.filter(s => s.status !== 'graded').length > 0 ? (
               submissions.filter(s => s.status !== 'graded').slice(0, 2).map((sub, i) => (
                <div key={i} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:border-black transition-all">
                  <p className="text-[9px] font-black uppercase tracking-widest text-indigo-600 mb-4">Submission Status</p>
                  <h4 className="text-xl font-black uppercase italic tracking-tighter mb-2">{sub.assignmentTitle}</h4>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Protocol: Received & Awaiting Tutor</p>
                  <div className="absolute bottom-6 right-6 p-3 bg-gray-50 rounded-2xl group-hover:bg-yellow-400 transition-colors">
                    <Clock className="h-5 w-5 text-gray-300 group-hover:text-black" />
                  </div>
                </div>
               ))
            ) : (
               <div className="col-span-2 bg-gray-50/50 p-20 rounded-[4rem] text-center border-2 border-dashed border-gray-100 italic">
                  <Zap className="h-10 w-10 text-gray-200 mx-auto mb-4" />
                  <h5 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-2">No active pending projects.</h5>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Ready for your next module? Head to the workspace.</p>
               </div>
            )}
          </div>

          {/* Specialization Unlock Progress */}
          <div className="bg-black p-12 rounded-[4rem] text-white relative overflow-hidden group">
             <div className="relative z-10 space-y-8">
               <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-400 mb-2">Global Visibility Unblocking</p>
                    <h4 className="text-3xl font-black uppercase italic tracking-tighter">Visibility Milestone</h4>
                  </div>
                  <p className="text-xs font-black italic">{Math.round((a1Projects.length / 5) * 100)}% COMPLETE</p>
               </div>
               
               <div className="h-4 bg-white/10 rounded-full overflow-hidden relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((a1Projects.length / 5) * 100, 100)}%` }}
                    className="h-full bg-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.5)]"
                  />
               </div>
               
               <p className="text-gray-500 font-bold text-xs italic leading-relaxed">
                 Reach **5 A1 (Excellent)** grades to unlock your Profile Visibility and join the **Àgbà Elite Directory** for global placements.
               </p>
             </div>
             <div className="absolute right-0 top-0 w-64 h-64 bg-yellow-400/5 blur-[80px] -mr-32 -mt-32 group-hover:bg-yellow-400/10 transition-all duration-1000" />
          </div>
        </div>

        {/* ─── Tutor Feedback Sidebar ─── */}
        <div className="lg:col-span-4 space-y-8">
          <h3 className="text-2xl font-black italic uppercase tracking-tighter">Mentor Feed</h3>
          
          <div className="space-y-6">
            {latestFeedback.length === 0 ? (
               <div className="bg-white p-12 rounded-[3.5rem] text-center border border-gray-100 opacity-50">
                  <AlertCircle className="h-10 w-10 text-gray-200 mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Awaiting your first A1 evaluation.</p>
               </div>
            ) : (
              latestFeedback.map((sub, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm relative group hover:border-black transition-all"
                >
                   <div className="flex justify-between items-center mb-6">
                      <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${sub.grade >= 75 ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'}`}>
                         AWARDS: {sub.grade >= 75 ? 'A1' : 'B2'}
                      </div>
                      <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Received</span>
                   </div>
                   <p className="text-sm font-black uppercase italic tracking-tighter mb-4 text-black">{sub.assignmentTitle}</p>
                   <p className="text-xs text-gray-500 font-medium italic leading-relaxed line-clamp-3">"{sub.feedback}"</p>
                   <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all">
                      <ChevronRight className="h-5 w-5 text-black" />
                   </div>
                </motion.div>
              ))
            )}
          </div>

          <div className="bg-indigo-600 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group cursor-pointer hover:scale-105 transition-all">
             <div className="relative z-10 flex flex-col items-center text-center gap-4">
                <Star className="h-8 w-8 text-yellow-400 fill-yellow-400" />
                <h4 className="text-xl font-black uppercase italic tracking-tighter">AGBA COLLECTIVE</h4>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-300">Join the elite Discord Hub</p>
             </div>
             <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </div>
  )
}

function LiveStatCard({ label, value, icon: Icon, color, sub, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-2xl hover:border-black transition-all duration-500 group relative overflow-hidden"
    >
      <div className={`w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center ${color} mb-6 transition-all group-hover:scale-110 group-hover:bg-black group-hover:text-white`}>
        <Icon className="h-7 w-7" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">{label}</p>
        <p className="text-2xl font-black text-black tracking-tighter uppercase italic truncate">{value}</p>
        <p className="text-[9px] font-black uppercase tracking-widest text-gray-300 mt-2">{sub}</p>
      </div>
      <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-gray-50 rounded-full group-hover:bg-yellow-400/10 transition-all" />
    </motion.div>
  )
}

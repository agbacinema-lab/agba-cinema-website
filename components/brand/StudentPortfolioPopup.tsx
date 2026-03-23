"use client"

import { useState, useEffect } from "react"
import { StudentProfile, UserProfile } from "@/lib/types"
import { lmsService } from "@/lib/services"
import { 
  X, 
  ExternalLink, 
  Youtube, 
  Database, 
  FileText, 
  Globe, 
  Award, 
  CheckCircle2, 
  PlayCircle,
  Briefcase,
  User,
  Zap
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

interface StudentPortfolioPopupProps {
  student: StudentProfile & { name?: string, email?: string }
  onClose: () => void
}

export default function StudentPortfolioPopup({ student, onClose }: StudentPortfolioPopupProps) {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSubs() {
      try {
        const subs = await lmsService.getSubmissionsByStudent(student.studentUID || student.userId)
        setSubmissions(subs)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadSubs()
  }, [student])

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/90 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-card w-full max-w-6xl h-full max-h-[90vh] rounded-[3rem] overflow-hidden border border-white/10 flex flex-col relative"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 z-50 p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-all active:scale-95"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Header Section */}
        <div className="bg-black text-white p-10 md:p-16 border-b border-white/10 relative overflow-hidden">
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                <div className="space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-yellow-400 rounded-3xl flex items-center justify-center text-4xl text-black font-black shadow-2xl shadow-yellow-400/20">
                        {student.fullName[0]}
                      </div>
                      <div>
                        <div className="bg-yellow-400/10 text-yellow-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 mb-2 border border-yellow-400/20">
                            <Zap className="h-3 w-3 fill-current" /> Verified Specialist
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">{student.fullName}</h2>
                        <p className="text-[10px] font-black uppercase text-yellow-400 tracking-[0.4em] mt-2 opacity-80">
                           {student.programType === 'mentorship' ? 'ELITE ACADEMY / MENTORSHIP TRACK' : 'GOPRO / CREATIVE PROFESSIONAL TRACK'}
                        </p>
                      </div>
                   </div>
                   <p className="text-gray-400 max-w-2xl font-medium text-lg leading-relaxed mt-6">
                      {student.bio || "No biography available. This specialist is ready for high-impact creative deployment."}
                   </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    {student.portfolioLinks?.youtube && (
                        <a href={student.portfolioLinks.youtube} target="_blank" className="flex items-center gap-2 px-6 h-14 bg-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">
                            <Youtube className="h-5 w-5" /> Reel
                        </a>
                    )}
                    {student.portfolioLinks?.drive && (
                        <a href={student.portfolioLinks.drive} target="_blank" className="flex items-center gap-2 px-6 h-14 bg-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">
                            <Database className="h-5 w-5" /> Assets
                        </a>
                    )}
                    {student.portfolioLinks?.website && (
                        <a href={student.portfolioLinks.website} target="_blank" className="flex items-center gap-2 px-6 h-14 bg-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">
                            <Globe className="h-5 w-5" /> Website
                        </a>
                    )}
                </div>
             </div>
             
             {/* Background glow */}
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-400/10 blur-[120px] -mr-64 -mt-64" />
        </div>

        {/* Content Tabs */}
        <div className="flex-1 overflow-y-auto p-10 md:p-16 custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                
                {/* Left: Professional Stats */}
                <div className="space-y-12">
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Expertise Spectrum</h4>
                        <div className="flex flex-wrap gap-2">
                            {student.skills?.map(skill => (
                                <span key={skill} className="bg-muted px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-muted-foreground/10">{skill}</span>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Operational Data</h4>
                        <div className="space-y-4">
                            <div className="p-5 bg-muted/20 border border-muted rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Briefcase className="h-4 w-4 text-yellow-500" />
                                    <span className="text-xs font-bold">Program Type</span>
                                </div>
                                 <span className="text-xs font-black uppercase">{student.programType}</span>
                             </div>
                             <div className="p-5 bg-muted/20 border border-muted rounded-2xl flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                     <Zap className="h-4 w-4 text-purple-500" />
                                     <span className="text-xs font-bold">Specialization</span>
                                 </div>
                                 <span className="text-xs font-black uppercase">{student.specialization || "Undifferentiated"}</span>
                             </div>
                             <div className="p-5 bg-muted/20 border border-muted rounded-2xl flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                     <CheckCircle2 className="h-4 w-4 text-green-500" />
                                     <span className="text-xs font-bold">Readiness</span>
                                 </div>
                                 <span className="text-xs font-black uppercase text-green-500">{student.status}</span>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Right: Work evidence */}
                <div className="lg:col-span-2 space-y-12">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Evidence of Competence (Submissions)</h4>
                        <span className="bg-muted px-3 py-1 rounded-lg text-[10px] font-black">{submissions.length} FILES</span>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {[1,2,3].map(i => <div key={i} className="h-24 bg-muted/20 rounded-3xl animate-pulse" />)}
                        </div>
                    ) : submissions.length === 0 ? (
                        <div className="p-20 border-2 border-dashed border-muted rounded-[3rem] text-center space-y-4">
                            <FileText className="h-10 w-10 text-muted/20 mx-auto" />
                            <p className="text-sm font-bold text-muted-foreground italic">No public assets deployed for this profile yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {submissions.map((sub: any) => (
                                <div key={sub.id} className="bg-muted/10 border border-muted p-6 rounded-[2rem] hover:bg-muted/20 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-white/5 rounded-xl group-hover:bg-yellow-400 group-hover:text-black transition-colors">
                                            <PlayCircle className="h-5 w-5" />
                                        </div>
                                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${sub.status === 'approved' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-400/20 text-yellow-500'}`}>
                                            {sub.status || 'Verified'}
                                        </span>
                                    </div>
                                    <h5 className="font-black uppercase tracking-tight text-lg mb-2 line-clamp-1">{sub.assignmentTitle || "Project Task"}</h5>
                                    <a 
                                        href={sub.driveLink} 
                                        target="_blank" 
                                        className="text-[10px] font-black uppercase tracking-widest text-yellow-500 flex items-center gap-2 hover:underline"
                                    >
                                        Execute Review <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

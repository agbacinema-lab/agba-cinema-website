"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { studentService, assignmentService } from "@/lib/services"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { 
  Star, 
  Youtube, 
  Globe, 
  ExternalLink, 
  Save, 
  Layout,
  Share2,
  CheckCircle,
  AlertCircle,
  Award,
  Video,
  ArrowRight
} from "lucide-react"

export default function StudentPortfolio() {
  const { profile } = useAuth()
  const [links, setLinks] = useState({ youtube: "", drive: "", behance: "", website: "" })
  const [a1Projects, setA1Projects] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [saveDone, setSaveDone] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.uid) {
      loadData()
    }
  }, [profile?.uid])

  const loadData = async () => {
    setLoading(true)
    try {
      const [profileData, a1Data] = await Promise.all([
        studentService.getStudentProfile(profile?.uid || ""),
        assignmentService.getA1SubmissionsByStudent(profile?.uid || "")
      ])
      
      if (profileData?.portfolioLinks) setLinks(profileData.portfolioLinks as any)
      setA1Projects(a1Data)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await studentService.updatePortfolio(profile?.uid || "", links)
      toast.success("Portfolio links updated successfully!")
      setSaveDone(true)
      setTimeout(() => setSaveDone(false), 3000)
    } catch (error) {
       toast.error("Failed to update links")
    } finally {
       setSaving(false)
    }
  }

  return (
    <div className="space-y-16 pb-32">
      {/* Portfolio Hero */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
         <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2">
               <span className="bg-yellow-400 text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">Visibility Hub</span>
            </div>
            <h3 className="text-4xl lg:text-6xl font-black italic uppercase tracking-tighter leading-none">
               CRAFTING YOUR <br /><span className="text-gray-300">PROFESSIONAL LEGACY</span>
            </h3>
            <p className="text-gray-500 font-medium leading-relaxed italic">
              Excellence is the only currency. Your A1-graded projects are automatically featured here as prime talent indicators for our partner brands.
            </p>
         </div>

         <div className="flex gap-4">
            <button 
               onClick={handleSave}
               disabled={saving}
               className={`h-16 px-10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl transition-all ${
                 saveDone ? 'bg-green-600 text-white' : 'bg-black text-white hover:bg-yellow-400 hover:text-black shadow-black/20 hover:scale-105 active:scale-95'
               }`}
            >
              {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : saveDone ? <CheckCircle className="h-5 w-5" /> : <Save className="h-5 w-5" />}
              {saving ? "Locking..." : saveDone ? "Links Updated" : "Update Portfolio Links"}
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
         {/* PROMINENT A1 PROJECTS - AUTOMATICALLY "MOVED" HERE */}
         <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
               <h4 className="text-xl font-black italic uppercase tracking-tight flex items-center gap-3 text-white">
                 <Award className="h-6 w-6 text-yellow-500" /> A1 Academy Submissions
               </h4>
               <span className="px-4 py-2 bg-white/5 text-[9px] font-black uppercase tracking-widest rounded-full opacity-60 text-gray-500">Verified Credentials</span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map(i => <div key={i} className="h-64 bg-white/5 rounded-[3rem] animate-pulse" />)}
              </div>
            ) : a1Projects.length === 0 ? (
              <div className="bg-white/5 p-20 rounded-[3rem] text-center border-2 border-dashed border-white/5">
                 <Star className="h-10 w-10 text-gray-800 mx-auto mb-4" />
                 <p className="text-sm font-black uppercase tracking-widest text-gray-500">Your A1 projects will automatically manifest here.</p>
                 <p className="text-[10px] text-gray-400 mt-2 uppercase font-bold">Strive for 75% excellence on your current modules.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {a1Projects.map((project, i) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="group bg-black rounded-[3rem] p-10 h-80 flex flex-col justify-between relative overflow-hidden shadow-2xl"
                  >
                    <div className="relative z-10 flex flex-col h-full justify-between">
                       <div className="flex justify-between items-start">
                          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                             <Video className="h-5 w-5 text-yellow-400" />
                          </div>
                          <div className="px-5 py-2 bg-yellow-400 text-black rounded-full text-[9px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(250,204,21,0.3)]">
                             A1 Grade Pass
                          </div>
                       </div>
                       
                       <div className="space-y-4">
                          <h5 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none group-hover:text-yellow-400 transition-colors uppercase italic">{project.assignmentTitle}</h5>
                          <a 
                             href={project.submissionUrl} 
                             target="_blank" 
                             rel="noreferrer" 
                             className="flex items-center gap-2 text-white/40 group-hover:text-white transition-all text-[10px] font-black uppercase tracking-widest group-hover:translate-x-2"
                          >
                             Explore Verified Work <ArrowRight className="h-4 w-4" />
                          </a>
                       </div>
                    </div>
                    
                    {/* Background glow */}
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-yellow-400/5 rounded-full blur-[80px] group-hover:bg-yellow-400/10 transition-all duration-700" />
                  </motion.div>
                ))}
              </div>
            )}
         </div>

         {/* Link Management Sidebar */}
         <div className="lg:col-span-4 space-y-10">
            <h4 className="text-xl font-black italic uppercase tracking-tight text-gray-400">Social Connectors</h4>
            
            <div className="bg-card p-10 rounded-[3rem] border border-white/5 shadow-2xl space-y-10">
               <PortfolioField icon={Youtube} label="Showreel / Video Channel" placeholder="..." value={links.youtube} onChange={(v: string) => setLinks({...links, youtube: v})} />
               <PortfolioField icon={Layout} label="Behance Profile" placeholder="..." value={links.behance} onChange={(v: string) => setLinks({...links, behance: v})} />
               <PortfolioField icon={Share2} label="Direct Drive Vault" placeholder="..." value={links.drive} onChange={(v: string) => setLinks({...links, drive: v})} />
               <PortfolioField icon={Globe} label="Personal Hub / Site" placeholder="..." value={links.website} onChange={(v: string) => setLinks({...links, website: v})} />
            </div>

            {/* Checklist */}
            <div className="bg-black p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
               <div className="relative z-10 flex justify-between items-start mb-8">
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400 mb-2">Talent Status</p>
                     <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter">INTERNAL POOL</h4>
                  </div>
                  <AlertCircle className="h-6 w-6 text-yellow-400 opacity-50" />
               </div>
               
               <p className="text-gray-500 font-bold mb-10 text-xs leading-relaxed max-w-sm italic">
                  Complete 3 more A1-graded modules to be eligible for global brand placement.
               </p>

               <div className="space-y-4">
                  <CheckItem label="A1 Project Achievement" done={a1Projects.length > 0} />
                  <CheckItem label="Verified Connectors" done={Object.values(links).filter(v => v).length >= 2} />
                  <CheckItem label="Identity Verification" done={true} />
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}

function PortfolioField({ icon: Icon, label, placeholder, value, onChange }: any) {
  return (
    <div className="space-y-2 group/field">
       <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1 group-focus-within/field:text-yellow-400 transition-colors uppercase">{label}</label>
       <div className="relative">
          <Icon className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within/field:text-white transition-colors" />
          <input 
            type="text" 
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-16 bg-[#0A0A0A] border border-white/5 pl-16 pr-8 rounded-2xl text-[11px] font-black uppercase tracking-wider text-white focus:bg-white/5 focus:ring-[12px] ring-yellow-400/10 transition-all outline-none"
          />
       </div>
    </div>
  )
}

function CheckItem({ label, done }: { label: string, done: boolean }) {
  return (
    <div className="flex items-center gap-4">
       <div className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all ${done ? 'bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-600/30' : 'border-gray-800 bg-black'}`}>
         {done && <CheckCircle className="h-4 w-4 text-white" />}
       </div>
       <span className={`text-[10px] uppercase tracking-widest font-black ${done ? 'text-white' : 'text-gray-500'}`}>{label}</span>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, limit } from "firebase/firestore"
import { StudentProfile } from "@/lib/types"
import { 
  Youtube, 
  MapPin, 
  ExternalLink, 
  Palette, 
  CheckCircle2, 
  Zap, 
  Globe,
  Briefcase,
  PlayCircle
} from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export default function StudentPortfolioPublic({ params }: { params: { studentId: string } }) {
  const [student, setStudent] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const q = query(collection(db, "students"), where("studentId", "==", params.studentId), limit(1))
      const snap = await getDocs(q)
      if (!snap.empty) {
        setStudent(snap.docs[0].data() as StudentProfile)
      }
      setLoading(false)
    }
    fetch()
  }, [params.studentId])

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
       <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!student) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white font-black italic uppercase tracking-widest text-xl">
       Classified Agent Profile Not Found.
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white selection:bg-yellow-400 selection:text-black">
      {/* 🎬 Cinematic Header */}
      <section className="relative h-[70vh] flex items-end pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-[url('/cinematic-video-setup.png')] bg-cover bg-center grayscale opacity-40 scale-105" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-20 w-full">
           <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <span className="bg-yellow-400 text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] inline-block shadow-2xl">
                 CREATIVE AGENT // {student.studentId}
              </span>
              <h1 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter leading-[0.85]">
                 {student.fullName}
              </h1>
              <div className="flex flex-wrap gap-4 pt-4">
                 {student.skills.map(s => (
                   <span key={s} className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400">
                      {s}
                   </span>
                 ))}
              </div>
           </motion.div>
        </div>
      </section>

      {/* 💼 Operational Narrative */}
      <section className="py-32 bg-[#050505]">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-24">
            <div className="space-y-12">
               <div>
                  <h4 className="text-yellow-400 font-black uppercase tracking-[0.5em] text-xs mb-6">Manifesto</h4>
                  <p className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-tight">
                     {student.bio || "Crafting cinematic experiences through disciplined storytelling and technical mastery."}
                  </p>
               </div>
               
               <div className="grid grid-cols-2 gap-8 pt-8">
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Operational Status</p>
                     <p className="text-lg font-black italic uppercase tracking-tight flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" /> MISSION READY
                     </p>
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Track Record</p>
                     <p className="text-lg font-black italic uppercase tracking-tight flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-400" /> ELITE CREATIVE
                     </p>
                  </div>
               </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[3rem] p-12 space-y-10">
               <h4 className="text-xl font-black italic uppercase tracking-tight">Deployment Channels</h4>
               <div className="space-y-4">
                  <PortfolioLink icon={<Youtube className="h-5 w-5" />} label="Visual Proof (Showreel)" link={student.portfolioLinks?.youtube} />
                  <PortfolioLink icon={<Globe className="h-5 w-5" />} label="Personal Web Estate" link={student.portfolioLinks?.website} />
                  <PortfolioLink icon={<Palette className="h-5 w-5" />} label="Design Repository" link={student.portfolioLinks?.behance} />
               </div>
               
               <div className="pt-8 mt-8 border-t border-white/5">
                  <p className="text-xs text-gray-500 font-medium italic leading-relaxed">
                     This agent has been vetted by the ÀGBÀ CINEMA council. Recruitment requests must be initiated through the official admin protocol.
                  </p>
                  <Button className="w-full mt-8 h-16 bg-yellow-400 text-black font-black uppercase italic tracking-tighter rounded-2xl hover:bg-white transition-all">
                     Initiate Recruitment Request
                  </Button>
               </div>
            </div>
         </div>
      </section>
    </div>
  )
}

function PortfolioLink({ icon, label, link }: any) {
  if (!link) return (
    <div className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-dashed border-white/5 opacity-40">
       <div className="flex items-center gap-4 text-gray-500 italic font-black text-xs uppercase">
          {icon} {label}
       </div>
       <span className="text-[9px] font-black uppercase">Not Deployed</span>
    </div>
  )

  return (
    <a href={link} target="_blank" className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-yellow-400 hover:bg-white/10 transition-all group">
       <div className="flex items-center gap-4 text-white font-black text-xs uppercase tracking-widest italic">
          {icon} {label}
       </div>
       <ExternalLink className="h-4 w-4 text-gray-500 group-hover:text-yellow-400 transition-colors" />
    </a>
  )
}

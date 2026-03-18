"use client"

import { useAuth } from "@/context/AuthContext"
import { motion } from "framer-motion"
import { 
  Calendar, 
  Target, 
  GraduationCap, 
  ShieldCheck, 
  CreditCard,
  Briefcase,
  Mail,
  Smartphone,
  ArrowRight,
  Video,
  Layers,
  Camera,
  Mic2,
  Monitor,
  User 
} from "lucide-react"
import Link from "next/link"

const AVATAR_ICONS: Record<string, any> = {
  director: Video,
  editor: Layers,
  colorist: Camera,
  sound: Mic2,
  producer: Briefcase,
  vfx: Monitor
}

const AVATAR_NAMES: Record<string, string> = {
  director: "The Director",
  editor: "The Editor",
  colorist: "The Colorist",
  sound: "Sound Designer",
  producer: "The Producer",
  vfx: "VFX Artist"
}

export default function StudentProfile() {
  const { profile } = useAuth()
  
  const avatarId = profile?.avatarId || ""
  const AvatarIcon = AVATAR_ICONS[avatarId] || User
  const avatarLabel = AVATAR_NAMES[avatarId] || "Creative Student"
  const shortId = profile?.uid ? (profile.uid.slice(-8).toUpperCase()) : "SYNCING"

  const ENROLLMENT_DETAILS = [
    { label: "Date Enrolled", value: "Feb 15, 2026", icon: Calendar, color: "text-blue-500" },
    { label: "Phase Target", value: "A1 Proficiency", icon: Target, color: "text-green-500" },
    { label: "Status Path", value: "85% Level Up", icon: GraduationCap, color: "text-orange-500" },
    { label: "Elite Clearance", value: "Full Access", icon: CreditCard, color: "text-indigo-500" },
  ]

  return (
    <div className="space-y-12 pb-32">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Col: Digital ID & Manifesto */}
        <div className="lg:col-span-4 space-y-10">
          <div className="space-y-1 ml-4">
             <h3 className="text-2xl font-black italic uppercase tracking-tighter text-black/20">Identity Card</h3>
             <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Academy Recognition Profile</p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="group relative w-full aspect-[1.6/1] bg-black rounded-[3rem] overflow-hidden p-10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] flex flex-col justify-between"
          >
            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-2">
                <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">
                  ÀGBÀ <span className="text-yellow-400 not-italic">STUDENT</span>
                </h2>
                <div className="bg-yellow-400 text-black px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] inline-block shadow-lg">
                  VERIFIED VISIONARY
                </div>
              </div>
              <div className="w-16 h-16 bg-white/5 backdrop-blur-3xl rounded-[1.5rem] flex items-center justify-center border border-white/10 group-hover:bg-yellow-400 group-hover:text-black transition-all duration-700">
                 <AvatarIcon className="h-8 w-8" />
              </div>
            </div>

            <div className="flex items-center gap-6 relative z-10 transition-transform group-hover:translate-x-2 duration-700">
              <div className="w-24 h-24 rounded-[2rem] bg-yellow-400 flex items-center justify-center text-4xl font-black text-black shadow-2xl relative overflow-hidden shrink-0">
                {profile?.name ? profile.name[0] : <User className="h-10 w-10 opacity-30" />}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none truncate max-w-[200px]">{profile?.name || "Member UNKNOWN"}</h4>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.3em] mt-3 italic">{avatarLabel}</p>
                <div className="mt-2 flex items-center gap-2">
                   <div className="h-1 w-1 rounded-full bg-yellow-400 animate-pulse" />
                   <p className="text-[9px] text-white/30 font-black uppercase tracking-[0.3em]">REF: {shortId}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-end relative z-10 border-t border-white/10 pt-8 mt-2">
              <div className="space-y-1">
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest leading-none">Curriculum Focus</p>
                <p className="text-sm font-black text-white uppercase italic tracking-tighter truncate max-w-[150px] group-hover:text-yellow-400 transition-colors">
                  {profile?.specialization || "Training Mode Active"}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 group-hover:rotate-12 transition-transform duration-500">
                 <ShieldCheck className="h-5 w-5 text-yellow-400" />
                 <p className="text-[7px] text-gray-500 font-black uppercase tracking-[0.4em]">AUTHENTICATED</p>
              </div>
            </div>

            {/* Glowing Backdrop */}
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.1)_0%,transparent_60%)] pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-yellow-400/5 rounded-full blur-[100px] pointer-events-none" />
          </motion.div>

          <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm relative group">
             <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-600 mb-6 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Personal Manifesto
             </h4>
             <p className="text-lg font-bold text-gray-500 italic leading-relaxed group-hover:text-black transition-colors duration-500">
               {profile?.bio ? `"${profile.bio}"` : "This visionary has not yet defined their identity manifesto. Sync your vision in Settings."}
             </p>
          </div>

          {/* Assigned Tutor Card */}
          <div className={`p-10 rounded-[3rem] border-2 flex items-center gap-6 ${profile?.tutorId ? 'bg-black text-white border-black' : 'bg-gray-50 border-dashed border-gray-200'}`}>
            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 ${profile?.tutorId ? 'bg-yellow-400 text-black' : 'bg-white text-gray-300'}`}>
              <User className="h-8 w-8" />
            </div>
            <div>
              <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-1 ${profile?.tutorId ? 'text-gray-400' : 'text-gray-400'}`}>Assigned Tutor</p>
              <p className={`text-xl font-black uppercase italic tracking-tighter ${profile?.tutorId ? 'text-white' : 'text-gray-300'}`}>
                {profile?.tutorName || "Not Yet Assigned"}
              </p>
              {profile?.tutorId && (
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mt-1">Your work is reviewed exclusively by this tutor</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Stats & Data */}
        <div className="lg:col-span-8 space-y-12">
          <div className="flex items-end justify-between border-b border-gray-100 pb-8">
             <div className="space-y-2">
                <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Intelligence Brief</h3>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest italic">Official communications and academy metrics</p>
             </div>
             <Link href="/student/settings" className="px-10 h-16 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:bg-yellow-400 hover:text-black transition-all hover:scale-105 active:scale-95 group">
                Modifier Settings <ArrowRight className="h-4 w-4 group-hover:translate-x-1" />
             </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {ENROLLMENT_DETAILS.map((detail, i) => (
              <div key={detail.label} className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm flex items-center gap-6 hover:border-black transition-all duration-500 group">
                <div className={`w-16 h-16 rounded-[1.5rem] bg-gray-50 flex items-center justify-center ${detail.color} transition-all duration-500 group-hover:scale-110 group-hover:bg-black group-hover:text-white`}>
                  <detail.icon className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-1 leading-none">{detail.label}</p>
                  <p className="text-xl font-black text-black italic tracking-tighter uppercase leading-none mt-2">{detail.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-12 lg:p-14 rounded-[4.5rem] border border-gray-100 shadow-sm space-y-12 overflow-hidden relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
              <div className="space-y-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                   <Mail className="h-4 w-4 text-indigo-500" /> Endpoint Access
                </p>
                <p className="text-2xl font-black text-black italic tracking-tighter uppercase leading-none truncate">{profile?.email || "Syncing Data..."}</p>
              </div>
              <div className="space-y-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                   <Smartphone className="h-4 w-4 text-indigo-500" /> Comm Channel
                </p>
                <p className="text-2xl font-black text-black italic tracking-tighter uppercase leading-none">{profile?.phone || "Pending Sync"}</p>
              </div>
            </div>

            <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row gap-8 justify-between items-center relative z-10">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 bg-green-50 rounded-[1.8rem] flex items-center justify-center">
                    <ShieldCheck className="h-9 w-9 text-green-600" />
                 </div>
                 <div>
                    <h5 className="text-[14px] font-black uppercase tracking-tighter italic">Identity Lockdown Active</h5>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Profile verified across academy networks</p>
                 </div>
              </div>
              <div className="px-10 h-14 bg-black text-yellow-400 rounded-2xl shadow-xl flex items-center justify-center font-black text-[10px] uppercase tracking-widest italic group hover:scale-105 transition-all">
                 Level 1 Clearance
              </div>
            </div>
            
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />
          </div>
           
           <div className="space-y-10 pt-4">
              <h4 className="text-3xl font-black italic uppercase tracking-tighter leading-none ml-2">Training Timeline</h4>
              <div className="relative pl-16 space-y-16 py-4">
                <div className="absolute left-[1.7rem] top-0 bottom-0 w-[2px] bg-gray-100" />
                
                {[
                  { label: "Phase 3: Elite Mastery", title: "Certification Assessment", desc: "Status: Locked", done: false, color: "bg-yellow-400" },
                  { label: "Phase 2: Visual Logic", title: "Advanced Color Science", desc: "Status: Active", done: false, color: "bg-indigo-600" },
                  { label: "Phase 1: Story Logic", title: "Cinematic Narrative Strategy", desc: "Status: Archived", done: true, color: "bg-green-500" }
                ].map((m, i) => (
                  <div key={i} className={`relative group ${!m.done ? 'opacity-100' : 'opacity-40'} transition-opacity duration-700`}>
                    <div className={`absolute -left-[3.15rem] w-8 h-8 rounded-[1rem] ${m.color} shadow-xl border-4 border-white transition-all duration-500 group-hover:scale-150 active:scale-95 group-hover:rotate-45`} />
                    <div className="transition-all duration-700 group-hover:translate-x-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mb-2 leading-none">{m.label}</p>
                      <h5 className="text-2xl font-black text-black uppercase italic tracking-tighter leading-tight group-hover:text-indigo-600 transition-colors uppercase">{m.title}</h5>
                      <p className="text-[11px] text-gray-400 mt-2 font-black uppercase tracking-[0.1em]">{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

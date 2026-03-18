"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { motion, AnimatePresence } from "framer-motion"
import { 
  User, 
  Smartphone, 
  Mail, 
  FileEdit, 
  ChevronLeft, 
  Save, 
  CheckCircle,
  Video,
  Camera,
  Layers,
  Mic2,
  Briefcase,
  Monitor,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { studentService as sService } from "@/lib/services"

const AVATARS = [
  { id: "director", name: "The Director", icon: Video, desc: "Visionary Leader" },
  { id: "editor", name: "The Editor", icon: Layers, desc: "Rhythm & Story" },
  { id: "colorist", name: "The Colorist", icon: Camera, desc: "Luminance Master" },
  { id: "sound", name: "Sound Designer", icon: Mic2, desc: "Sonic Sculptor" },
  { id: "producer", name: "The Producer", icon: Briefcase, desc: "Strategy Lead" },
  { id: "vfx", name: "VFX Artist", icon: Monitor, desc: "Infinite Realities" }
]

export default function StudentSettings() {
  const { profile } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    bio: "",
    avatarId: ""
  })
  const [saving, setSaving] = useState(false)
  const [saveDone, setSaveDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Only populate the form if we have a profile and the form is currently empty
    // This prevents background syncs from wiping out what the user is currently typing
    if (profile && !formData.name && !formData.phone && !formData.avatarId) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        avatarId: profile.avatarId || ""
      })
    }
  }, [profile, formData.name, formData.phone, formData.avatarId])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile?.uid) return
    
    setSaving(true)
    setError(null)
    
    try {
      await sService.updateFullProfile(profile.uid, formData)
      setSaveDone(true)
      // Scroll to top to show success
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setTimeout(() => setSaveDone(false), 5000)
    } catch (err) {
      console.error("Identity Error:", err)
      setError("Failed to synchronize with the AGBA core ledger.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-12 pb-32 max-w-5xl mx-auto px-4 pt-4">
      {/* Dynamic Notification Bar */}
      <AnimatePresence>
        {saveDone && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-green-600 text-white p-6 rounded-[2rem] flex items-center justify-between shadow-2xl shadow-green-200"
          >
             <div className="flex items-center gap-4">
                <CheckCircle className="h-6 w-6" />
                <p className="font-black uppercase italic tracking-tighter text-sm">Identity Synchronized. Please refresh to see changes globally.</p>
             </div>
             <button onClick={() => window.location.reload()} className="bg-white text-green-600 px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                Hot Reload
             </button>
          </motion.div>
        )}
        {error && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="bg-red-600 text-white p-6 rounded-[2rem] flex items-center gap-4 shadow-2xl shadow-red-200"
          >
             <AlertCircle className="h-6 w-6" />
             <p className="font-black uppercase italic tracking-tighter text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <Link href="/student/profile" className="flex items-center gap-3 group text-gray-500 hover:text-black transition-colors">
          <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[11px] font-black uppercase tracking-[0.3em]">Operational Profile</span>
        </Link>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="h-16 px-12 bg-black text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-4 shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:bg-yellow-400 hover:text-black hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
        >
          {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="h-5 w-5" />}
          {saving ? "Transmitting..." : "Update Protocol"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Role Manifestation Selector */}
        <div className="lg:col-span-4 space-y-6">
           <div className="space-y-1 ml-4">
             <h3 className="text-2xl font-black italic uppercase tracking-tighter">Avatar Protocol</h3>
             <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Select your creative manifestation</p>
           </div>
           
           <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              {AVATARS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setFormData({...formData, avatarId: av.id})}
                  className={`p-8 rounded-[2.5rem] border-2 transition-all duration-500 flex items-center gap-6 relative group ${
                    formData.avatarId === av.id 
                    ? 'border-black bg-black text-white shadow-2xl translate-x-2' 
                    : 'border-gray-50 bg-white text-gray-400 hover:border-gray-200 hover:translate-x-1'
                  }`}
                >
                  <div className={`p-4 rounded-2xl ${formData.avatarId === av.id ? 'bg-yellow-400 text-black' : 'bg-gray-50 group-hover:bg-black group-hover:text-white transition-all duration-500'}`}>
                    <av.icon className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black uppercase tracking-tight leading-none">{av.name}</p>
                    <p className={`text-[8px] font-black uppercase tracking-widest mt-2 ${formData.avatarId === av.id ? 'text-gray-500' : 'text-gray-300'}`}>{av.desc}</p>
                  </div>
                  {formData.avatarId === av.id && (
                    <motion.div layoutId="av-indicator" className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-12 bg-yellow-400 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.5)]" />
                  )}
                </button>
              ))}
           </div>
        </div>

        {/* Identity Inputs */}
        <div className="lg:col-span-8 flex flex-col gap-10">
           <div className="bg-white p-12 lg:p-16 rounded-[4rem] border border-gray-100 shadow-sm space-y-12">
              <div className="space-y-2">
                 <h4 className="text-3xl font-black italic uppercase tracking-tighter">Core Definition</h4>
                 <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Update your official recognition data</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 flex items-center gap-2">
                     <User className="h-3 w-3" /> Full Artist Name
                   </label>
                   <input 
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full h-16 bg-gray-50/50 border-2 border-transparent px-8 rounded-2xl text-[12px] font-black uppercase transition-all focus:bg-white focus:border-black outline-none italic tracking-tighter"
                    />
                 </div>
                 <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-300 ml-4 flex items-center gap-2">
                     <Mail className="h-3 w-3" /> Email Channel (Locked)
                   </label>
                   <input 
                      type="email" 
                      value={profile?.email || ""}
                      readOnly
                      className="w-full h-16 bg-gray-50/30 border-2 border-transparent px-8 rounded-2xl text-[12px] font-black uppercase text-gray-300 cursor-not-allowed outline-none italic tracking-tighter"
                    />
                 </div>
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 flex items-center gap-2">
                   <Smartphone className="h-3 w-3" /> Operational Phone Number
                 </label>
                 <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="+234 000 000 000"
                    className="w-full h-16 bg-gray-50/50 border-2 border-transparent px-8 rounded-2xl text-[12px] font-black transition-all focus:bg-white focus:border-black outline-none italic tracking-tighter"
                  />
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 flex items-center gap-2">
                   <FileEdit className="h-3 w-3" /> Creative Manifesto (Bio)
                 </label>
                 <textarea 
                    value={formData.bio}
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                    rows={6}
                    placeholder="Declare your vision to the collective..."
                    className="w-full p-10 rounded-[3rem] bg-gray-50/50 border-2 border-transparent transition-all focus:bg-white focus:border-black outline-none text-[14px] font-medium leading-relaxed italic text-gray-600"
                  />
              </div>

              <div className="pt-8 border-t border-gray-50 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Security: Verified PID Profile</span>
                 </div>
                 <p className="text-[8px] font-black uppercase tracking-widest text-gray-300 italic">Last Updated: {profile?.updatedAt ? new Date(profile.updatedAt.seconds * 1000).toLocaleDateString() : 'Never'}</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

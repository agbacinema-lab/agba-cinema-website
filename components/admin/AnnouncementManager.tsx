"use client"

import { useState, useEffect } from "react"
import { adminService } from "@/lib/services"
import { Announcement } from "@/lib/types"
import { 
  Megaphone, 
  SwitchCamera, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  ArrowRight
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

export default function AnnouncementManager() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newAnn, setNewAnn] = useState<Partial<Announcement>>({
    title: "",
    content: "",
    priority: "medium",
    isActive: true
  })

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const loadAnnouncements = async () => {
    try {
      const data = await adminService.getAnnouncements()
      setAnnouncements(data)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await adminService.updateAnnouncement(id, { isActive: !current })
      setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, isActive: !current } : a))
      toast.success("Broadcast status updated.")
    } catch {
      toast.error("Failed to update status.")
    }
  }

  const handleCreate = async () => {
    if (!newAnn.title || !newAnn.content) {
      toast.error("Please fill in both title and content.")
      return
    }
    try {
      const id = await adminService.createAnnouncement(newAnn as any)
      setAnnouncements(prev => [{ id, ...newAnn, createdAt: new Date() } as any, ...prev])
      setShowAddForm(false)
      setNewAnn({ title: "", content: "", priority: "medium", isActive: true })
      toast.success("Broadcast live!")
    } catch {
      toast.error("Deployment failed.")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this broadcast forever?")) return
    try {
      await adminService.deleteAnnouncement(id)
      setAnnouncements(prev => prev.filter(a => a.id !== id))
      toast.success("Broadcast retracted.")
    } catch {
      toast.error("Failed to delete.")
    }
  }

  if (loading) return <div className="p-12 text-center text-gray-500 font-bold animate-pulse">Scanning frequencies...</div>

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-center">
        <div>
           <h2 className="text-3xl font-black italic uppercase tracking-tighter">Broadcast Hub</h2>
           <p className="text-gray-500 font-medium">Manage vital announcements across the ÀGBÀ CINEMA ecosystem.</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-black text-white rounded-2xl h-14 px-8 font-black uppercase italic tracking-tighter hover:bg-yellow-400 hover:text-black transition-all shadow-xl shadow-black/10"
        >
          {showAddForm ? "Cancel" : <><Plus className="h-5 w-5 mr-3" /> New Broadcast</>}
        </Button>
      </header>

      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
             <Card className="border-2 border-black rounded-[2.5rem] bg-gray-50/50 p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Title</label>
                         <Input 
                            placeholder="GO PRO COHORT 04 NOW ENROLLING" 
                            value={newAnn.title} 
                            onChange={e => setNewAnn({ ...newAnn, title: e.target.value })} 
                            className="h-14 rounded-xl font-bold bg-white"
                         />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Content</label>
                        <textarea 
                           placeholder="8 Weeks of pure cinematic mastery. Limited slots." 
                           value={newAnn.content} 
                           onChange={e => setNewAnn({ ...newAnn, content: e.target.value })} 
                           className="w-full h-32 rounded-xl border border-gray-100 p-4 font-medium bg-white focus:border-black transition-all outline-none"
                        />
                      </div>
                   </div>
                   <div className="space-y-6">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Priority Stream</label>
                        <div className="flex gap-4">
                           {['low', 'medium', 'high'].map(p => (
                             <button 
                                key={p} 
                                onClick={() => setNewAnn({ ...newAnn, priority: p as any })}
                                className={`px-6 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${newAnn.priority === p ? 'bg-black text-white' : 'bg-white text-gray-400 hover:border-black'}`}
                             >
                               {p}
                             </button>
                           ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Redirect Link (Optional)</label>
                         <Input 
                            placeholder="https://agba-cinema.com/academy" 
                            value={newAnn.link} 
                            onChange={e => setNewAnn({ ...newAnn, link: e.target.value })} 
                            className="h-14 rounded-xl font-medium bg-white"
                         />
                      </div>
                      <Button onClick={handleCreate} className="w-full h-16 bg-yellow-400 text-black rounded-2xl font-black uppercase italic tracking-tighter text-lg shadow-lg shadow-yellow-400/20">
                         Initiate Broadcast <ArrowRight className="h-5 w-5 ml-4" />
                      </Button>
                   </div>
                </div>
             </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
         {announcements.length === 0 ? (
           <div className="bg-white p-20 rounded-[3rem] border border-dashed border-gray-200 text-center">
              <Megaphone className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <p className="text-sm font-black uppercase tracking-widest text-gray-400">The frequency is silent.</p>
           </div>
         ) : (
           announcements.map(a => (
             <Card key={a.id} className={`group bg-white p-8 rounded-[2rem] border-none shadow-premium hover:shadow-2xl transition-all duration-500 ${!a.isActive && 'opacity-60 grayscale'}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                   <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${a.isActive ? 'bg-yellow-400 text-black' : 'bg-gray-100 text-gray-400'}`}>
                         <Megaphone className="h-6 w-6" />
                      </div>
                      <div>
                         <div className="flex items-center gap-3 mb-1">
                            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                               a.priority === 'high' ? 'bg-red-50 text-red-600 border-red-100' : 
                               a.priority === 'medium' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                            }`}>
                               {a.priority}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">
                               Deployed {new Date(a.createdAt?.toMillis() || Date.now()).toLocaleDateString()}
                            </span>
                         </div>
                         <h4 className="text-xl font-black italic uppercase tracking-tight">{a.title}</h4>
                         <p className="text-gray-400 font-medium text-sm mt-1">{a.content}</p>
                      </div>
                   </div>

                   <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3 bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100">
                         <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Broadcast Active</span>
                         <Switch checked={a.isActive} onCheckedChange={() => handleToggle(a.id, a.isActive)} />
                      </div>
                      <button onClick={() => handleDelete(a.id)} className="w-12 h-12 rounded-xl bg-gray-50 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center">
                         <Trash2 className="h-5 w-5" />
                      </button>
                   </div>
                </div>
             </Card>
           ))
         )}
      </div>
    </div>
  )
}

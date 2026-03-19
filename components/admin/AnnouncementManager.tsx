"use client"

import { useState, useEffect } from "react"
import { adminService, notificationService } from "@/lib/services"
import { Announcement } from "@/lib/types"
import { 
  Megaphone, 
  SwitchCamera, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  ArrowRight,
  Edit2
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
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null)
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
      
      // Send global notification
      await notificationService.sendNotification({
        recipientId: "all",
        title: "New Broadcast Received",
        message: newAnn.title || "A new announcement has been posted system-wide.",
        type: "announcement"
      })

      setAnnouncements(prev => [{ id, ...newAnn, createdAt: new Date() } as any, ...prev])
      setShowAddForm(false)
      setNewAnn({ title: "", content: "", priority: "medium", isActive: true })
      toast.success("Broadcast live!")
    } catch {
      toast.error("Deployment failed.")
    }
  }

  const handleUpdate = async () => {
    if (!editingAnn?.id || !editingAnn.title || !editingAnn.content) {
      toast.error("Please fill in both title and content.")
      return
    }
    try {
      const { id, ...updateData } = editingAnn
      await adminService.updateAnnouncement(id, updateData)
      setAnnouncements(prev => prev.map(a => a.id === id ? editingAnn : a))
      setEditingAnn(null)
      toast.success("Broadcast updated!")
    } catch {
      toast.error("Update failed.")
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
           <h2 className="text-3xl font-black italic uppercase tracking-tighter text-foreground">Broadcast Hub</h2>
           <p className="text-muted-foreground font-medium">Manage vital announcements across the ÀGBÀ CINEMA ecosystem.</p>
        </div>
        <Button 
          onClick={() => {
            setShowAddForm(!showAddForm)
            setEditingAnn(null)
          }}
          className="bg-black text-white rounded-2xl h-14 px-8 font-black uppercase italic tracking-tighter hover:bg-yellow-400 hover:text-black transition-all shadow-xl shadow-black/10"
        >
          {showAddForm ? "Cancel" : <><Plus className="h-5 w-5 mr-3" /> New Broadcast</>}
        </Button>
      </header>

      <AnimatePresence>
        {(showAddForm || editingAnn) && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
             <Card className="border border-muted rounded-[2.5rem] bg-card p-10 transition-colors">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black italic uppercase tracking-tighter text-foreground">
                    {editingAnn ? "Edit Broadcast" : "New Broadcast"}
                  </h3>
                  {editingAnn && (
                    <Button variant="ghost" onClick={() => setEditingAnn(null)} className="h-10 px-4 font-bold text-muted-foreground hover:text-foreground">Cancel Edit</Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Title</label>
                         <Input 
                            placeholder="GO PRO COHORT 04 NOW ENROLLING" 
                            value={editingAnn ? editingAnn.title : newAnn.title} 
                            onChange={e => editingAnn ? setEditingAnn({...editingAnn, title: e.target.value}) : setNewAnn({ ...newAnn, title: e.target.value })} 
                            className="h-14 rounded-xl font-bold bg-background text-foreground border-muted"
                         />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Content</label>
                        <textarea 
                           placeholder="8 Weeks of pure cinematic mastery. Limited slots." 
                           value={editingAnn ? editingAnn.content : newAnn.content} 
                           onChange={e => editingAnn ? setEditingAnn({...editingAnn, content: e.target.value}) : setNewAnn({ ...newAnn, content: e.target.value })} 
                           className="w-full h-32 rounded-xl border border-muted p-4 font-medium bg-background text-foreground focus:border-yellow-400 transition-all outline-none"
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
                                 onClick={() => editingAnn ? setEditingAnn({...editingAnn, priority: p as any}) : setNewAnn({ ...newAnn, priority: p as any })}
                                 className={`px-6 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                                   (editingAnn ? editingAnn.priority : newAnn.priority) === p ? 'bg-foreground text-background shadow-lg' : 'bg-muted text-muted-foreground border-muted hover:border-foreground'
                                 }`}
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
                            value={editingAnn ? editingAnn.link : newAnn.link} 
                            onChange={e => editingAnn ? setEditingAnn({...editingAnn, link: e.target.value}) : setNewAnn({ ...newAnn, link: e.target.value })} 
                            className="h-14 rounded-xl font-medium bg-background text-foreground border-muted"
                         />
                      </div>
                      <Button onClick={editingAnn ? handleUpdate : handleCreate} className="w-full h-16 bg-yellow-400 text-black rounded-2xl font-black uppercase italic tracking-tighter text-lg shadow-lg shadow-yellow-400/20">
                         {editingAnn ? "Save Changes" : "Initiate Broadcast"} <ArrowRight className="h-5 w-5 ml-4" />
                      </Button>
                   </div>
                </div>
             </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
         {announcements.length === 0 ? (
           <div className="bg-card p-20 rounded-[3rem] border border-dashed border-muted text-center">
              <Megaphone className="h-12 w-12 text-muted mx-auto mb-4" />
              <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">The frequency is silent.</p>
           </div>
         ) : (
           announcements.map(a => (
             <Card key={a.id} className={`group bg-card p-8 rounded-[2rem] border-none shadow-premium hover:shadow-2xl transition-all duration-500 ${!a.isActive && 'opacity-60 grayscale'}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                   <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${a.isActive ? 'bg-yellow-400 text-black' : 'bg-muted text-muted-foreground'}`}>
                         <Megaphone className="h-6 w-6" />
                      </div>
                       <div>
                          <div className="flex items-center gap-3 mb-1">
                             <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                                a.priority === 'high' ? 'bg-red-50 dark:bg-red-950/30 text-red-600 border-red-100 dark:border-red-900/30' : 
                                a.priority === 'medium' ? 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 border-yellow-100 dark:border-yellow-900/30' : 
                                'bg-blue-50 dark:bg-blue-950/30 text-blue-600 border-blue-100 dark:border-blue-900/30'
                             }`}>
                                {a.priority}
                             </span>
                             <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                Deployed {new Date(a.createdAt?.toMillis() || Date.now()).toLocaleDateString()}
                             </span>
                          </div>
                          <h4 className="text-xl font-black italic uppercase tracking-tight text-foreground">{a.title}</h4>
                          <p className="text-muted-foreground font-medium text-sm mt-1">{a.content}</p>
                       </div>
                    </div>
 
                     <div className="flex items-center gap-4">
                        <button onClick={() => {
                          setEditingAnn(a)
                          setShowAddForm(false)
                          window.scrollTo({ top: 0, behavior: "smooth" })
                        }} className="w-12 h-12 rounded-xl bg-muted/50 text-muted-foreground hover:bg-black hover:text-white transition-all flex items-center justify-center">
                           <Edit2 className="h-5 w-5" />
                        </button>
                        <div className="flex items-center gap-3 bg-muted/30 px-5 py-3 rounded-2xl border border-muted">
                           <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Broadcast Active</span>
                           <Switch checked={a.isActive} onCheckedChange={() => handleToggle(a.id, a.isActive)} />
                        </div>
                        <button onClick={() => handleDelete(a.id)} className="w-12 h-12 rounded-xl bg-muted/50 text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center">
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

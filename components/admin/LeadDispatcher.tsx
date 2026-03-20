"use client"

import { useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Mail, Save, Link as LinkIcon, Send } from "lucide-react"

export default function LeadDispatcher() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState({
    subject: "Your Program Blueprint is Here! 🎬",
    message: "Hi there!\n\nThank you for requesting the Program Blueprint. This guide will show you exactly how to go from beginner to pro in 8 weeks.\n\nYou can watch the training video and download the breakdown using the link below:",
    link: "https://your-video-link.com",
    buttonText: "Watch Free Training"
  })

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, "siteSettings", "leadMagnet"))
        if (snap.exists()) setData(snap.data() as any)
      } catch (e) {
        toast.error("Failed to load dispatcher settings")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const saveSettings = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, "siteSettings", "leadMagnet"), {
        ...data,
        updatedAt: new Date().toISOString()
      })
      toast.success("Lead Dispatcher synchronized successfully!")
    } catch (e) {
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-20 text-center font-black animate-pulse">Initializing Dispatcher Protocols...</div>

  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-20">
      <div className="text-left">
        <h3 className="text-3xl font-black tracking-tighter mb-2">Lead Magnet Dispatcher</h3>
        <p className="text-muted-foreground text-sm font-medium">Control the automated response sent to everyone who requests the Blueprint.</p>
      </div>

      <div className="bg-card border border-muted shadow-premium rounded-[2.5rem] p-10 space-y-8">
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Email Subject Line</label>
          <div className="relative">
            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500" />
            <Input 
              value={data.subject}
              onChange={e => setData({...data, subject: e.target.value})}
              className="h-16 pl-16 rounded-2xl bg-muted/20 border-muted font-black tracking-tight focus:bg-card transition-all"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Email Message Body</label>
          <Textarea 
            value={data.message}
            onChange={e => setData({...data, message: e.target.value})}
            className="min-h-[200px] p-8 rounded-[2rem] bg-muted/20 border-muted font-medium leading-relaxed focus:bg-card transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Blueprint / Video Link</label>
            <div className="relative">
              <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500" />
              <Input 
                value={data.link}
                onChange={e => setData({...data, link: e.target.value})}
                placeholder="https://..."
                className="h-16 pl-16 rounded-2xl bg-muted/20 border-muted font-black tracking-tight focus:bg-card transition-all"
              />
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Button Call-to-Action</label>
            <div className="relative">
              <Send className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500" />
              <Input 
                value={data.buttonText}
                onChange={e => setData({...data, buttonText: e.target.value})}
                className="h-16 pl-16 rounded-2xl bg-muted/20 border-muted font-black tracking-tight focus:bg-card transition-all"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-muted/30">
          <Button 
            onClick={saveSettings} 
            disabled={saving}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-black h-16 rounded-2xl shadow-xl shadow-yellow-400/20 text-lg transition-all active:scale-[0.98]"
          >
            {saving ? "Deploying..." : "Activate Dispatcher Settings"}
            <Save className="ml-3 h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  )
}

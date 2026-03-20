"use client"

import { useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Clock, Users, Flame, Save, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"

export default function UrgencyManager() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState({
    cohortTitle: "April 2026 Mentorship Cohort",
    deadlineDate: "2026-04-30T23:59:59",
    slotsLeft: 2,
    totalSlots: 10,
    applicationsCount: 147,
    applicationsTrend: "43%"
  })

  useEffect(() => {
    loadUrgencyData()
  }, [])

  const loadUrgencyData = async () => {
    setLoading(true)
    try {
      const docRef = doc(db, "siteSettings", "urgency")
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        setData(docSnap.data() as any)
      }
    } catch (error) {
      console.error("Error loading urgency data:", error)
      toast.error("Failed to sync with Urgency Hub")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, "siteSettings", "urgency"), {
        ...data,
        updatedAt: serverTimestamp()
      })
      toast.success("Intelligence Updated", {
        description: "Homepage urgency signals have been synchronized."
      })
    } catch (error) {
      console.error("Error saving urgency data:", error)
      toast.error("Uplink failed")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <RefreshCw className="h-8 w-8 animate-spin text-yellow-400" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-3xl font-black italic uppercase tracking-tighter text-foreground">Urgency Center</h3>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground mt-2 opacity-60">Control homepage scarcity signals</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="h-16 px-10 rounded-2xl bg-yellow-400 text-black hover:bg-yellow-500 font-black uppercase text-xs tracking-widest shadow-xl transition-all"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Deploy Updates
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Text & Timing */}
        <Card className="bg-card border-muted rounded-[2.5rem] p-8 shadow-2xl">
          <CardHeader className="p-0 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
                 <Clock className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg font-black uppercase tracking-tight italic">Timing & Objectives</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Cohort Objective (Title)</Label>
              <Input 
                value={data.cohortTitle}
                onChange={(e) => setData({ ...data, cohortTitle: e.target.value })}
                placeholder="e.g. April 2026 Mentorship Cohort"
                className="h-14 rounded-xl bg-muted/20 border-muted font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Mission Deadline (ISO Format: YYYY-MM-DDTHH:MM:SS)</Label>
              <Input 
                value={data.deadlineDate}
                onChange={(e) => setData({ ...data, deadlineDate: e.target.value })}
                placeholder="2026-04-30T23:59:59"
                className="h-14 rounded-xl bg-muted/20 border-muted font-bold"
              />
              <p className="text-[9px] text-muted-foreground italic mt-1 font-medium ml-2">* Must follow YYYY-MM-DDTHH:MM:SS for valid calculations.</p>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Scarcity Stats */}
        <Card className="bg-card border-muted rounded-[2.5rem] p-8 shadow-2xl">
          <CardHeader className="p-0 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl">
                 <Users className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg font-black uppercase tracking-tight italic">Scarcity Analytics</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Slots Remaining</Label>
                <Input 
                  type="number"
                  value={data.slotsLeft}
                  onChange={(e) => setData({ ...data, slotsLeft: parseInt(e.target.value) })}
                  className="h-14 rounded-xl bg-muted/20 border-muted font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Total Capacity</Label>
                <Input 
                  type="number"
                  value={data.totalSlots}
                  onChange={(e) => setData({ ...data, totalSlots: parseInt(e.target.value) })}
                  className="h-14 rounded-xl bg-muted/20 border-muted font-bold"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Applications Recieved</Label>
                <Input 
                  type="number"
                  value={data.applicationsCount}
                  onChange={(e) => setData({ ...data, applicationsCount: parseInt(e.target.value) })}
                  className="h-14 rounded-xl bg-muted/20 border-muted font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Trend Percentage</Label>
                <Input 
                  value={data.applicationsTrend}
                  onChange={(e) => setData({ ...data, applicationsTrend: e.target.value })}
                  placeholder="e.g. 43%"
                  className="h-14 rounded-xl bg-muted/20 border-muted font-bold"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      <div className="p-10 bg-black rounded-[3rem] border border-white/5 space-y-6">
         <div className="flex items-center gap-2 text-yellow-500 mb-4">
            <Flame className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Live Signal Preview</span>
         </div>
         <div className="space-y-2">
            <h4 className="text-white font-black text-2xl italic uppercase tracking-tighter">{data.cohortTitle}</h4>
            <p className="text-gray-400 text-xs italic">
               Enrollment closes: {new Date(data.deadlineDate).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
         </div>
         <div className="flex items-center gap-6">
            <div className="px-4 py-2 bg-yellow-400/10 border border-yellow-400/20 rounded-full text-[10px] font-black uppercase text-yellow-400">
               {data.slotsLeft} Spots left
            </div>
            <div className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
               {data.applicationsCount} Transmissions handled this week
            </div>
         </div>
      </div>
    </div>
  )
}

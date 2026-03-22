"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { classSchedulerService, adminService, LiveClassSession } from "@/lib/services"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, Video, Plus, X, Users, User } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

export default function LiveTimetableManager() {
  const { profile } = useAuth()
  const [classes, setClasses] = useState<LiveClassSession[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  // Scheduling Form
  const [topic, setTopic] = useState("")
  const [programType, setProgramType] = useState<'gopro' | 'mentorship'>('mentorship')
  const [targetAudience, setTargetAudience] = useState<'individual' | 'cohort'>('individual')
  const [targetId, setTargetId] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [duration, setDuration] = useState("60")
  const [meetLink, setMeetLink] = useState("https://meet.google.com/new")

  const cohorts = ["Cohort 3"] // Hardcoded for now based on current logic

  useEffect(() => {
    loadData()
  }, [profile?.uid])

  const loadData = async () => {
    setLoading(true)
    try {
      if (profile?.uid) {
        const [classData, studentData] = await Promise.all([
          classSchedulerService.getClassesByTutor(profile.uid),
          adminService.getAllUsers() // Get all users to find students assigned to this tutor
        ])
        setClasses(classData)
        // Filter to only show students who are assigned to this tutor
        const assignedStudents = studentData.filter(u => 
          u.role === 'student' && 
          (
            u.tutorId === profile.uid || 
            Object.values((u as any).assignedTutors || {}).some((a: any) => a.tutorId === profile.uid)
          )
        )
        setStudents(assignedStudents)
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to load timetable")
    } finally {
      setLoading(false)
    }
  }

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    if (!topic || !targetId || !date || !time) {
      toast.error("Please fill all required fields")
      return
    }

    const t = toast.loading("Deploying session and transmitting invites...")

    try {
      const startDateTime = `${date}T${time}`
      let targetName = ""
      let studentEmail = ""
      let cohortEmails: string[] = []

      if (targetAudience === 'individual') {
        const student = students.find(s => s.uid === targetId || s.id === targetId)
        targetName = student?.name || "Student"
        studentEmail = student?.email || ""
      } else {
        targetName = targetId // Cohort name
        // Get all student emails in this cohort from our full list (we need another fetch or use state)
        const allUsers = await adminService.getAllUsers();
        cohortEmails = allUsers
          .filter(u => u.role === 'student' && (u as any).cohort === targetId)
          .map(u => u.email)
          .filter(Boolean)
      }

      // 1. Call Google Calendar API
      const calendarRes = await fetch("/api/calendar/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          durationMinutes: parseInt(duration),
          startDateTime,
          tutorId: profile.uid,
          studentEmail,
          cohortEmails
        })
      })

      const calendarData = await calendarRes.json().catch(() => ({ error: "Protocol malformed" }))

      if (!calendarRes.ok) {
        throw new Error(calendarData.error || "Google Calendar uplink failed")
      }

      const generatedMeetLink = calendarData.meetLink

      // 2. Save to Firestore
      await classSchedulerService.scheduleClass({
        topic,
        tutorId: profile.uid,
        tutorName: profile.name,
        targetAudience,
        targetId,
        targetName,
        programType,
        startTime: new Date(startDateTime),
        durationMinutes: parseInt(duration),
        meetLink: generatedMeetLink || meetLink || "https://meet.google.com/new",
        status: 'scheduled'
      })

      toast.success("Live Class Scheduled and invites dispatched!", { id: t })
      setShowForm(false)
      loadData()
      
      // Reset
      setTopic("")
      setTargetId("")
    } catch (err: any) {
      console.error(err)
      toast.error("Protocol failure: " + err.message, { id: t })
    }
  }

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400"></div>
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic">Live Timetable</h2>
          <p className="text-muted-foreground font-medium mt-1">Manage your Google Meet scheduling.</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-yellow-400 text-black font-black h-12 rounded-2xl hover:bg-yellow-500">
          <Plus className="h-4 w-4 mr-2" /> Schedule Class
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Card className="border-yellow-400 bg-black text-white p-8 rounded-[2rem] shadow-2xl relative">
              <button onClick={() => setShowForm(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white">
                <X className="h-6 w-6" />
              </button>
              
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-6 text-yellow-400">New Session</h3>
              
              <form onSubmit={handleSchedule} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Class Info */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Class Topic</label>
                    <Input value={topic} onChange={e => setTopic(e.target.value)} className="bg-white/5 border-white/10 text-white h-12 rounded-xl" placeholder="e.g. Intro to Cinematography" required />
                  </div>

                  {/* Program Type */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Format</label>
                    <div className="flex gap-2">
                      <Button type="button" onClick={() => { setProgramType('mentorship'); setTargetAudience('individual'); setTargetId("") }} className={`flex-1 h-12 rounded-xl ${programType === 'mentorship' ? 'bg-yellow-400 text-black' : 'bg-white/5 text-white'}`}>
                        <User className="h-4 w-4 mr-2" /> 1-on-1 Mentorship
                      </Button>
                      <Button type="button" onClick={() => { setProgramType('gopro'); setTargetAudience('cohort'); setTargetId("") }} className={`flex-1 h-12 rounded-xl ${programType === 'gopro' ? 'bg-yellow-400 text-black' : 'bg-white/5 text-white'}`}>
                        <Users className="h-4 w-4 mr-2" /> Go Pro Cohort
                      </Button>
                    </div>
                  </div>

                  {/* Target Audience Selector */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Select {targetAudience === 'individual' ? 'Student' : 'Cohort'}</label>
                    <select 
                      className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white outline-none" 
                      value={targetId} 
                      onChange={e => setTargetId(e.target.value)} 
                      required
                    >
                      <option value="" disabled className="text-black">Choose...</option>
                      {targetAudience === 'individual' ? (
                        students.map(s => <option key={s.uid || s.id} value={s.uid || s.id} className="text-black">{s.fullName} ({s.email})</option>)
                      ) : (
                        cohorts.map(c => <option key={c} value={c} className="text-black">{c}</option>)
                      )}
                    </select>
                  </div>

                  {/* Duration & Meet */}
                  <div className="space-y-2 grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Duration (mins)</label>
                      <Input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="bg-white/5 border-white/10 text-white h-12 rounded-xl" required />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Meet Link (Phase 1)</label>
                      <Input value={meetLink} onChange={e => setMeetLink(e.target.value)} className="bg-white/5 border-white/10 text-white h-12 rounded-xl" placeholder="https://meet.google.com/..." required />
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="space-y-2 grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Date</label>
                      <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-white/5 border-white/10 text-white h-12 rounded-xl" required />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Time</label>
                      <Input type="time" value={time} onChange={e => setTime(e.target.value)} className="bg-white/5 border-white/10 text-white h-12 rounded-xl" required />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-yellow-400 text-black font-black h-14 rounded-2xl hover:bg-yellow-500">
                  Generate Class & Send Invites
                </Button>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.length === 0 ? (
          <div className="col-span-full border-2 border-dashed border-gray-200 rounded-[2rem] p-12 text-center">
            <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-4" />
            <p className="font-black uppercase tracking-widest text-gray-400">No classes scheduled yet.</p>
          </div>
        ) : (
          classes.map(c => (
            <Card key={c.id} className="border border-muted rounded-[2rem] p-6 hover:shadow-lg transition-all bg-card flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg ${c.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {c.status}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{c.programType}</span>
                </div>
                <h4 className="font-black text-xl italic uppercase tracking-tighter mb-1 line-clamp-2">{c.topic}</h4>
                <p className="text-sm font-medium text-gray-500 mb-4">{c.targetAudience === 'individual' ? 'Student' : 'Batch'}: <span className="text-gray-900 font-bold">{c.targetName}</span></p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                    <Calendar className="h-4 w-4 text-yellow-500" />
                    {c.startTime ? new Date(c.startTime.seconds ? c.startTime.seconds * 1000 : c.startTime).toLocaleDateString() : "TBD"}
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    {c.startTime ? new Date(c.startTime.seconds ? c.startTime.seconds * 1000 : c.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "TBD"} ({c.durationMinutes}m)
                  </div>
                </div>
              </div>
              
              <a href={c.meetLink} target="_blank" rel="noopener noreferrer" className="w-full bg-[#EA4335]/10 text-[#EA4335] hover:bg-[#EA4335]/20 h-12 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-colors">
                <Video className="h-4 w-4" /> Open Google Meet
              </a>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

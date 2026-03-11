"use client"

import { useState, useEffect } from "react"
import { lmsService } from "@/lib/services"
import { useAuth } from "@/context/AuthContext"
import { Assignment, Submission, Subject } from "@/lib/types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookOpen, Youtube, UploadCloud, CheckCircle, Clock, AlertTriangle } from "lucide-react"

export default function StudentLMS() {
  const { profile } = useAuth()
  const [activeSubject, setActiveSubject] = useState<Subject>('Video Editing')
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  // Submission State
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  const [driveLink, setDriveLink] = useState("")

  useEffect(() => {
    if (profile?.uid) {
      fetchData()
    }
  }, [activeSubject, profile?.uid])

  const fetchData = async () => {
    setLoading(true)
    const [assigns, subs] = await Promise.all([
      lmsService.getAssignments(activeSubject),
      lmsService.getSubmissionsByStudent(profile?.uid || "")
    ])
    setAssignments(assigns as Assignment[])
    setSubmissions(subs as Submission[])
    setLoading(false)
  }

  const handleSubmit = async (assignmentId: string) => {
    if (!profile) return
    await lmsService.submitAssignment({
      assignmentId,
      studentId: (profile as any)?.studentId || profile.uid,
      studentUID: profile.uid,
      driveLink,
    })
    setSubmittingId(null)
    setDriveLink("")
    fetchData()
  }

  // Helper to find submission for an assignment
  const getSubForAssignment = (id: string) => submissions.find(s => s.assignmentId === id)

  return (
    <Card className="border-none shadow-premium rounded-[2.5rem] bg-white p-8">
      <CardHeader className="p-0 mb-8">
        <CardTitle className="flex items-center gap-3 text-2xl font-black">
          <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-black" />
          </div>
          My Training Portal
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        
        {/* Subject Nav */}
        <div className="flex gap-2 overflow-x-auto pb-6 mb-4 border-b border-gray-100">
          {(['Video Editing', 'Motion Design', 'Script Writing', 'Storytelling', 'Business of Creativity'] as Subject[]).map(sub => (
            <button
              key={sub}
              onClick={() => setActiveSubject(sub)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap text-xs font-black uppercase tracking-widest transition-all ${
                activeSubject === sub ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="text-center p-12 text-gray-400 font-bold animate-pulse">Loading curriculum...</div>
          ) : assignments.length === 0 ? (
            <div className="text-center p-12 border-2 border-dashed border-gray-100 rounded-3xl">
              <Youtube className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-bold">No classes uploaded for {activeSubject} yet.</p>
            </div>
          ) : (
            assignments.map((a, i) => {
              const sub = getSubForAssignment(a.id)
              const isLocked = !a.isOpen && !sub
              
              return (
                <div key={a.id} className={`p-6 rounded-3xl border transition-all ${isLocked ? 'bg-gray-50 border-gray-100 opacity-70' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-2 inline-block">Stage {assignments.length - i}</span>
                      <h3 className="text-xl font-black text-gray-900">{a.title}</h3>
                    </div>
                    
                    {/* Status Badge */}
                    {sub ? (
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${
                        sub.status === 'approved' ? 'bg-green-100 text-green-700' :
                        sub.status === 'redo' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {sub.status === 'approved' && <CheckCircle className="h-3 w-3" />}
                        {sub.status === 'redo' && <AlertTriangle className="h-3 w-3" />}
                        {sub.status === 'pending' && <Clock className="h-3 w-3" />}
                        {sub.status}
                      </span>
                    ) : (
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        a.isOpen ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {a.isOpen ? 'Unsubmitted' : 'Locked'}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-6">{a.description}</p>

                  {/* ACTION AREA */}
                  {!sub && a.isOpen && submittingId !== a.id && (
                    <Button onClick={() => setSubmittingId(a.id)} className="w-full bg-black text-white hover:bg-gray-800 h-14 rounded-xl font-bold">
                      <UploadCloud className="h-5 w-5 mr-2" /> Submit Drive Link
                    </Button>
                  )}

                  {!sub && a.isOpen && submittingId === a.id && (
                    <div className="flex gap-2">
                       <Input 
                        placeholder="Paste your Google Drive link here..." 
                        value={driveLink} 
                        onChange={e => setDriveLink(e.target.value)}
                        className="flex-1 h-14 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 ring-indigo-500/20"
                      />
                      <Button onClick={() => handleSubmit(a.id)} disabled={!driveLink.includes('http')} className="bg-indigo-600 hover:bg-indigo-700 text-white h-14 px-8 rounded-xl font-bold">
                        Submit
                      </Button>
                      <Button onClick={() => setSubmittingId(null)} variant="outline" className="h-14 px-4 rounded-xl font-bold bg-white text-gray-400 hover:text-gray-600">
                        Cancel
                      </Button>
                    </div>
                  )}

                  {sub?.status === 'redo' && (
                    <div className="bg-red-50 p-4 rounded-2xl border border-red-100 mt-4">
                      <p className="text-xs font-black uppercase tracking-widest text-red-600 mb-1">Tutor Feedback</p>
                      <p className="text-sm text-red-900 mb-4">{sub.tutorComment}</p>
                      
                      <div className="flex gap-2">
                         <Input 
                          placeholder="Paste new Drive link for redo..." 
                          value={driveLink} 
                          onChange={e => setDriveLink(e.target.value)}
                          className="flex-1 h-12 rounded-xl bg-white border-red-200 focus:ring-red-500 text-sm"
                        />
                        <Button onClick={() => handleSubmit(a.id)} disabled={!driveLink.includes('http')} className="bg-red-600 hover:bg-red-700 text-white h-12 px-6 rounded-xl font-bold text-xs">
                          Resubmit
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {sub?.status === 'approved' && sub.tutorComment && (
                    <div className="bg-green-50 p-4 rounded-2xl border border-green-100 mt-4">
                      <p className="text-xs font-black uppercase tracking-widest text-green-600 mb-1">Tutor Feedback</p>
                      <p className="text-sm text-green-900">{sub.tutorComment}</p>
                    </div>
                  )}

                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}

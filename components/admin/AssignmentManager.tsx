"use client"

import { useState, useEffect } from "react"
import { lmsService } from "@/lib/services"
import { useAuth } from "@/context/AuthContext"
import { Assignment, Submission, Subject } from "@/lib/types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, Link as LinkIcon, CheckCircle, XCircle, Clock } from "lucide-react"

const SUBJECTS: Subject[] = ['Video Editing', 'Motion Design', 'Script Writing', 'Storytelling', 'Business of Creativity']

export default function AssignmentManager() {
  const { profile } = useAuth()
  const [activeSubject, setActiveSubject] = useState<Subject>('Video Editing')
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  // New Assignment State
  const [isCreating, setIsCreating] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDesc, setNewDesc] = useState("")

  // Submissions State
  const [viewingAssignment, setViewingAssignment] = useState<string | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [gradeComment, setGradeComment] = useState("")

  useEffect(() => {
    fetchAssignments()
  }, [activeSubject])

  const fetchAssignments = async () => {
    setLoading(true)
    const data = await lmsService.getAssignments(activeSubject)
    setAssignments(data as Assignment[])
    setLoading(false)
  }

  const handleCreateAssignment = async () => {
    if (!profile) return
    const nextStage = assignments.length + 1
    await lmsService.createAssignment({
      title: newTitle,
      description: newDesc,
      subject: activeSubject,
      tutorId: profile.uid,
      stageNumber: nextStage,
      isOpen: true
    })
    setIsCreating(false)
    setNewTitle("")
    setNewDesc("")
    fetchAssignments()
  }

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    await lmsService.toggleAssignmentStatus(id, !currentStatus)
    fetchAssignments()
  }

  const viewSubmissions = async (assignmentId: string) => {
    setViewingAssignment(assignmentId)
    const data = await lmsService.getSubmissionsByAssignment(assignmentId)
    setSubmissions(data as Submission[])
  }

  const gradeSubmission = async (subId: string, status: 'approved' | 'redo') => {
    await lmsService.gradeSubmission(subId, status, undefined, gradeComment)
    setGradeComment("")
    // Refresh submissions
    if (viewingAssignment) viewSubmissions(viewingAssignment)
  }

  return (
    <div className="space-y-6">
      {/* Subject Selector */}
      <div className="flex gap-2 overflow-x-auto pb-4">
        {SUBJECTS.map(sub => (
          <button
            key={sub}
            onClick={() => { setActiveSubject(sub); setViewingAssignment(null); }}
            className={`px-4 py-2 rounded-xl whitespace-nowrap text-xs font-black uppercase tracking-widest transition-all ${
              activeSubject === sub ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Col: Assignments List */}
        <Card className="border-none shadow-premium rounded-[2.5rem] bg-white p-8">
          <CardHeader className="p-0 mb-8 flex flex-row justify-between items-center">
            <CardTitle className="flex items-center gap-3 text-2xl font-black">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-indigo-600" />
              </div>
              Curriculum Stages
            </CardTitle>
            <Button onClick={() => setIsCreating(!isCreating)} variant="outline" className="rounded-xl h-10 font-bold">
              {isCreating ? "Cancel" : "+ New Stage"}
            </Button>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            
            {isCreating && (
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-6 space-y-4">
                <Input placeholder="Assignment Title (e.g. Stage 1: The Basics)" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="bg-white border-none rounded-xl h-12" />
                <Textarea placeholder="Instructions/Requirements..." value={newDesc} onChange={e => setNewDesc(e.target.value)} className="bg-white border-none rounded-xl min-h-[100px]" />
                <Button onClick={handleCreateAssignment} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 rounded-xl">Create Assignment</Button>
              </div>
            )}

            {loading ? (
              <div className="text-center text-gray-400 py-8 animate-pulse font-bold">Loading curriculum...</div>
            ) : assignments.length === 0 ? (
              <div className="text-center text-gray-400 py-8">No assignments created for {activeSubject} yet.</div>
            ) : (
              assignments.map((a, i) => (
                <div key={a.id} className={`p-5 rounded-2xl transition-all cursor-pointer border ${viewingAssignment === a.id ? 'border-indigo-400 bg-indigo-50/30' : 'border-gray-100 bg-white hover:border-gray-300'}`} onClick={() => viewSubmissions(a.id)}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-black text-lg text-gray-900">Stage {assignments.length - i}: {a.title}</h4>
                    <button onClick={(e) => { e.stopPropagation(); toggleStatus(a.id, a.isOpen); }} className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${a.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {a.isOpen ? 'Open for Subs' : 'Closed'}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">{a.description}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Right Col: Submissions & Grading */}
        <Card className="border-none shadow-premium rounded-[2.5rem] bg-white p-8">
          <CardHeader className="p-0 mb-8">
            <CardTitle className="text-2xl font-black">
              Grading Portal
            </CardTitle>
            <p className="text-sm text-gray-500">Select an assignment to view student submissions.</p>
          </CardHeader>
          <CardContent className="p-0">
            {!viewingAssignment ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl">
                <BookOpen className="h-12 w-12 mb-4 text-gray-200" />
                <p className="font-bold">Select any stage on the left <br/>to start grading.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {submissions.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No submissions yet for this stage.</p>
                ) : (
                  submissions.map(sub => (
                    <div key={sub.id} className="bg-gray-50 border border-gray-100 p-5 rounded-2xl">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                           <p className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-1">{sub.studentUID}</p>
                           <p className="text-[10px] text-gray-400">Timestamp: {sub.submittedAt?.toDate().toLocaleString() || 'Recent'}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          sub.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          sub.status === 'approved' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {sub.status}
                        </span>
                      </div>
                      
                      <a href={sub.driveLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100 hover:border-blue-400 transition-colors text-blue-600 font-bold text-sm mb-4">
                        <LinkIcon className="h-4 w-4" /> View Drive Submission
                      </a>

                      {sub.status === 'pending' && (
                        <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-200">
                          <Textarea 
                            placeholder="Add constructive feedback..." 
                            value={gradeComment} 
                            onChange={(e) => setGradeComment(e.target.value)}
                            className="text-sm rounded-lg"
                          />
                          <div className="flex gap-2">
                            <Button onClick={() => gradeSubmission(sub.id, 'approved')} className="flex-1 bg-green-600 hover:bg-green-700 h-10 rounded-lg text-xs font-bold">
                              <CheckCircle className="h-4 w-4 mr-1" /> Approve Stage
                            </Button>
                            <Button onClick={() => gradeSubmission(sub.id, 'redo')} variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50 h-10 rounded-lg text-xs font-bold">
                              <XCircle className="h-4 w-4 mr-1" /> Request Redo
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {sub.status !== 'pending' && sub.tutorComment && (
                        <div className="mt-3 p-3 bg-white rounded-xl border border-gray-100 text-sm">
                          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Your Feedback</p>
                          <p className="text-gray-700">{sub.tutorComment}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

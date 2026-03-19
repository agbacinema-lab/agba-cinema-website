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
              activeSubject === sub ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Col: Assignments List */}
        <Card className="border border-muted shadow-premium rounded-[2.5rem] bg-card p-8 transition-colors">
          <CardHeader className="p-0 mb-8 flex flex-row justify-between items-center">
            <CardTitle className="flex items-center gap-3 text-2xl font-black text-foreground">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-indigo-500" />
              </div>
              Curriculum Stages
            </CardTitle>
            <Button onClick={() => setIsCreating(!isCreating)} variant="outline" className="rounded-xl h-10 font-bold border-muted text-foreground hover:bg-muted">
              {isCreating ? "Cancel" : "+ New Stage"}
            </Button>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            
            {isCreating && (
              <div className="bg-muted/30 p-6 rounded-2xl border border-muted mb-6 space-y-4 transition-colors">
                <Input placeholder="Assignment Title (e.g. Stage 1: The Basics)" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="bg-card border-muted rounded-xl h-12 text-foreground" />
                <Textarea placeholder="Instructions/Requirements..." value={newDesc} onChange={e => setNewDesc(e.target.value)} className="bg-card border-muted rounded-xl min-h-[100px] text-foreground" />
                <Button onClick={handleCreateAssignment} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 rounded-xl">Create Assignment</Button>
              </div>
            )}

            {loading ? (
              <div className="text-center text-muted-foreground py-8 animate-pulse font-bold uppercase tracking-widest text-[10px]">Loading curriculum...</div>
            ) : assignments.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 font-medium">No assignments created for {activeSubject} yet.</div>
            ) : (
              assignments.map((a, i) => (
                <div key={a.id} className={`p-5 rounded-2xl transition-all cursor-pointer border ${viewingAssignment === a.id ? 'border-indigo-500/50 bg-indigo-500/10' : 'border-muted bg-card hover:border-foreground/20'} transition-colors`} onClick={() => viewSubmissions(a.id)}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-black text-lg text-foreground">Stage {assignments.length - i}: {a.title}</h4>
                    <button onClick={(e) => { e.stopPropagation(); toggleStatus(a.id, a.isOpen); }} className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${a.isOpen ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {a.isOpen ? 'Open for Subs' : 'Closed'}
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{a.description}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Right Col: Submissions & Grading */}
        <Card className="border border-muted shadow-premium rounded-[2.5rem] bg-card p-8 transition-colors">
          <CardHeader className="p-0 mb-8">
            <CardTitle className="text-2xl font-black text-foreground">
              Grading Portal
            </CardTitle>
            <p className="text-sm text-muted-foreground font-medium">Select an assignment to view student submissions.</p>
          </CardHeader>
          <CardContent className="p-0">
            {!viewingAssignment ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground border-2 border-dashed border-muted rounded-3xl transition-colors">
                <BookOpen className="h-12 w-12 mb-4 text-muted/20" />
                <p className="font-bold uppercase tracking-widest text-[10px]">Select any stage on the left <br/>to start grading.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {submissions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8 font-medium italic">No submissions yet for this stage.</p>
                ) : (
                  submissions.map(sub => (
                    <div key={sub.id} className="bg-muted/30 border border-muted p-5 rounded-2xl transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                           <p className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-1">{sub.studentUID}</p>
                           <p className="text-[10px] text-muted-foreground">Timestamp: {sub.submittedAt?.toDate().toLocaleString() || 'Recent'}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          sub.status === 'pending' ? 'bg-yellow-400 text-black' :
                          sub.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {sub.status}
                        </span>
                      </div>
                      
                      <a href={sub.driveLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 bg-card rounded-xl border border-muted hover:border-indigo-500 transition-all text-indigo-500 font-bold text-sm mb-4">
                        <LinkIcon className="h-4 w-4" /> View Drive Submission
                      </a>

                      {sub.status === 'pending' && (
                        <div className="space-y-3 bg-card p-4 rounded-xl border border-muted transition-colors">
                          <Textarea 
                            placeholder="Add constructive feedback..." 
                            value={gradeComment} 
                            onChange={(e) => setGradeComment(e.target.value)}
                            className="text-sm rounded-lg border-muted bg-muted/20 text-foreground"
                          />
                          <div className="flex gap-2">
                            <Button onClick={() => gradeSubmission(sub.id, 'approved')} className="flex-1 bg-green-600 hover:bg-green-700 h-10 rounded-lg text-xs font-bold text-white">
                              <CheckCircle className="h-4 w-4 mr-1" /> Approve Stage
                            </Button>
                            <Button onClick={() => gradeSubmission(sub.id, 'redo')} variant="outline" className="flex-1 border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white h-10 rounded-lg text-xs font-bold">
                              <XCircle className="h-4 w-4 mr-1" /> Request Redo
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {sub.status !== 'pending' && sub.tutorComment && (
                        <div className="mt-3 p-3 bg-card rounded-xl border border-muted text-sm transition-colors">
                          <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Your Feedback</p>
                          <p className="text-foreground">{sub.tutorComment}</p>
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

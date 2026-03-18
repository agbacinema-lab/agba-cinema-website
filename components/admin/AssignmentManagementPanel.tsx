"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, ChevronDown, ChevronUp, CheckCircle, RefreshCw, Clock, User } from "lucide-react"
import { assignmentService } from "@/lib/services"
import { motion, AnimatePresence } from "framer-motion"

export default function AssignmentManagementPanel() {
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null)
  const [submissions, setSubmissions] = useState<Record<string, any[]>>({})
  const [loadingSubmissions, setLoadingSubmissions] = useState<Record<string, boolean>>({})
  const [gradingId, setGradingId] = useState<string | null>(null)
  const [gradeData, setGradeData] = useState<{ grade: string; feedback: string }>({ grade: "", feedback: "" })

  useEffect(() => {
    loadAssignments()
  }, [])

  const loadAssignments = async () => {
    try {
      setLoading(true)
      const data = await assignmentService.getAllAssignments()
      setAssignments(data)
    } catch (error) {
      console.error("Error loading assignments:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAssignment = async (assignmentId: string) => {
    if (expandedAssignment === assignmentId) {
      setExpandedAssignment(null)
      return
    }
    setExpandedAssignment(assignmentId)

    if (!submissions[assignmentId]) {
      setLoadingSubmissions(prev => ({ ...prev, [assignmentId]: true }))
      try {
        const data = await assignmentService.getSubmissions(assignmentId)
        setSubmissions(prev => ({ ...prev, [assignmentId]: data }))
      } catch (error) {
        console.error("Error loading submissions:", error)
      } finally {
        setLoadingSubmissions(prev => ({ ...prev, [assignmentId]: false }))
      }
    }
  }

  const refreshSubmissions = async (assignmentId: string) => {
    setLoadingSubmissions(prev => ({ ...prev, [assignmentId]: true }))
    try {
      const data = await assignmentService.getSubmissions(assignmentId)
      setSubmissions(prev => ({ ...prev, [assignmentId]: data }))
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingSubmissions(prev => ({ ...prev, [assignmentId]: false }))
    }
  }

  const handleGrade = async (assignmentId: string, submissionId: string) => {
    if (!gradeData.grade || !gradeData.feedback) {
      alert("Please enter a grade and feedback before submitting")
      return
    }
    try {
      await assignmentService.gradeSubmission(assignmentId, submissionId, Number(gradeData.grade), gradeData.feedback)
      alert("Graded successfully!")
      setGradingId(null)
      setGradeData({ grade: "", feedback: "" })
      refreshSubmissions(assignmentId)
    } catch (error) {
      alert("Failed to grade: " + (error as any).message)
    }
  }

  const statusColor = (status: string) => {
    if (status === "graded") return "bg-green-100 text-green-700"
    if (status === "submitted") return "bg-yellow-100 text-yellow-800"
    return "bg-gray-100 text-gray-600"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black mb-1">Assignment Grading</h2>
        <p className="text-gray-500 font-medium">Review and grade student submissions</p>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <ClipboardList className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-700 font-medium">
          Assignments are created inside the <strong>Course Builder → Module</strong>. 
          This panel is exclusively for reviewing and grading what students have submitted.
        </p>
      </div>

      {/* Assignments list */}
      {assignments.length === 0 ? (
        <Card className="border-none shadow-sm rounded-[2rem] bg-white p-12 text-center">
          <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 font-medium mb-2">No assignments created yet</p>
          <p className="text-sm text-gray-400">Go to Course Builder → Module to create assignments for students</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const isOpen = expandedAssignment === assignment.id
            const subs = submissions[assignment.id] || []
            const pending = subs.filter(s => s.status === "submitted").length
            const graded = subs.filter(s => s.status === "graded").length

            return (
              <motion.div key={assignment.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-none shadow-md rounded-[2rem] overflow-hidden">
                  {/* Assignment header row - click to expand */}
                  <CardHeader
                    className="cursor-pointer p-6 bg-gradient-to-r from-gray-50 to-white hover:from-yellow-50 transition-colors"
                    onClick={() => toggleAssignment(assignment.id)}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge className={assignment.programType === 'gopro' ? "bg-yellow-400 text-black border-0" : "bg-blue-500 text-white border-0"}>
                            {assignment.programType === 'gopro' ? 'Go Pro' : 'Mentorship'}
                          </Badge>
                          {assignment.moduleTitle && (
                            <Badge variant="outline" className="font-mono text-xs">
                              {assignment.moduleTitle}
                            </Badge>
                          )}
                          {assignment.dueDate && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Due: {new Date(assignment.dueDate).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-black text-gray-900 mb-1">{assignment.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-1">{assignment.description}</p>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        {submissions[assignment.id] && (
                          <div className="text-right">
                            <p className="text-xs text-orange-600 font-bold">{pending} pending</p>
                            <p className="text-xs text-green-600 font-bold">{graded} graded</p>
                          </div>
                        )}
                        {isOpen ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                      </div>
                    </div>
                  </CardHeader>

                  {/* Submissions inside */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <CardContent className="p-6 border-t border-gray-100">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-black text-gray-700">Student Submissions</h4>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => refreshSubmissions(assignment.id)}
                              className="rounded-lg flex items-center gap-1"
                            >
                              <RefreshCw className="h-3 w-3" />
                              Refresh
                            </Button>
                          </div>

                          {loadingSubmissions[assignment.id] ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-yellow-400" />
                            </div>
                          ) : subs.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-xl">
                              <User className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                              <p className="text-gray-500 text-sm font-medium">No submissions yet</p>
                              <p className="text-gray-400 text-xs mt-1">Students haven't submitted this assignment</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {subs.map((submission) => (
                                <div key={submission.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                                  <div className="flex justify-between items-start gap-4">
                                    <div className="flex-grow">
                                      <div className="flex items-center gap-2 mb-2">
                                        <User className="h-4 w-4 text-gray-400" />
                                        <span className="font-bold text-gray-800 text-sm">{submission.studentId}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold capitalize ${statusColor(submission.status)}`}>
                                          {submission.status}
                                        </span>
                                      </div>
                                      {submission.submittedAt && (
                                        <p className="text-xs text-gray-400 mb-2">
                                          Submitted: {new Date(submission.submittedAt?.toDate?.() || submission.submittedAt).toLocaleString()}
                                        </p>
                                      )}
                                      {submission.fileUrl && (
                                        <a
                                          href={submission.fileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-block text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-lg font-bold hover:bg-blue-100 transition-colors mb-2"
                                        >
                                          📄 View Submitted File
                                        </a>
                                      )}
                                      {submission.submissionText && (
                                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl mb-2">
                                          {submission.submissionText}
                                        </p>
                                      )}
                                      {submission.status === "graded" && (
                                        <div className="flex items-center gap-3 mt-2 bg-green-50 p-3 rounded-xl">
                                          <CheckCircle className="h-4 w-4 text-green-600" />
                                          <div>
                                            <p className="text-xs font-bold text-green-700">Grade: {submission.grade}/{assignment.maxGrade || 100}</p>
                                            <p className="text-xs text-green-600">{submission.feedback}</p>
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex-shrink-0">
                                      {submission.status !== "graded" && (
                                        <Button
                                          size="sm"
                                          onClick={() => {
                                            setGradingId(submission.id)
                                            setGradeData({ grade: "", feedback: "" })
                                          }}
                                          className="bg-black text-white font-bold rounded-lg hover:bg-gray-800"
                                        >
                                          Grade
                                        </Button>
                                      )}
                                      {submission.status === "graded" && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            setGradingId(submission.id)
                                            setGradeData({ grade: String(submission.grade || ""), feedback: submission.feedback || "" })
                                          }}
                                          className="rounded-lg text-xs"
                                        >
                                          Re-grade
                                        </Button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Inline grading form */}
                                  {gradingId === submission.id && (
                                    <motion.div
                                      initial={{ opacity: 0, y: -6 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="mt-4 bg-gray-50 p-4 rounded-xl space-y-3 border border-gray-200"
                                    >
                                      <h5 className="font-black text-sm text-gray-700">Grade this Submission</h5>
                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Score (out of {assignment.maxGrade || 100})</label>
                                          <Input
                                            type="number"
                                            value={gradeData.grade}
                                            onChange={(e) => setGradeData(prev => ({ ...prev, grade: e.target.value }))}
                                            placeholder="e.g. 85"
                                            className="h-10 rounded-lg mt-1"
                                            max={assignment.maxGrade || 100}
                                            min={0}
                                          />
                                        </div>
                                      </div>
                                      <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Feedback for Student</label>
                                        <Textarea
                                          value={gradeData.feedback}
                                          onChange={(e) => setGradeData(prev => ({ ...prev, feedback: e.target.value }))}
                                          placeholder="Write constructive feedback for the student..."
                                          className="min-h-20 rounded-lg mt-1 text-sm"
                                        />
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          onClick={() => handleGrade(assignment.id, submission.id)}
                                          className="flex-1 bg-green-500 text-white font-black h-10 rounded-lg hover:bg-green-600"
                                        >
                                          ✓ Submit Grade
                                        </Button>
                                        <Button
                                          variant="outline"
                                          onClick={() => setGradingId(null)}
                                          className="flex-1 h-10 rounded-lg"
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </motion.div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

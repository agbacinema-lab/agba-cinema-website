"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Download, MessageSquare, CheckCircle, Clock } from "lucide-react"
import { assignmentService } from "@/lib/services"
import { motion } from "framer-motion"
import { toast } from "sonner"

interface TutorSubmissionGraderProps {
  assignmentId: string
}

export default function TutorSubmissionGrader({ assignmentId }: TutorSubmissionGraderProps) {
  const [assignment, setAssignment] = useState<any | null>(null)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [gradingId, setGradingId] = useState<string | null>(null)
  const [gradingData, setGradingData] = useState({ grade: "", feedback: "" })

  useEffect(() => {
    loadAssignmentAndSubmissions()
  }, [assignmentId])

  const loadAssignmentAndSubmissions = async () => {
    try {
      setLoading(true)
      const assignmentData = await assignmentService.getAssignmentById(assignmentId)
      setAssignment(assignmentData)

      const submissionsData = await assignmentService.getSubmissions(assignmentId)
      setSubmissions(submissionsData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitGrade = async () => {
    if (!gradingId || !gradingData.grade) {
      toast.error("Please enter a grade")
      return
    }

    try {
      const grade = parseInt(gradingData.grade)
      await assignmentService.gradeSubmission(
        assignmentId,
        gradingId,
        grade,
        gradingData.feedback
      )

      toast.success("Submission graded successfully!")
      setGradingId(null)
      setGradingData({ grade: "", feedback: "" })
      loadAssignmentAndSubmissions()
    } catch (error) {
      toast.error("Error grading submission: " + (error as any).message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400"></div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <Card className="border-none shadow-sm rounded-[2rem] bg-white p-12 text-center">
        <p className="text-gray-500 font-medium">Assignment not found</p>
      </Card>
    )
  }

  const gradedCount = submissions.filter((s) => s.status === "graded").length
  const pendingCount = submissions.filter((s) => s.status === "submitted").length

  return (
    <div className="space-y-8">
      {/* Assignment Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-black mb-2">{assignment.title}</h2>
        <div className="flex items-center gap-4 flex-wrap">
          <Badge className="bg-yellow-400 text-black">
            {assignment.programType === 'gopro' ? 'Go Pro' : 'Mentorship'}
          </Badge>
          <Badge variant="outline">{assignment.specialization}</Badge>
          <Badge variant="secondary">Max Grade: {assignment.maxGrade}</Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm rounded-[1.5rem] bg-white p-6">
          <p className="text-xs font-black text-gray-500 mb-2">Total Submissions</p>
          <p className="text-3xl font-black">{submissions.length}</p>
        </Card>
        <Card className="border-none shadow-sm rounded-[1.5rem] bg-white p-6">
          <p className="text-xs font-black text-gray-500 mb-2">Pending Grading</p>
          <p className="text-3xl font-black text-orange-600">{pendingCount}</p>
        </Card>
        <Card className="border-none shadow-sm rounded-[1.5rem] bg-white p-6">
          <p className="text-xs font-black text-gray-500 mb-2">Graded</p>
          <p className="text-3xl font-black text-green-600">{gradedCount}</p>
        </Card>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {submissions.length === 0 ? (
          <Card className="border-none shadow-sm rounded-[2rem] bg-white p-12 text-center">
            <p className="text-gray-500 font-medium">No submissions yet</p>
          </Card>
        ) : (
          submissions.map((submission) => (
            <motion.div
              key={submission.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-none shadow-md rounded-[2rem] bg-white hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-black text-gray-900">
                          Student ID: {submission.studentId}
                        </p>
                        <Badge
                          className={`${
                            submission.status === "graded"
                              ? "bg-green-500 text-white"
                              : "bg-orange-500 text-white"
                          }`}
                        >
                          {submission.status === "graded" ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {submission.status === "graded" ? "Graded" : "Pending"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">
                        Submitted: {new Date(submission.submitedAt).toLocaleString()}
                      </p>

                      {submission.status === "graded" && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-3">
                          <p className="text-sm font-black text-green-900 mb-1">
                            Grade: {submission.grade}/{assignment.maxGrade}
                          </p>
                          {submission.feedback && (
                            <p className="text-sm text-green-800 mt-2">
                              {submission.feedback}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {submission.submissionUrl && (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                      >
                        <a
                          href={submission.submissionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </a>
                      </Button>
                    )}
                  </div>

                  {submission.status !== "graded" && (
                    <div className="border-t pt-4 mt-4">
                      {gradingId === submission.id ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault()
                            handleSubmitGrade()
                          }}
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs font-black uppercase text-gray-500 block mb-2">
                                Grade (0-{assignment.maxGrade})
                              </label>
                              <Input
                                type="number"
                                min="0"
                                max={assignment.maxGrade}
                                value={gradingData.grade}
                                onChange={(e) =>
                                  setGradingData({ ...gradingData, grade: e.target.value })
                                }
                                className="rounded-lg"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-black uppercase text-gray-500 block mb-2">
                              Feedback
                            </label>
                            <Textarea
                              value={gradingData.feedback}
                              onChange={(e) =>
                                setGradingData({ ...gradingData, feedback: e.target.value })
                              }
                              placeholder="Enter feedback for the student"
                              className="rounded-lg min-h-24"
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button
                              type="submit"
                              className="flex-1 bg-yellow-400 text-black font-bold rounded-lg"
                            >
                              Submit Grade
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setGradingId(null)}
                              className="flex-1 rounded-lg"
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <Button
                          onClick={() => {
                            setGradingId(submission.id)
                            setGradingData({ grade: "", feedback: "" })
                          }}
                          className="w-full bg-yellow-400 text-black font-bold rounded-lg h-12 flex items-center gap-2 justify-center"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Grade Submission
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

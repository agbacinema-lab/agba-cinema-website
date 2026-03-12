"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Upload, Download, CheckCircle, Clock, AlertCircle, Star } from "lucide-react"
import { assignmentService } from "@/lib/services"
import { motion } from "framer-motion"

interface StudentAssignmentViewProps {
  curriculumId?: string
  studentId: string
  programType?: 'gopro' | 'mentorship'
  specialization?: string
}

export default function StudentAssignmentView({
  curriculumId,
  studentId,
  programType,
  specialization
}: StudentAssignmentViewProps) {
  const [assignments, setAssignments] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<Map<string, any>>(new Map())
  const [loading, setLoading] = useState(true)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    loadAssignments()
  }, [curriculumId, programType, specialization])

  const loadAssignments = async () => {
    try {
      setLoading(true)
      let data
      if (curriculumId) {
        data = await assignmentService.getAssignmentsByCurriculum(curriculumId)
      } else if (programType && specialization) {
        data = await assignmentService.getAssignmentsByProgram(programType)
        data = data.filter((a: any) => a.specialization === specialization)
      } else {
        data = await assignmentService.getAllAssignments()
      }
      setAssignments(data)

      // Load submissions for each assignment
      const submissionsMap = new Map()
      for (const assignment of data) {
        try {
          const submission = await assignmentService.getSubmissionByStudent(assignment.id, studentId)
          if (submission) {
            submissionsMap.set(assignment.id, submission)
          }
        } catch (error) {
          console.error(`Error loading submission for ${assignment.id}:`, error)
        }
      }
      setSubmissions(submissionsMap)
    } catch (error) {
      console.error("Error loading assignments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadFile = async (assignmentId: string, file: File) => {
    if (!file) return

    try {
      setUploadingId(assignmentId)

      // Upload file to Firebase Storage
      const formData = new FormData()
      formData.append('file', file)
      formData.append('assignmentId', assignmentId)
      formData.append('studentId', studentId)

      // You'll need to create an API endpoint for this
      const response = await fetch('/api/assignments/submit', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      const { fileUrl } = await response.json()

      // Submit assignment
      await assignmentService.submitAssignment(assignmentId, studentId, {
        submissionUrl: fileUrl,
      })

      alert('Assignment submitted successfully!')
      loadAssignments()
    } catch (error) {
      alert('Error submitting assignment: ' + (error as any).message)
    } finally {
      setUploadingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800'
      case 'graded':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Clock className="h-4 w-4" />
      case 'graded':
        return <CheckCircle className="h-4 w-4" />
      case 'pending':
        return <AlertCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const isOverdue = (dueDate: string) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black">Assignments</h2>

      {assignments.length === 0 ? (
        <Card className="border-none shadow-sm rounded-[2rem] bg-white">
          <CardContent className="p-12 text-center">
            <p className="text-gray-500 font-medium">No assignments available</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const submission = submissions.get(assignment.id)
            const isSubmitted = !!submission
            const isGraded = submission?.status === 'graded'
            const overdue = isOverdue(assignment.dueDate)

            return (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card
                  className="border-none shadow-md rounded-[2rem] bg-white hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => setExpandedId(expandedId === assignment.id ? null : assignment.id)}
                >
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div className="flex-grow">
                        <h3 className="text-lg font-black text-gray-900 mb-2">
                          {assignment.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                          <Badge variant="secondary" className="text-xs">
                            {assignment.specialization}
                          </Badge>
                          {assignment.dueDate && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                overdue && !submission
                                  ? 'border-red-300 bg-red-50 text-red-700'
                                  : ''
                              }`}
                            >
                              Due: {new Date(assignment.dueDate).toLocaleDateString()}
                            </Badge>
                          )}
                          {isGraded && (
                            <Badge className="bg-green-500 text-white flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              Grade: {submission.grade}/{assignment.maxGrade}
                            </Badge>
                          )}
                          {submission && !isGraded && (
                            <Badge className="bg-blue-500 text-white flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Submitted
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-3xl text-yellow-600">
                          {assignment.maxGrade}
                        </div>
                        <p className="text-xs text-gray-500 font-medium">Total Points</p>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedId === assignment.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t pt-4 mt-4 space-y-4"
                      >
                        <div>
                          <p className="text-xs font-black uppercase text-gray-500 mb-2">
                            Description
                          </p>
                          <p className="text-gray-700">{assignment.description}</p>
                        </div>

                        {assignment.instructions && (
                          <div>
                            <p className="text-xs font-black uppercase text-gray-500 mb-2">
                              Instructions
                            </p>
                            <p className="text-gray-700 whitespace-pre-wrap">
                              {assignment.instructions}
                            </p>
                          </div>
                        )}

                        {/* Submission Area */}
                        <div className="mt-6 border-t pt-4">
                          {submission ? (
                            <div className="space-y-4">
                              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <p className="text-xs font-black text-blue-600 mb-1">
                                  ✓ SUBMITTED
                                </p>
                                <p className="text-sm text-blue-700">
                                  Submitted: {new Date(submission.submittedAt).toLocaleString()}
                                </p>
                              </div>

                              {isGraded && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                  <div className="flex justify-between items-center mb-2">
                                    <p className="text-xs font-black text-green-600">GRADED</p>
                                    <p className="text-2xl font-black text-green-600">
                                      {submission.grade}/{assignment.maxGrade}
                                    </p>
                                  </div>
                                  {submission.feedback && (
                                    <p className="text-sm text-green-700 mt-2">
                                      <span className="font-black">Feedback: </span>
                                      {submission.feedback}
                                    </p>
                                  )}
                                </div>
                              )}

                              {submission.submissionUrl && (
                                <Button
                                  asChild
                                  variant="outline"
                                  className="w-full rounded-xl"
                                >
                                  <a
                                    href={submission.submissionUrl}
                                    download
                                    className="flex items-center gap-2"
                                  >
                                    <Download className="h-4 w-4" />
                                    Download Submission
                                  </a>
                                </Button>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {overdue && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                                  <p className="text-sm font-black text-red-700 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    This assignment is overdue
                                  </p>
                                </div>
                              )}
                              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                                <input
                                  type="file"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                      handleUploadFile(assignment.id, file)
                                    }
                                  }}
                                  className="hidden"
                                  id={`file-${assignment.id}`}
                                  disabled={uploadingId === assignment.id}
                                />
                                <label htmlFor={`file-${assignment.id}`} className="cursor-pointer">
                                  <div className="flex justify-center mb-2">
                                    <Upload className="h-8 w-8 text-gray-400" />
                                  </div>
                                  <p className="text-sm font-black text-gray-900 mb-1">
                                    {uploadingId === assignment.id
                                      ? 'Uploading...'
                                      : 'Click to upload your submission'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    PDF, DOC, or ZIP files
                                  </p>
                                </label>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

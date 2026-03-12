"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import TutorSubmissionGrader from "@/components/tutor/SubmissionGrader"
import { assignmentService } from "@/lib/services"
import { motion } from "framer-motion"
import { Calendar, Users } from "lucide-react"

export default function TutorAssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null)

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCF6]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400"></div>
      </div>
    )
  }

  if (selectedAssignment) {
    const assignment = assignments.find((a) => a.id === selectedAssignment)
    return (
      <div className="min-h-screen bg-[#FDFCF6] p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <Button
            onClick={() => setSelectedAssignment(null)}
            variant="outline"
            className="rounded-lg"
          >
            ← Back to Assignments
          </Button>
          {assignment && <TutorSubmissionGrader assignmentId={assignment.id} />}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFCF6] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-black mb-2">Assignment Submissions</h1>
          <p className="text-gray-500">Review and grade student submissions</p>
        </div>

        {assignments.length === 0 ? (
          <Card className="border-none shadow-sm rounded-[2rem] bg-white p-12 text-center">
            <p className="text-gray-500 font-medium">No assignments created yet</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {assignments.map((assignment) => (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-none shadow-md rounded-[2rem] bg-white hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-grow">
                        <h3 className="text-lg font-black text-gray-900 mb-2">
                          {assignment.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                          <Badge
                            className={
                              assignment.programType === "gopro"
                                ? "bg-yellow-400 text-black"
                                : "bg-blue-500 text-white"
                            }
                          >
                            {assignment.programType === "gopro"
                              ? "Go Pro"
                              : "Mentorship"}
                          </Badge>
                          <Badge variant="outline">
                            {assignment.specialization}
                          </Badge>
                          {assignment.dueDate && (
                            <Badge
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              <Calendar className="h-3 w-3" />
                              {new Date(assignment.dueDate).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{assignment.description}</p>
                      </div>
                      <Button
                        onClick={() => setSelectedAssignment(assignment.id)}
                        className="bg-yellow-400 text-black font-bold h-12 px-6 rounded-xl whitespace-nowrap flex items-center gap-2"
                      >
                        <Users className="h-4 w-4" />
                        View Submissions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

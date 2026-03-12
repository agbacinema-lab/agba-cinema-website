"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit2, Trash2, X, Zap, Users, Calendar } from "lucide-react"
import { assignmentService } from "@/lib/services"
import { motion } from "framer-motion"

interface AssignmentManagerProps {
  filter?: 'gopro' | 'mentorship' | 'all'
  curriculumId?: string
}

const SPECIALIZATIONS = {
  gopro: [
    { value: 'video-editing-laptop', label: 'Video Editing - Laptop' },
    { value: 'video-editing-mobile', label: 'Video Editing - Mobile' },
    { value: 'after-effects', label: 'After Effects' },
  ],
  mentorship: [
    { value: 'video-editing-laptop', label: 'Video Editing - Laptop' },
    { value: 'motion-design', label: 'Motion Design' },
    { value: 'script-writing', label: 'Script Writing' },
    { value: 'storytelling', label: 'Storytelling' },
  ]
}

export default function AssignmentManager({ filter = 'all', curriculumId }: AssignmentManagerProps) {
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [programType, setProgramType] = useState<'gopro' | 'mentorship'>('gopro')
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    specialization: "",
    dueDate: "",
    maxGrade: 100,
  })

  useEffect(() => {
    loadAssignments()
  }, [filter])

  const loadAssignments = async () => {
    try {
      setLoading(true)
      let data
      if (curriculumId) {
        data = await assignmentService.getAssignmentsByCurriculum(curriculumId)
      } else if (filter === 'all') {
        data = await assignmentService.getAllAssignments()
      } else {
        data = await assignmentService.getAssignmentsByProgram(filter)
      }
      setAssignments(data)
    } catch (error) {
      console.error("Error loading assignments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.specialization || !formData.description) {
      alert("Please fill in all required fields")
      return
    }

    try {
      const assignmentData = {
        title: formData.title,
        description: formData.description,
        instructions: formData.instructions,
        programType,
        specialization: formData.specialization,
        curriculumId: curriculumId || "",
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        maxGrade: formData.maxGrade,
        createdBy: "tutor"
      }

      if (editingId) {
        await assignmentService.updateAssignment(editingId, assignmentData)
        alert("Assignment updated successfully!")
      } else {
        await assignmentService.createAssignment(assignmentData)
        alert("Assignment created successfully!")
      }

      resetForm()
      loadAssignments()
    } catch (error) {
      alert("Error saving assignment: " + (error as any).message)
    }
  }

  const handleDelete = async (assignmentId: string) => {
    try {
      await assignmentService.deleteAssignment(assignmentId)
      loadAssignments()
    } catch (error) {
      alert("Failed to delete assignment")
    }
  }

  const resetForm = () => {
    setFormData({ title: "", description: "", instructions: "", specialization: "", dueDate: "", maxGrade: 100 })
    setEditingId(null)
    setShowForm(false)
    setProgramType('gopro')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400"></div>
      </div>
    )
  }

  const currentSpecializations = SPECIALIZATIONS[programType]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black">Assignments</h2>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-yellow-400 text-black font-bold h-14 px-6 rounded-2xl flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Create Assignment
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-none shadow-premium rounded-[2.5rem] bg-white p-12">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black">{editingId ? "Edit Assignment" : "Create New Assignment"}</h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Program Type */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Program Type *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setProgramType('gopro')
                      setFormData({ ...formData, specialization: '' })
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all font-bold flex items-center gap-2 ${
                      programType === 'gopro'
                        ? 'border-yellow-400 bg-yellow-50 text-black'
                        : 'border-gray-200 bg-white text-gray-600'
                    }`}
                  >
                    <Zap className="h-5 w-5" />
                    Go Pro
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProgramType('mentorship')
                      setFormData({ ...formData, specialization: '' })
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all font-bold flex items-center gap-2 ${
                      programType === 'mentorship'
                        ? 'border-yellow-400 bg-yellow-50 text-black'
                        : 'border-gray-200 bg-white text-gray-600'
                    }`}
                  >
                    <Users className="h-5 w-5" />
                    Mentorship
                  </button>
                </div>
              </div>

              {/* Specialization */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Specialization *
                </label>
                <select
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                >
                  <option value="">Select specialization</option>
                  {currentSpecializations.map((spec) => (
                    <option key={spec.value} value={spec.value}>
                      {spec.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Assignment Title *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Edit Your First Video Project"
                    className="h-12 rounded-xl border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Due Date
                  </label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="h-12 rounded-xl border-gray-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Description *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What is this assignment about?"
                  className="min-h-20 rounded-xl border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Instructions
                </label>
                <Textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Detailed instructions for the assignment"
                  className="min-h-32 rounded-xl border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Max Grade
                </label>
                <Input
                  type="number"
                  value={formData.maxGrade}
                  onChange={(e) => setFormData({ ...formData, maxGrade: parseInt(e.target.value) })}
                  className="h-12 rounded-xl border-gray-200"
                />
              </div>

              <div className="flex gap-4 pt-6 border-t">
                <Button type="submit" className="flex-1 bg-yellow-400 text-black font-black h-14 rounded-2xl">
                  {editingId ? "Update Assignment" : "Create Assignment"}
                </Button>
                <Button type="button" onClick={resetForm} variant="outline" className="flex-1 h-14 rounded-2xl">
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Assignments List */}
      <div className="space-y-4">
        {assignments.length === 0 ? (
          <Card className="border-none shadow-premium rounded-[2.5rem] bg-white p-12 text-center">
            <p className="text-gray-500 font-medium">No assignments yet</p>
          </Card>
        ) : (
          assignments.map((assignment) => (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-none shadow-md rounded-[2rem] bg-white hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {assignment.programType === 'gopro' ? (
                          <Badge className="bg-yellow-400 text-black border-0">Go Pro</Badge>
                        ) : (
                          <Badge className="bg-blue-500 text-white border-0">Mentorship</Badge>
                        )}
                        <Badge variant="outline">{assignment.specialization}</Badge>
                        {assignment.dueDate && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(assignment.dueDate).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-black text-gray-900 mb-2">{assignment.title}</h3>
                      <p className="text-gray-600 mb-2">{assignment.description}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-sm">
                          <p className="text-gray-500 font-bold">Max Grade</p>
                          <p className="text-2xl font-black text-yellow-600">{assignment.maxGrade}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setEditingId(assignment.id)
                          setFormData({
                            title: assignment.title,
                            description: assignment.description,
                            instructions: assignment.instructions || "",
                            specialization: assignment.specialization,
                            dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().split('T')[0] : "",
                            maxGrade: assignment.maxGrade,
                          })
                          setProgramType(assignment.programType)
                          setShowForm(true)
                        }}
                        size="sm"
                        variant="outline"
                        className="rounded-lg"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive" className="rounded-lg">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{assignment.title}"?
                          </AlertDialogDescription>
                          <div className="flex gap-4 justify-end">
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(assignment.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, Plus, Edit2, Trash2, FileUp, ClipboardList, CheckCircle } from "lucide-react"
import { curriculumService, assignmentService } from "@/lib/services"
import CurriculumMaterials from "./CurriculumMaterials"
import { motion } from "framer-motion"

interface CurriculumManagerProps {
  curriculumId: string
  curriculumTitle?: string
}

export default function CurriculumManager({
  curriculumId,
  curriculumTitle = "Course Structure"
}: CurriculumManagerProps) {
  const [modules, setModules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedModule, setExpandedModule] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    topics: "",
    classType: "pdf" as "live" | "pdf" | "both"
  })
  const [assignmentForms, setAssignmentForms] = useState<Record<string, boolean>>({})
  const [assignmentData, setAssignmentData] = useState<Record<string, { title: string; description: string; dueDate: string }>>({});

  useEffect(() => {
    loadModules()
  }, [curriculumId])

  const loadModules = async () => {
    try {
      setLoading(true)
      const modulesData = await curriculumService.getModulesByCurriculum(curriculumId)
      setModules(modulesData)
    } catch (error) {
      console.error("Error loading modules:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) {
        alert("Please enter a title")
        return
    }

    try {
      setLoading(true)
      const moduleData = {
        title: formData.title,
        description: formData.description,
        topics: formData.topics.split(",").map(t => t.trim()).filter(t => t),
        isBonusModule: false,
        hasAssignment: false,
        classType: formData.classType
      }
      await curriculumService.createModule(curriculumId, moduleData)
      resetForm()
      loadModules()
    } catch (error) {
      console.error(error)
      alert("Error creating module")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ title: "", description: "", topics: "", classType: "pdf" })
    setShowForm(false)
  }

  const toggleAssignmentForm = (moduleId: string) => {
    setAssignmentForms(prev => ({ ...prev, [moduleId]: !prev[moduleId] }))
    if (!assignmentData[moduleId]) {
      setAssignmentData(prev => ({ ...prev, [moduleId]: { title: "", description: "", dueDate: "" } }))
    }
  }

  const handleCreateAssignment = async (moduleId: string, moduleTitle: string) => {
    const data = assignmentData[moduleId]
    if (!data?.title || !data?.description) {
      alert("Please fill in the assignment title and description")
      return
    }
    try {
      await assignmentService.createAssignment({
        title: data.title,
        description: data.description,
        dueDate: data.dueDate || null,
        curriculumId,
        moduleId,
        moduleTitle,
        programType: "gopro",
        isOpen: true
      })
      await curriculumService.updateModule(curriculumId, moduleId, { hasAssignment: true })
      alert("Assignment created! Students can now see it in their dashboard.")
      setAssignmentForms(prev => ({ ...prev, [moduleId]: false }))
      loadModules()
    } catch (error) {
      alert("Failed to create assignment: " + (error as any).message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black mb-2">Manage Curriculum Week</h2>
          <p className="text-gray-500 font-medium">{curriculumTitle} - Daily Modules</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-yellow-400 text-black font-bold h-14 px-6 rounded-2xl flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Module (Day)
        </Button>
      </div>

      {/* Create Module Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-none shadow-premium rounded-[2.5rem] bg-white p-12">
            <h3 className="text-2xl font-black mb-6">Add Module (Day)</h3>
            <form onSubmit={handleCreateModule} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Module Title (e.g. Day 1: Interface) *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Day 1: Introduction to Premiere Pro"
                    className="h-12 rounded-xl border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Topics (comma-separated) *
                  </label>
                  <Input
                    value={formData.topics}
                    onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                    placeholder="Importing, Editing, Effects"
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
                  placeholder="Module description and learning objectives"
                  className="min-h-24 rounded-xl border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Class Type *
                </label>
                <div className="flex gap-4">
                  {(['live', 'pdf', 'both'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, classType: type })}
                      className={`flex-1 h-12 rounded-xl font-bold border-2 transition-all capitalize ${
                        formData.classType === type
                          ? "border-yellow-400 bg-yellow-50 text-black"
                          : "border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200"
                      }`}
                    >
                      {type} Class
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button type="submit" className="flex-1 bg-yellow-400 text-black font-black h-14 rounded-2xl">
                  Add Module (Day)
                </Button>
                <Button
                  type="button"
                  onClick={resetForm}
                  variant="outline"
                  className="flex-1 h-14 rounded-2xl"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Modules List */}
      <div className="space-y-6">
        {modules.length === 0 ? (
          <Card className="border-none shadow-premium rounded-[2.5rem] bg-white p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 font-medium mb-4">No daily modules added yet</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-yellow-400 text-black font-bold h-12 px-6 rounded-xl"
            >
              Add First Module (Day)
            </Button>
          </Card>
        ) : (
          modules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-none shadow-md rounded-[2rem] overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader
                  className="cursor-pointer bg-gradient-to-r from-gray-50 to-white p-6"
                  onClick={() =>
                    setExpandedModule(expandedModule === module.id ? null : module.id)
                  }
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-black">
                          MODULE {module.moduleNumber || index + 1} (DAY {module.moduleNumber || index + 1})
                        </span>
                        {module.isBonusModule && (
                          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
                            BONUS
                          </span>
                        )}
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                          {module.classType || 'PDF'} CLASS
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-gray-900 mb-2">{module.title}</h3>
                      <div className="flex flex-wrap gap-2">
                        {module.topics?.slice(0, 3).map((topic: string) => (
                          <span key={topic} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                            {topic}
                          </span>
                        ))}
                        {module.topics?.length > 3 && (
                          <span className="text-xs text-gray-400 px-2 py-1">
                            +{module.topics.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-gray-400">
                      {expandedModule === module.id ? "▼" : "▶"}
                    </div>
                  </div>
                </CardHeader>

                {expandedModule === module.id && (
                  <CardContent className="p-6 border-t border-gray-200">
                    <div className="mb-6">
                      <p className="text-gray-600 mb-4">{module.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-4 rounded-xl">
                          <p className="text-xs font-bold text-blue-600 uppercase mb-1">Materials</p>
                          <p className="text-2xl font-black text-blue-600">
                            {module.learningMaterials?.length || 0}
                          </p>
                        </div>
                        <div className={`${module.hasAssignment ? 'bg-green-50' : 'bg-red-50'} p-4 rounded-xl`}>
                          <p className={`text-xs font-bold ${module.hasAssignment ? 'text-green-600' : 'text-red-600'} uppercase mb-1`}>Assignment</p>
                          <p className={`text-2xl font-black ${module.hasAssignment ? 'text-green-600' : 'text-red-600'}`}>
                            {module.hasAssignment ? "✓" : "—"}
                          </p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-xl col-span-2">
                          <p className="text-xs font-bold text-purple-600 uppercase mb-2">Change Class Type</p>
                          <div className="flex gap-2">
                            {(['live', 'pdf', 'both'] as const).map((type) => (
                              <button
                                key={type}
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await curriculumService.updateModule(curriculumId, module.id, { classType: type });
                                  loadModules();
                                }}
                                className={`flex-1 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${
                                  (module.classType || 'pdf') === type
                                    ? "bg-purple-600 text-white shadow-sm"
                                    : "bg-white/50 text-purple-400 hover:bg-white"
                                }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Materials Section */}
                    <CurriculumMaterials
                      curriculumId={curriculumId}
                      moduleId={module.id}
                      moduleName={module.title}
                      materials={module.learningMaterials || []}
                      onMaterialAdded={loadModules}
                    />

                    {/* Assignment Section */}
                    <div className="border-t pt-6 mt-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-black flex items-center gap-2">
                          <ClipboardList className="h-5 w-5" />
                          Module Assignment
                        </h4>
                        <Button
                          size="sm"
                          onClick={() => toggleAssignmentForm(module.id)}
                          className={`${assignmentForms[module.id] ? 'bg-gray-200 text-black' : 'bg-green-500 text-white hover:bg-green-600'} font-bold rounded-lg`}
                        >
                          {assignmentForms[module.id] ? 'Cancel' : (module.hasAssignment ? '+ New Assignment' : 'Add Assignment')}
                        </Button>
                      </div>

                      {module.hasAssignment && !assignmentForms[module.id] && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <p className="text-sm font-bold text-green-700">Assignment enabled — visible in Assignment Manager for grading</p>
                        </div>
                      )}

                      {assignmentForms[module.id] && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 bg-gray-50 p-6 rounded-2xl">
                          <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Assignment Title *</label>
                            <Input
                              value={assignmentData[module.id]?.title || ""}
                              onChange={(e) => setAssignmentData(prev => ({ ...prev, [module.id]: { ...prev[module.id], title: e.target.value } }))}
                              placeholder="e.g., Edit a 60-second video using the techniques from today"
                              className="h-12 rounded-xl border-gray-200"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Description / Instructions *</label>
                            <Textarea
                              value={assignmentData[module.id]?.description || ""}
                              onChange={(e) => setAssignmentData(prev => ({ ...prev, [module.id]: { ...prev[module.id], description: e.target.value } }))}
                              placeholder="Describe what students should submit..."
                              className="min-h-20 rounded-xl border-gray-200"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Due Date (optional)</label>
                            <Input
                              type="date"
                              value={assignmentData[module.id]?.dueDate || ""}
                              onChange={(e) => setAssignmentData(prev => ({ ...prev, [module.id]: { ...prev[module.id], dueDate: e.target.value } }))}
                              className="h-12 rounded-xl border-gray-200"
                            />
                          </div>
                          <Button
                            onClick={() => handleCreateAssignment(module.id, module.title)}
                            className="w-full bg-black text-white font-black h-12 rounded-xl hover:bg-gray-900"
                          >
                            Save Assignment → Students Can See This
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, Plus, Edit2, Trash2, FileUp } from "lucide-react"
import { curriculumService } from "@/lib/services"
import CurriculumMaterials from "./CurriculumMaterials"
import { motion } from "framer-motion"

interface CurriculumManagerProps {
  specialization: string
  specialized?: string
}

export default function CurriculumManager({
  specialization = "video-editing-laptop",
  specialized = "Video Editing - Laptop"
}: CurriculumManagerProps) {
  const [modules, setModules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedModule, setExpandedModule] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    topics: ""
  })

  useEffect(() => {
    loadModules()
  }, [specialization])

  const loadModules = async () => {
    try {
      setLoading(true)
      const modulesData = await curriculumService.getModulesBySpecialization(specialization)
      setModules(modulesData)
    } catch (error) {
      console.error("Error loading modules:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // This would need to be implemented in services
      // For now, we'll show the form structure
      alert("Module creation functionality coming soon!")
      resetForm()
    } catch (error) {
      alert("Error creating module")
    }
  }

  const resetForm = () => {
    setFormData({ title: "", description: "", topics: "" })
    setShowForm(false)
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
          <h2 className="text-3xl font-black mb-2">Curriculum Manager</h2>
          <p className="text-gray-500 font-medium">{specialized} Course Structure</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-yellow-400 text-black font-bold h-14 px-6 rounded-2xl flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Module
        </Button>
      </div>

      {/* Create Module Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-none shadow-premium rounded-[2.5rem] bg-white p-12">
            <h3 className="text-2xl font-black mb-6">Create New Module</h3>
            <form onSubmit={handleCreateModule} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Module Title *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Module 1: Introduction to Premiere Pro"
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

              <div className="flex gap-4 pt-6">
                <Button type="submit" className="flex-1 bg-yellow-400 text-black font-black h-14 rounded-2xl">
                  Create Module
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
            <p className="text-gray-500 font-medium mb-4">No modules created yet</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-yellow-400 text-black font-bold h-12 px-6 rounded-xl"
            >
              Create Your First Module
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
                          MODULE {module.moduleNumber || index + 1}
                        </span>
                        {module.isBonusModule && (
                          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
                            BONUS
                          </span>
                        )}
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
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-xl">
                          <p className="text-xs font-bold text-blue-600 uppercase mb-1">Materials</p>
                          <p className="text-2xl font-black text-blue-600">
                            {module.learningMaterials?.length || 0}
                          </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl">
                          <p className="text-xs font-bold text-green-600 uppercase mb-1">Assignment</p>
                          <p className="text-2xl font-black text-green-600">
                            {module.hasAssignment ? "✓" : "—"}
                          </p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-xl">
                          <p className="text-xs font-bold text-purple-600 uppercase mb-1">Students</p>
                          <p className="text-2xl font-black text-purple-600">0</p>
                        </div>
                      </div>
                    </div>

                    {/* Materials Section */}
                    <CurriculumMaterials
                      moduleId={module.id}
                      moduleName={module.title}
                      materials={module.learningMaterials || []}
                      onMaterialAdded={loadModules}
                    />

                    {/* Assignment Section */}
                    <div className="border-t pt-6 mt-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-black">Module Assignment</h4>
                        <Button
                          size="sm"
                          className="bg-green-500 text-white font-bold rounded-lg"
                        >
                          {module.hasAssignment ? "Edit Assignment" : "Add Assignment"}
                        </Button>
                      </div>
                      {!module.hasAssignment && (
                        <p className="text-gray-500 text-sm">
                          No assignment set for this module. Click "Add Assignment" to create one.
                        </p>
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

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
import { toast } from "sonner"

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
  const [assignmentData, setAssignmentData] = useState<Record<string, { title: string; description: string; durationDays: string }>>({});

  const [activeAssignments, setActiveAssignments] = useState<Record<string, any>>({})

  useEffect(() => {
    loadModules()
  }, [curriculumId])

  const loadModules = async () => {
    try {
      setLoading(true)
      const modulesData = await curriculumService.getModulesByCurriculum(curriculumId)
      setModules(modulesData)
      
      // Load all assignments for these modules
      const assignmentsMap: Record<string, any> = {}
      for (const m of modulesData) {
        if (m.hasAssignment) {
          const ass = await assignmentService.getAssignmentByModule(m.id)
          if (ass) assignmentsMap[m.id] = ass
        }
      }
      setActiveAssignments(assignmentsMap)

    } catch (error) {
      console.error("Error loading modules:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) {
        toast.error("Please enter a title")
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
      toast.success("Module created successfully!")
      resetForm()
      loadModules()
    } catch (error) {
      console.error(error)
      toast.error("Error creating module")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ title: "", description: "", topics: "", classType: "pdf" })
    setShowForm(false)
  }

  const toggleAssignmentForm = (moduleId: string) => {
    const isEditing = !!activeAssignments[moduleId]
    setAssignmentForms(prev => ({ ...prev, [moduleId]: !prev[moduleId] }))
    
    if (!assignmentData[moduleId]) {
      if (isEditing) {
        const ass = activeAssignments[moduleId]
        setAssignmentData(prev => ({ 
          ...prev, 
          [moduleId]: { 
            title: ass.title, 
            description: ass.description, 
            durationDays: String(ass.durationDays || 3) 
          } 
        }))
      } else {
        setAssignmentData(prev => ({ 
          ...prev, 
          [moduleId]: { title: "", description: "", durationDays: "3" } 
        }))
      }
    }
  }

  const handleDeleteAssignment = async (moduleId: string, assignmentId: string) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return
    try {
      await assignmentService.deleteAssignment(assignmentId)
      await curriculumService.updateModule(curriculumId, moduleId, { hasAssignment: false })
      toast.success("Assignment deleted")
      loadModules()
    } catch (error) {
      toast.error("Failed to delete assignment")
    }
  }

  const handleCreateAssignment = async (moduleId: string, moduleTitle: string) => {
    const data = assignmentData[moduleId]
    if (!data?.title || !data?.description || !data?.durationDays || Number(data.durationDays) <= 0) {
      toast.error("Please fill in the assignment title, description, and a valid duration of days")
      return
    }
    try {
      const assData = {
        title: data.title,
        description: data.description,
        durationDays: Number(data.durationDays) || 3,
        curriculumId,
        moduleId,
        moduleTitle,
        programType: "gopro",
        isOpen: true
      }

      const existingId = activeAssignments[moduleId]?.id
      if (existingId) {
        await assignmentService.updateAssignment(existingId, assData)
      } else {
        await assignmentService.createAssignment(assData)
      }

      await curriculumService.updateModule(curriculumId, moduleId, { hasAssignment: true })
      toast.success(existingId ? "Assignment updated!" : "Assignment created!")
      setAssignmentForms(prev => ({ ...prev, [moduleId]: false }))
      loadModules()
    } catch (error) {
      toast.error("Failed to create assignment: " + (error as any).message)
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
          <h2 className="text-3xl font-black mb-2 text-left tracking-tighter">Manage curriculum week</h2>
          <p className="text-muted-foreground font-medium text-left text-sm">{curriculumTitle} — daily modules</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-yellow-400 text-black font-bold h-14 px-6 rounded-2xl flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add module (day)
        </Button>
      </div>

      {/* Create Module Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-none shadow-premium rounded-[2.5rem] bg-card p-12 text-left">
            <h3 className="text-2xl font-black mb-6 tracking-tighter">Add module (day)</h3>
            <form onSubmit={handleCreateModule} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black tracking-widest text-gray-400">
                    Module title (e.g. Day 1: Interface) *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Day 1: Introduction to Premiere Pro"
                    className="h-12 rounded-xl border-muted-foreground/30 bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black tracking-widest text-gray-400">
                    Topics (comma-separated) *
                  </label>
                  <Input
                    value={formData.topics}
                    onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                    placeholder="Importing, Editing, Effects"
                    className="h-12 rounded-xl border-muted-foreground/30 bg-background"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black tracking-widest text-gray-400">
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
                <label className="text-xs font-black tracking-widest text-gray-400">
                  Class type *
                </label>
                <div className="flex gap-4">
                  {(['live', 'pdf', 'both'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, classType: type })}
                      className={`flex-1 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest border-2 transition-all ${
                        formData.classType === type
                          ? "border-yellow-400 bg-yellow-400 text-black shadow-lg shadow-yellow-400/20"
                          : "border-muted bg-background text-muted-foreground hover:border-muted-foreground/30"
                      }`}
                    >
                      {type} class
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button type="submit" className="flex-1 bg-yellow-400 text-black font-black h-14 rounded-2xl">
                  Add module (day)
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
          <Card className="border-none shadow-premium rounded-[2.5rem] bg-card p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
            <p className="text-muted-foreground font-medium mb-4">No daily modules added yet</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-yellow-400 text-black font-bold h-12 px-6 rounded-xl"
            >
              Add first module (day)
            </Button>
          </Card>
        ) : (
          modules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border border-muted shadow-premium rounded-[2rem] overflow-hidden hover:scale-[1.01] transition-all bg-card">
                <CardHeader
                  className={`cursor-pointer transition-colors p-6 text-left ${expandedModule === module.id ? 'bg-muted/30 border-b border-muted' : 'hover:bg-muted/10'}`}
                  onClick={() =>
                    setExpandedModule(expandedModule === module.id ? null : module.id)
                  }
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                          Module {module.moduleNumber || index + 1}
                        </span>
                        {module.isBonusModule && (
                          <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                            Bonus
                          </span>
                        )}
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                          {module.classType || 'pdf'} class
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-foreground mb-2 tracking-tighter">{module.title}</h3>
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
                  <CardContent className="p-10 border-t border-muted bg-muted/5 transition-colors">
                    <div className="mb-8 text-left">
                      <p className="text-muted-foreground font-medium mb-6 leading-relaxed">{module.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-2xl text-center">
                          <p className="text-[10px] font-black tracking-widest text-blue-400 mb-2 uppercase">Materials</p>
                          <p className="text-3xl font-black text-blue-500 tracking-tighter">
                            {module.learningMaterials?.length || 0}
                          </p>
                        </div>
                        <div className={`${module.hasAssignment ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'} p-5 border rounded-2xl text-center`}>
                          <p className={`text-[10px] font-black tracking-widest ${module.hasAssignment ? 'text-green-400' : 'text-red-400'} mb-2 uppercase`}>Assignment</p>
                          <p className={`text-3xl font-black ${module.hasAssignment ? 'text-green-500' : 'text-red-500'} tracking-tighter`}>
                            {module.hasAssignment ? "✓" : "—"}
                          </p>
                        </div>
                        <div className="bg-purple-500/10 border border-purple-500/20 p-5 rounded-2xl col-span-2 text-center">
                          <p className="text-[10px] font-black tracking-widest text-purple-400 mb-3 uppercase">Class protocol</p>
                          <div className="flex gap-2">
                            {(['live', 'pdf', 'both'] as const).map((type) => (
                              <button
                                key={type}
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await curriculumService.updateModule(curriculumId, module.id, { classType: type });
                                  loadModules();
                                }}
                                className={`flex-1 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all border ${
                                  (module.classType || 'pdf') === type
                                    ? "bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-600/20 scale-105"
                                    : "bg-background border-muted text-muted-foreground hover:border-purple-400/50 hover:text-purple-400"
                                }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Assignment Section */}
                    <div className="border-t border-muted/50 pt-8 mt-8 text-left">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                          <ClipboardList className="h-6 w-6 text-yellow-400" />
                          Module assignment
                        </h4>
                        <div className="flex gap-2">
                          {activeAssignments[module.id] && !assignmentForms[module.id] && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleAssignmentForm(module.id)}
                                className="h-10 px-4 border-yellow-400/50 text-yellow-600 font-bold rounded-xl hover:bg-yellow-400 hover:text-black transition-all flex items-center gap-2"
                              >
                                <Edit2 className="h-4 w-4" /> Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteAssignment(module.id, activeAssignments[module.id].id)}
                                className="h-10 px-4 border-red-200 text-red-500 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
                              >
                                <Trash2 className="h-4 w-4" /> Delete
                              </Button>
                            </>
                          )}
                          {!activeAssignments[module.id] && !assignmentForms[module.id] && (
                            <Button
                              size="sm"
                              onClick={() => toggleAssignmentForm(module.id)}
                              className="bg-black text-white hover:bg-yellow-400 hover:text-black font-black h-10 px-6 rounded-xl transition-all"
                            >
                              Add Assignment
                            </Button>
                          )}
                        </div>
                      </div>

                      {activeAssignments[module.id] && !assignmentForms[module.id] && (
                        <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-[2rem] p-8 mb-8 space-y-4">
                          <div className="flex justify-between items-start">
                             <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-yellow-600 mb-1 opacity-60">Active Mission</p>
                                <h5 className="text-2xl font-black tracking-tight text-white mb-2">{activeAssignments[module.id].title}</h5>
                             </div>
                             <div className="px-5 py-2.5 bg-yellow-400 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-yellow-400/20">
                                {activeAssignments[module.id].durationDays} Day Window
                             </div>
                          </div>
                          <p className="text-gray-400 font-medium leading-relaxed max-w-2xl">{activeAssignments[module.id].description}</p>
                        </div>
                      )}

                      {assignmentForms[module.id] && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 bg-muted/30 border border-muted p-8 rounded-[2rem] mb-8">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase ml-2">Assignment Title *</label>
                            <Input
                              value={assignmentData[module.id]?.title || ""}
                              onChange={(e) => setAssignmentData(prev => ({ ...prev, [module.id]: { ...prev[module.id], title: e.target.value } }))}
                              placeholder="e.g., Master the Color Correction Protocol"
                              className="h-14 rounded-2xl border-muted bg-background focus:ring-4 focus:ring-yellow-400/10 font-black text-lg px-6"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase ml-2">Mission Intelligence (Instructions) *</label>
                            <Textarea
                              value={assignmentData[module.id]?.description || ""}
                              onChange={(e) => setAssignmentData(prev => ({ ...prev, [module.id]: { ...prev[module.id], description: e.target.value } }))}
                              placeholder="Describe the mission requirements..."
                              className="min-h-32 rounded-2xl border-muted bg-background focus:ring-4 focus:ring-yellow-400/10 font-medium p-6"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase ml-2 flex flex-col gap-1">
                               Execution window (Days) *
                               <span className="text-[9px] font-medium text-gray-500 normal-case tracking-normal italic">Time allotted to student after module access.</span>
                            </label>
                            <Input
                              type="number"
                              min="1"
                              value={assignmentData[module.id]?.durationDays || "3"}
                              onChange={(e) => setAssignmentData(prev => ({ ...prev, [module.id]: { ...prev[module.id], durationDays: e.target.value } }))}
                              className="h-14 w-32 rounded-2xl border-muted bg-background focus:ring-4 focus:ring-yellow-400/10 font-black text-lg px-6"
                            />
                          </div>
                          <div className="flex gap-4 pt-2">
                            <Button
                              onClick={() => handleCreateAssignment(module.id, module.title)}
                              className="flex-1 bg-yellow-400 text-black font-black h-14 rounded-2xl hover:scale-[1.02] shadow-xl shadow-yellow-400/10 transition-all"
                            >
                              {activeAssignments[module.id] ? "Update Mission" : "Deploy Assignment"}
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => toggleAssignmentForm(module.id)}
                              className="h-14 px-8 rounded-2xl font-bold text-muted-foreground"
                            >
                              Abort
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </div>
 
                    {/* Materials Section */}
                    <div className="border-t border-muted/50 pt-8 mt-8">
                       <CurriculumMaterials
                         curriculumId={curriculumId}
                         moduleId={module.id}
                         moduleName={module.title}
                         materials={module.learningMaterials || []}
                         onMaterialAdded={loadModules}
                       />
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

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, PlayCircle, Link as LinkIcon, Check, Lock, ChevronDown, Download } from "lucide-react"
import { curriculumService } from "@/lib/services"
import { motion } from "framer-motion"
import PDFViewer from "@/components/curriculum/PDFViewer"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"

interface StudentCurriculumViewProps {
  specialization: string
  studentUID: string
  title: string
}

export default function StudentCurriculumView({
  specialization,
  studentUID,
  title
}: StudentCurriculumViewProps) {
  const [activations, setActivations] = useState<Record<string, any>>({})
  const [submissions, setSubmissions] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [modules, setModules] = useState<any[]>([])
  const [progress, setProgress] = useState<any>(null)
  const [expandedModule, setExpandedModule] = useState<string | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<any | null>(null)

  useEffect(() => {
    loadCurriculum()
  }, [specialization, studentUID])

  const loadCurriculum = async () => {
    try {
      setLoading(true)
      const { assignmentService } = await import("@/lib/services")
      const [modulesData, progressData, allSubmissions] = await Promise.all([
        curriculumService.getModulesBySpecialization(specialization),
        curriculumService.getStudentProgress(studentUID, specialization),
        getDocs(query(collection(db, "submissions"), where("studentUID", "==", studentUID)))
      ])
      
      const subMap: Record<string, any> = {}
      allSubmissions.docs.forEach(d => {
        const data = d.data()
        subMap[data.assignmentId || data.assignmentRef] = data
      })
      
      setSubmissions(subMap)
      setModules(modulesData)
      setProgress(progressData)

      // Get activations
      const activeMap: Record<string, any> = {}
      for (const m of modulesData) {
        if (m.hasAssignment) {
          // We need assignment ID. Usually it's in the module or we lookup.
          // For simplicity we use moduleId as a proxy if assignmentId isn't on module.
          const act = await assignmentService.getActivation(studentUID, m.id)
          if (act) activeMap[m.id] = act
        }
      }
      setActivations(activeMap)

    } catch (error) {
      console.error("Error loading curriculum:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleModule = async (moduleId: string) => {
    const isOpening = expandedModule !== moduleId
    setExpandedModule(isOpening ? moduleId : null)

    if (isOpening) {
      const module = modules.find(m => m.id === moduleId)
      if (module?.hasAssignment && !activations[moduleId]) {
        try {
          const { assignmentService } = await import("@/lib/services")
          // Use the assignment's own duration logic in activateAssignment
          await assignmentService.activateAssignment(studentUID, moduleId)
          const newAct = await assignmentService.getActivation(studentUID, moduleId)
          if (newAct) setActivations(prev => ({ ...prev, [moduleId]: newAct }))
        } catch (err) {
          console.error("Activation error:", err)
        }
      }
    }
  }

  const isModuleLocked = (index: number) => {
    if (index === 0) return false
    const prevModule = modules[index - 1]
    if (!prevModule.hasAssignment) {
       return !progress?.completedModules?.includes(prevModule.id)
    }
    // Fixed: Must be APPROVED to unlock next
    const sub = submissions[prevModule.id]
    return sub?.status !== 'approved'
  }

  const getDynamicLateStatus = (moduleId: string) => {
    const act = activations[moduleId]
    const sub = submissions[moduleId]
    if (!act?.dueDate || sub?.status === 'approved') return null
    
    const now = new Date().getTime()
    const due = act.dueDate?.toMillis?.() || new Date(act.dueDate).getTime()
    
    if (now > due) {
      const diff = now - due
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      return `${days}d late`
    }
    return null
  }

  const isModuleCompleted = (moduleId: string) => {
    return progress?.completedModules?.includes(moduleId) || false
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'document':
        return <FileText className="h-4 w-4" />
      case 'video':
        return <PlayCircle className="h-4 w-4" />
      case 'link':
        return <LinkIcon className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const openMaterial = (material: any) => {
    if (material.type === 'pdf' || material.type === 'document') {
      if (material.fileUrl) {
        setSelectedMaterial(material)
      }
    } else if (material.type === 'video' && material.videoUrl) {
      window.open(material.videoUrl, '_blank')
    } else if (material.type === 'link' && material.externalLink) {
      window.open(material.externalLink, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400"></div>
      </div>
    )
  }

  const completedCount = modules.filter(m => isModuleCompleted(m.id)).length
  const progressPercent = modules.length > 0 ? (completedCount / modules.length) * 100 : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h2 className="text-3xl font-black">{title}</h2>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-bold">
            <span>Course Progress</span>
            <span className="text-yellow-600">{completedCount} of {modules.length} modules</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-4">
        {modules.length === 0 ? (
          <Card className="border-none shadow-md rounded-[2rem] bg-white p-12 text-center">
            <p className="text-gray-500 font-medium">No modules available yet</p>
          </Card>
        ) : (
          modules.map((module, index) => {
            const isCompleted = isModuleCompleted(module.id)
            const isExpanded = expandedModule === module.id
            const isLocked = isModuleLocked(index)
            const lateValue = getDynamicLateStatus(module.id)

            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card
                  className={`border-none shadow-md rounded-[2.5rem] overflow-hidden transition-all ${
                    isLocked ? 'opacity-60 grayscale-[0.5]' : 'hover:shadow-xl cursor-pointer'
                  } ${isExpanded ? 'ring-2 ring-yellow-400' : ''}`}
                >
                  <CardHeader
                    className="bg-gradient-to-r from-gray-50 to-white p-8"
                    onClick={() => !isLocked && handleToggleModule(module.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-grow text-left">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                            MODULE {module.moduleNumber || index + 1}
                          </span>
                          {isCompleted && (
                            <Badge className="bg-green-100 text-green-700 border-0 text-[10px] font-black px-3">
                              <Check className="h-3 w-3 mr-1" />
                              COMPLETED
                            </Badge>
                          )}
                          {lateValue && (
                            <Badge className="bg-red-100 text-red-600 border-0 text-[10px] font-black px-3 animate-pulse">
                              {lateValue.toUpperCase()}
                            </Badge>
                          )}
                          {isLocked && (
                            <Badge className="bg-gray-100 text-gray-500 border-0 text-[10px] font-black px-3">
                              <Lock className="h-3 w-3 mr-1" />
                              LOCKED
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tighter">
                          {module.title}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {module.topics?.slice(0, 3).map((topic: string) => (
                            <span
                              key={topic}
                              className="text-[10px] font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full uppercase"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        className="text-gray-400 mt-2"
                      >
                        {isLocked ? <Lock className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                      </motion.div>
                    </div>
                  </CardHeader>

                  {isExpanded && !isLocked && (
                    <CardContent className="p-10 space-y-10 border-t border-gray-100 bg-white text-left">
                      {/* Module Description */}
                      {module.description && (
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Strategic Overview</h4>
                          <p className="text-gray-600 font-medium leading-relaxed">{module.description}</p>
                        </div>
                      )}

                      {/* Learning Materials */}
                      {module.learningMaterials && module.learningMaterials.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Class Intelligence</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {module.learningMaterials.map((material: any) => (
                              <motion.div
                                key={material.id}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => openMaterial(material)}
                                className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-lg transition-all cursor-pointer group"
                              >
                                <div className="p-3 bg-white rounded-xl shadow-sm group-hover:bg-yellow-400 group-hover:text-black transition-colors">
                                  {getFileIcon(material.type)}
                                </div>
                                <div className="flex-grow">
                                  <h5 className="font-black text-gray-900 text-sm">{material.title}</h5>
                                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                                    {material.type} • {material.fileSize ? (material.fileSize / 1024 / 1024).toFixed(1) + 'MB' : 'Protocol Link'}
                                  </p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Assignment Section */}
                      {module.hasAssignment && (
                        <div className="pt-6 border-t border-gray-100">
                          <div className="flex justify-between items-center mb-4">
                             <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Tactical Assignment</h4>
                             {activations[module.id] && (
                               <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">
                                 Due: {new Date(activations[module.id].dueDate?.toMillis?.() || activations[module.id].dueDate).toLocaleDateString()}
                               </span>
                             )}
                          </div>
                          <Card className={`border-2 p-8 rounded-[2rem] transition-all ${submissions[module.id]?.status === 'approved' ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
                            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                               <div className="text-left">
                                  <p className={`text-xs font-black uppercase tracking-widest mb-2 ${submissions[module.id]?.status === 'approved' ? 'text-green-600' : 'text-yellow-700'}`}>
                                     {submissions[module.id]?.status === 'approved' ? 'Mission Success' : 'Deployment Ready'}
                                  </p>
                                  <p className="text-sm font-medium text-gray-700">
                                     {submissions[module.id]?.status === 'approved' 
                                       ? "This project has been validated. You have been cleared for the next module."
                                       : "An assignment is active for this module. You must be approved by a tutor to unlock subsequent modules."}
                                  </p>
                               </div>
                               <Button 
                                 onClick={() => window.location.href = '/student/assignments'}
                                 className={`${submissions[module.id]?.status === 'approved' ? 'bg-green-600' : 'bg-black'} text-white font-black px-8 h-12 rounded-xl text-[10px] tracking-widest uppercase hover:scale-105 transition-all`}
                               >
                                 {submissions[module.id]?.status === 'approved' ? 'View Result' : 'Access Assignment'}
                               </Button>
                            </div>
                          </Card>
                        </div>
                      )}

                      {/* Mark Complete Button */}
                      {!module.hasAssignment && (
                        <div className="pt-6 border-t border-gray-100">
                          <Button
                            onClick={() => {
                              curriculumService.updateModuleProgress(studentUID, specialization, module.id)
                              loadCurriculum()
                            }}
                            className={`w-full font-black h-14 rounded-2xl text-[10px] tracking-widest uppercase transition-all ${
                              isCompleted
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : 'bg-yellow-400 text-black hover:bg-black hover:text-white'
                            }`}
                          >
                            {isCompleted ? 'Module Clearance Granted' : 'Request Module Completion'}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            )
          })
        )}
      </div>

      {selectedMaterial && (
        <PDFViewer 
          fileUrl={selectedMaterial.fileUrl}
          fileName={selectedMaterial.title || selectedMaterial.fileName || "Document"}
          onClose={() => setSelectedMaterial(null)}
        />
      )}
    </div>
  )
}

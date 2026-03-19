"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, PlayCircle, Link as LinkIcon, Check, Lock, ChevronDown, Download } from "lucide-react"
import { curriculumService } from "@/lib/services"
import { motion } from "framer-motion"
import PDFViewer from "@/components/curriculum/PDFViewer"

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
  const [modules, setModules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedModule, setExpandedModule] = useState<string | null>(null)
  const [progress, setProgress] = useState<any>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null)

  useEffect(() => {
    loadCurriculum()
  }, [specialization, studentUID])

  const loadCurriculum = async () => {
    try {
      setLoading(true)
      const [modulesData, progressData] = await Promise.all([
        curriculumService.getModulesBySpecialization(specialization),
        curriculumService.getStudentProgress(studentUID, specialization)
      ])
      setModules(modulesData)
      setProgress(progressData)
    } catch (error) {
      console.error("Error loading curriculum:", error)
    } finally {
      setLoading(false)
    }
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

            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card
                  className={`border-none shadow-md rounded-[2rem] overflow-hidden transition-all cursor-pointer hover:shadow-lg ${
                    isExpanded ? 'ring-2 ring-yellow-400' : ''
                  }`}
                >
                  <CardHeader
                    className="bg-gradient-to-r from-gray-50 to-white p-6"
                    onClick={() =>
                      setExpandedModule(isExpanded ? null : module.id)
                    }
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-black">
                            MODULE {module.moduleNumber || index + 1}
                          </span>
                          {isCompleted && (
                            <Badge className="bg-green-100 text-green-700 border-0">
                              <Check className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                          {module.isBonusModule && (
                            <Badge className="bg-purple-100 text-purple-700 border-0">
                              Bonus
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">
                          {module.title}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {module.topics?.slice(0, 3).map((topic: string) => (
                            <span
                              key={topic}
                              className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                            >
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
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        className="text-gray-400 mt-2"
                      >
                        <ChevronDown className="h-6 w-6" />
                      </motion.div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="p-8 space-y-8 border-t border-gray-200">
                      {/* Module Description */}
                      {module.description && (
                        <div>
                          <h4 className="font-bold text-gray-900 mb-2">About This Module</h4>
                          <p className="text-gray-600">{module.description}</p>
                        </div>
                      )}

                      {/* Learning Materials */}
                      {module.learningMaterials && module.learningMaterials.length > 0 && (
                        <div>
                          <h4 className="font-bold text-gray-900 mb-4">Learning Materials</h4>
                          <div className="space-y-3">
                            {module.learningMaterials.map((material: any) => (
                              <motion.div
                                key={material.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={() => openMaterial(material)}
                                className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                              >
                                <div className="text-gray-400 mt-1">
                                  {getFileIcon(material.type)}
                                </div>
                                <div className="flex-grow">
                                  <h5 className="font-bold text-gray-900">{material.title}</h5>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {material.description}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {material.type}
                                    </Badge>
                                    {material.fileSize && (
                                      <span className="text-xs text-gray-400">
                                        {(material.fileSize / 1024 / 1024).toFixed(2)} MB
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  className="bg-yellow-400 text-black font-bold rounded-lg flex items-center gap-2"
                                >
                                  View
                                  <ChevronDown className="h-3 w-3 rotate-90" />
                                </Button>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Assignment Section */}
                      {module.hasAssignment && (
                        <div className="border-t pt-6">
                          <h4 className="font-bold text-gray-900 mb-4">Module Assignment</h4>
                          <Card className="border-2 border-green-200 bg-green-50 p-4">
                            <p className="text-sm text-green-700 font-medium">
                              📝 An assignment is available for this module. Check the Assignments section to submit your work.
                            </p>
                            <Button className="mt-4 bg-green-500 text-white font-bold rounded-lg">
                              View Assignment
                            </Button>
                          </Card>
                        </div>
                      )}

                      {/* Mark Complete Button */}
                      <div className="border-t pt-6">
                        <Button
                          onClick={() => curriculumService.updateModuleProgress(studentUID, specialization, module.id)}
                          className={`w-full font-bold h-12 rounded-xl transition-all ${
                            isCompleted
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-yellow-400 text-black hover:bg-yellow-500'
                          }`}
                        >
                          {isCompleted ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Module Completed
                            </>
                          ) : (
                            'Mark as Complete'
                          )}
                        </Button>
                      </div>
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

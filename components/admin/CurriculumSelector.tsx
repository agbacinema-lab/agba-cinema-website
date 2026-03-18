"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { BookOpen, Edit2, Trash2, ArrowRight, Zap, Users } from "lucide-react"
import { curriculumService } from "@/lib/services"
import { motion } from "framer-motion"

interface CurriculumSelectorProps {
  onSelectCurriculum: (curriculumId: string) => void
  filter?: 'gopro' | 'mentorship' | 'all'
  specializationFilter?: string
}

// Specialization labels are fetched dynamically

const PROGRAM_TYPE_LABELS: Record<string, string> = {
  gopro: 'Go Pro Program',
  mentorship: 'Mentorship Program',
}

export default function CurriculumSelector({
  onSelectCurriculum,
  filter = 'all',
  specializationFilter
}: CurriculumSelectorProps) {
  const [curricula, setCurricula] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [specializationMap, setSpecializationMap] = useState<Record<string, string>>({})

  useEffect(() => {
    // Fetch specializations to map values to labels
    import("@/lib/services").then(({ specializationService }) => {
      specializationService.getAllSpecializations()
        .then(data => {
          const map: Record<string, string> = {}
          data.forEach((s: any) => map[s.value] = s.label)
          setSpecializationMap(map)
        })
        .catch(console.error)
    })
  }, [])

  useEffect(() => {
    loadCurricula()
  }, [filter, specializationFilter])

  const loadCurricula = async () => {
    try {
      setLoading(true)
      let data
      if (filter === 'all') {
        data = await curriculumService.getAllCurricula()
      } else {
        data = await curriculumService.getCurriculaByProgram(filter)
      }

      if (specializationFilter) {
        data = data.filter((c: any) => c.specialization === specializationFilter)
      }

      setCurricula(data)
    } catch (error) {
      console.error("Error loading curricula:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (curriculumId: string) => {
    try {
      await curriculumService.deleteCurriculum(curriculumId)
      loadCurricula()
    } catch (error) {
      alert("Failed to delete curriculum")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400"></div>
      </div>
    )
  }

  if (curricula.length === 0) {
    return (
      <Card className="border-none shadow-premium rounded-[2.5rem] bg-white p-12 text-center">
        <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500 font-medium">No curriculum (weeks) available</p>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {curricula.map((curriculum, index) => {
        const bgColorMap: Record<string, string> = {
          blue: 'from-blue-50 to-blue-100',
          purple: 'from-purple-50 to-purple-100',
          green: 'from-green-50 to-green-100',
          yellow: 'from-yellow-50 to-yellow-100',
          red: 'from-red-50 to-red-100',
          pink: 'from-pink-50 to-pink-100',
          indigo: 'from-indigo-50 to-indigo-100',
        }
        const bgGradient = bgColorMap[curriculum.color] || 'from-gray-50 to-gray-100'

        return (
          <motion.div
            key={curriculum.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`border-none shadow-md rounded-[2rem] overflow-hidden hover:shadow-lg transition-all group bg-gradient-to-br ${bgGradient}`}>
              <CardHeader className="pb-3">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {curriculum.programType === 'gopro' ? (
                      <Badge className="bg-yellow-500 text-white border-0 flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        Go Pro
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-500 text-white border-0 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Mentorship
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {specializationMap[curriculum.specialization] || curriculum.specialization}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-black text-gray-900 leading-tight">
                    {curriculum.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {curriculum.description}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/60 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 font-bold">Modules (Days)</p>
                    <p className="text-2xl font-black text-gray-900">
                      {curriculum.moduleCount || 0}
                    </p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 font-bold">Program</p>
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {curriculum.programType === 'gopro' ? 'Pro' : 'Mentor'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => onSelectCurriculum(curriculum.id)}
                    className="flex-1 bg-yellow-400 text-black font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-yellow-500"
                  >
                    View
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogTitle>Delete Curriculum (Week)</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{curriculum.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                      <div className="flex gap-4 justify-end">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(curriculum.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

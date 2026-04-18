"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { BookOpen, Edit2, Trash2, ArrowRight, Zap, Users } from "lucide-react"
import { curriculumService } from "@/lib/services"
import { useAuth } from "@/context/AuthContext"
import { motion } from "framer-motion"
import { toast } from "sonner"

interface CurriculumSelectorProps {
  onSelectCurriculum: (curriculum: any) => void
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
  const { profile, isSuperAdmin } = useAuth()
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
  }, [filter, specializationFilter, profile])

  const loadCurricula = async () => {
    try {
      setLoading(true)
      let data
      if (filter === 'all') {
        data = await curriculumService.getAllCurricula()
      } else {
        data = await curriculumService.getCurriculaByProgram(filter)
      }

      // Hardcode restriction for tutors/staff if they have a specialization assigned
      if (profile && !isSuperAdmin && (profile as any).specialization) {
         data = data.filter((c: any) => c.specialization === (profile as any).specialization)
      } else if (specializationFilter) {
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
      toast.success("Curriculum deleted")
      loadCurricula()
    } catch (error) {
      toast.error("Failed to delete curriculum")
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
      <Card className="border-none shadow-premium rounded-[2.5rem] bg-card p-12 text-center">
        <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
        <p className="text-muted-foreground font-medium">No curriculum (weeks) available</p>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {curricula.map((curriculum, index) => {
        const bgColorMap: Record<string, string> = {
          blue: 'from-blue-500/10 to-transparent border-blue-500/20',
          purple: 'from-purple-500/10 to-transparent border-purple-500/20',
          green: 'from-green-500/10 to-transparent border-green-500/20',
          yellow: 'from-yellow-500/10 to-transparent border-yellow-500/20',
          red: 'from-red-500/10 to-transparent border-red-500/20',
          pink: 'from-pink-500/10 to-transparent border-pink-500/20',
          indigo: 'from-indigo-500/10 to-transparent border-indigo-500/20',
        }
        const bgGradient = bgColorMap[curriculum.color] || 'from-muted/50 to-transparent border-muted'

        return (
          <motion.div
            key={curriculum.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`border shadow-premium rounded-[2rem] overflow-hidden hover:scale-[1.02] transition-all group bg-card ${bgGradient}`}>
              <CardHeader className="pb-3 text-left">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {curriculum.programType === 'gopro' ? (
                      <Badge className="bg-yellow-400 text-black border-0 flex items-center gap-1 font-black text-[10px] tracking-widest">
                        <Zap className="h-3 w-3" />
                        Go pro
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-600 text-white border-0 flex items-center gap-1 font-black text-[10px] tracking-widest">
                        <Users className="h-3 w-3" />
                        Mentorship
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px] font-black border-muted-foreground/30">
                      {specializationMap[curriculum.specialization] || curriculum.specialization}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-black text-foreground leading-tight tracking-tighter">
                    {curriculum.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {curriculum.description}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 text-left">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/30 rounded-lg p-3 text-center border border-muted-foreground/10">
                    <p className="text-xs text-muted-foreground font-black tracking-widest">Modules (days)</p>
                    <p className="text-2xl font-black text-foreground tracking-tighter">
                      {curriculum.moduleCount || 0}
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center border border-muted-foreground/10">
                    <p className="text-xs text-muted-foreground font-black tracking-widest">Program</p>
                    <p className="text-sm font-black text-foreground truncate uppercase tracking-tighter pt-1">
                      {curriculum.programType === 'gopro' ? 'Pro' : 'Mentor'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                   <Button
                    onClick={() => onSelectCurriculum(curriculum)}
                    className="flex-1 bg-foreground text-background font-black text-[10px] tracking-widest rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-400 hover:text-black transition-all"
                  >
                    View weeks
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

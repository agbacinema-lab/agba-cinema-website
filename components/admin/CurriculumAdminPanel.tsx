"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Zap, Users, BookOpen } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/context/AuthContext"
import CurriculumCreator from "./CurriculumCreator"
import CurriculumSelector from "./CurriculumSelector"
import CurriculumManager from "./CurriculumManager"
import SpecializationManager from "./SpecializationManager"

export default function CurriculumAdminPanel() {
  const { profile, isSuperAdmin } = useAuth()
  const [view, setView] = useState<'programs' | 'specializations' | 'curricula' | 'modules'>('programs')
  const [selectedProgram, setSelectedProgram] = useState<'gopro' | 'mentorship' | null>(null)
  const isRestricted = !!(profile && !isSuperAdmin && (profile as any).specialization)

  // Restriction logic: if they are restricted to a course, we should auto-select their program type
  useEffect(() => {
    const checkRestriction = async () => {
      if (isRestricted) {
        const { specializationService } = await import("@/lib/services")
        const specs = await specializationService.getAllSpecializations()
        const mySpec = specs.find((s:any) => s.value === (profile as any).specialization)
        if (mySpec) {
          setSelectedProgram(mySpec.programType)
          setView('specializations')
        }
      }
    }
    checkRestriction()
  }, [profile, isRestricted, isSuperAdmin])

  const [selectedSpecialization, setSelectedSpecialization] = useState<any>(null)
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string | null>(null)
  const [curriculumData, setCurriculumData] = useState<any>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Handlers for Drill-Down
  const handleSelectProgram = (program: 'gopro' | 'mentorship') => {
    setSelectedProgram(program)
    setView('specializations')
  }

  const handleManageSpecialization = (spec: any) => {
    setSelectedSpecialization(spec)
    setView('curricula')
  }

  const handleSelectCurriculum = async (curriculumId: string) => {
    setSelectedCurriculumId(curriculumId)
    import("@/lib/services").then(({ curriculumService }) => {
      curriculumService.getCurriculumById(curriculumId).then(data => {
        if (data) setCurriculumData(data)
        setView('modules')
      })
    })
  }

  const handleCurriculumCreated = () => {
    setRefreshKey(prev => prev + 1)
  }

  // Back Navigation
  const goBackFromSpecializations = () => {
    if (isRestricted) return
    setSelectedProgram(null)
    setView('programs')
  }

  const goBackFromCurricula = () => {
    setSelectedSpecialization(null)
    setView('specializations')
  }

  const goBackFromModules = () => {
    setSelectedCurriculumId(null)
    setCurriculumData(null)
    setView('curricula')
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="space-y-8">
      {/* Header logic adjusts based on depth */}
      <div>
        <h2 className="text-2xl font-black mb-2">Course builder</h2>
        <p className="text-gray-500 font-medium">
          {view === 'programs' && "Select a program to manage"}
          {view === 'specializations' && "Manage specializations"}
          {view === 'curricula' && `Managing curriculum weeks for ${selectedSpecialization?.label}`}
          {view === 'modules' && `Managing daily modules for ${curriculumData?.title}`}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* LEVEL 1: PROGRAMS */}
        {view === 'programs' && (
          <motion.div
            key="programs"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <Card className="border-none shadow-premium bg-card hover:scale-[1.02] transition-transform cursor-pointer" onClick={() => handleSelectProgram('gopro')}>
              <CardContent className="p-12 text-left space-y-4 flex flex-col items-start">
                <div className="bg-yellow-500/10 p-6 rounded-3xl">
                  <Zap className="h-12 w-12 text-yellow-500" />
                </div>
                <h3 className="text-xl font-black text-foreground">Go pro program</h3>
                <p className="text-muted-foreground">Manage laptops, mobile, and specific technical tools specializations.</p>
                <Button className="mt-4 bg-yellow-400 text-black font-black h-12 px-8 rounded-full">
                  Edit content
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-premium bg-card hover:scale-[1.02] transition-transform cursor-pointer" onClick={() => handleSelectProgram('mentorship')}>
              <CardContent className="p-12 text-left space-y-4 flex flex-col items-start">
                <div className="bg-blue-500/10 p-6 rounded-3xl">
                  <Users className="h-12 w-12 text-blue-500" />
                </div>
                <h3 className="text-xl font-black text-foreground">Mentorship program</h3>
                <p className="text-muted-foreground">Manage storytelling, script writing, and cinematic strategy.</p>
                <Button className="mt-4 bg-blue-600 text-white font-black h-12 px-8 rounded-full hover:bg-blue-700">
                  Edit content
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* LEVEL 2: SPECIALIZATIONS */}
        {view === 'specializations' && (
          <motion.div
            key="specializations"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Button onClick={goBackFromSpecializations} variant="outline" className="rounded-lg">
              ← Back to programs
            </Button>
            <div className="bg-card p-8 rounded-[2.5rem] shadow-premium text-left">
              <SpecializationManager 
                programFilter={selectedProgram as 'gopro' | 'mentorship'} 
                onManageSpecialization={handleManageSpecialization}
              />
            </div>
          </motion.div>
        )}

        {/* LEVEL 3: CURRICULA (WEEKS) */}
        {view === 'curricula' && (
          <motion.div
            key="curricula"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <Button onClick={goBackFromCurricula} variant="outline" className="rounded-lg">
                ← Back to specializations
              </Button>
              <CurriculumCreator 
                onCurriculumCreated={handleCurriculumCreated} 
                defaultProgramType={selectedProgram as 'gopro' | 'mentorship'}
                defaultSpecialization={selectedSpecialization?.value}
              />
            </div>
            
            <div key={refreshKey}>
              {/* Only show curriculum matching this specialization */}
              <CurriculumSelector
                onSelectCurriculum={handleSelectCurriculum}
                filter={selectedProgram as 'gopro' | 'mentorship'}
                // Actually filter by specialization value visually inside Selector or pass it down.
                specializationFilter={selectedSpecialization?.value}
              />
            </div>
          </motion.div>
        )}

        {/* LEVEL 4: MODULES (DAYS) */}
        {view === 'modules' && selectedCurriculumId && curriculumData && (
          <motion.div
            key="modules"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Button onClick={goBackFromModules} variant="outline" className="mb-6 rounded-lg">
              ← Back to curriculum weeks
            </Button>
            <CurriculumManager
              curriculumId={selectedCurriculumId}
              curriculumTitle={curriculumData.title}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

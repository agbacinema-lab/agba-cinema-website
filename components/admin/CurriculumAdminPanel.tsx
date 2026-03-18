"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Zap, Users, BookOpen } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import CurriculumCreator from "./CurriculumCreator"
import CurriculumSelector from "./CurriculumSelector"
import CurriculumManager from "./CurriculumManager"
import SpecializationManager from "./SpecializationManager"

export default function CurriculumAdminPanel() {
  const [view, setView] = useState<'programs' | 'specializations' | 'curricula' | 'modules'>('programs')
  const [selectedProgram, setSelectedProgram] = useState<'gopro' | 'mentorship' | null>(null)
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
        <h2 className="text-3xl font-black mb-2">Course Builder</h2>
        <p className="text-gray-500 font-medium">
          {view === 'programs' && "Select a program to manage"}
          {view === 'specializations' && "Manage Specializations"}
          {view === 'curricula' && `Managing Curriculum Weeks for ${selectedSpecialization?.label}`}
          {view === 'modules' && `Managing Daily Modules for ${curriculumData?.title}`}
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
            <Card className="border-none shadow-premium bg-white hover:scale-[1.02] transition-transform cursor-pointer" onClick={() => handleSelectProgram('gopro')}>
              <CardContent className="p-12 text-center space-y-4 flex flex-col items-center">
                <div className="bg-yellow-100 p-6 rounded-3xl">
                  <Zap className="h-12 w-12 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">Go Pro Program</h3>
                <p className="text-gray-500">Manage laptops, mobile, and specific technical tools specializations.</p>
                <Button className="mt-4 bg-yellow-400 text-black font-bold h-12 px-8 rounded-full">
                  Edit Content
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-premium bg-white hover:scale-[1.02] transition-transform cursor-pointer" onClick={() => handleSelectProgram('mentorship')}>
              <CardContent className="p-12 text-center space-y-4 flex flex-col items-center">
                <div className="bg-blue-100 p-6 rounded-3xl">
                  <Users className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">Mentorship Program</h3>
                <p className="text-gray-500">Manage storytelling, script writing, and cinematic strategy.</p>
                <Button className="mt-4 bg-blue-600 text-white font-bold h-12 px-8 rounded-full hover:bg-blue-700">
                  Edit Content
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
              ← Back to Programs
            </Button>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-premium">
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
                ← Back to Specializations
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
              ← Back to Curriculum Weeks
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

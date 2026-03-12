"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Zap, Users } from "lucide-react"
import { motion } from "framer-motion"
import CurriculumCreator from "./CurriculumCreator"
import CurriculumSelector from "./CurriculumSelector"
import CurriculumManager from "./CurriculumManager"

export default function CurriculumAdminPanel() {
  const [view, setView] = useState<'selector' | 'manager'>('selector')
  const [selectedCurriculum, setSelectedCurriculum] = useState<string | null>(null)
  const [curriculumData, setCurriculumData] = useState<any>(null)
  const [filter, setFilter] = useState<'gopro' | 'mentorship' | 'all'>('all')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSelectCurriculum = async (curriculumId: string) => {
    setSelectedCurriculum(curriculumId)
    // You could fetch curriculum data here
    setView('manager')
  }

  const handleBack = () => {
    setSelectedCurriculum(null)
    setView('selector')
    setRefreshKey(prev => prev + 1)
  }

  const handleCurriculumCreated = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="space-y-8">
      {view === 'selector' ? (
        <>
          {/* Header */}
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-black mb-2">Curriculum Management</h2>
                <p className="text-gray-500 font-medium">Create and manage curricula for different programs and specializations</p>
              </div>
              <div className="flex gap-3">
                <Button
                  disabled
                  className="bg-gray-300 text-gray-700 font-bold h-14 px-6 rounded-2xl flex items-center gap-2 cursor-not-allowed"
                >
                  🎬 Getting Physical
                  <span className="ml-2 px-3 py-1 bg-gray-700 text-gray-100 text-xs font-black rounded-full">
                    Coming Soon
                  </span>
                </Button>
                <CurriculumCreator onCurriculumCreated={handleCurriculumCreated} />
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-full font-bold transition-all ${
                  filter === 'all'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Programs
              </button>
              <button
                onClick={() => setFilter('gopro')}
                className={`px-4 py-2 rounded-full font-bold transition-all flex items-center gap-2 ${
                  filter === 'gopro'
                    ? 'bg-yellow-400 text-black'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Zap className="h-4 w-4" />
                Go Pro
              </button>
              <button
                onClick={() => setFilter('mentorship')}
                className={`px-4 py-2 rounded-full font-bold transition-all flex items-center gap-2 ${
                  filter === 'mentorship'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Users className="h-4 w-4" />
                Mentorship
              </button>
            </div>
          </div>

          {/* Curriculum Grid */}
          <motion.div
            key={refreshKey}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CurriculumSelector
              onSelectCurriculum={handleSelectCurriculum}
              filter={filter}
            />
          </motion.div>
        </>
      ) : (
        <>
          {/* Manager View */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Button
              onClick={handleBack}
              variant="outline"
              className="mb-6 rounded-lg"
            >
              ← Back to Curricula
            </Button>
            {selectedCurriculum && (
              <CurriculumManager
                specialization="video-editing-laptop"
                specialized="Video Editing - Laptop"
              />
            )}
          </motion.div>
        </>
      )}
    </div>
  )
}

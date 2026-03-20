"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X, Zap, Users, Upload, Trash2, Lock } from "lucide-react"
import { curriculumService } from "@/lib/services"
import { getStorage } from "firebase/storage"
import { motion } from "framer-motion"
import { toast } from "sonner"

interface CurriculumCreatorProps {
  onCurriculumCreated: () => void
  defaultProgramType?: 'gopro' | 'mentorship'
  defaultSpecialization?: string
}

// Specializations are now fetched dynamically from the database

const COLORS = ['blue', 'purple', 'green', 'yellow', 'red', 'pink', 'indigo']

export default function CurriculumCreator({ 
  onCurriculumCreated,
  defaultProgramType,
  defaultSpecialization
}: CurriculumCreatorProps) {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [programType, setProgramType] = useState<'gopro' | 'mentorship'>(defaultProgramType || 'gopro')
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    specialization: defaultSpecialization || "",
    color: "blue"
  })
  const [dbSpecializations, setDbSpecializations] = useState<any[]>([])

  useEffect(() => {
    if (defaultSpecialization) return; // Skip fetching if locked to a specialization
    
    // Fetch specializations from the database
    import("@/lib/services").then(({ specializationService }) => {
      specializationService.getAllSpecializations()
        .then(data => setDbSpecializations(data))
        .catch(console.error)
    })
  }, [defaultSpecialization])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.specialization || !formData.description) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
      
      await curriculumService.createCurriculum({
        title: formData.title,
        description: formData.description,
        programType,
        specialization: formData.specialization,
        color: formData.color,
        createdBy: "admin"
      })
      toast.success("Curriculum created successfully!")
      resetForm()
      onCurriculumCreated()
    } catch (error) {
      console.error("Error creating curriculum:", error)
      toast.error("Failed to create curriculum")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ 
      title: "", 
      description: "", 
      specialization: defaultSpecialization || "", 
      color: "blue" 
    })
    setProgramType(defaultProgramType || 'gopro')
    setShowForm(false)
  }

  const currentSpecializations = dbSpecializations.filter(s => s.programType === programType)

  return (
    <div className="space-y-6">
      {!showForm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-yellow-400 text-black font-bold h-14 px-6 rounded-2xl flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Curriculum (Week)
          </Button>
        </motion.div>
      )}

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-none shadow-premium rounded-[2.5rem] bg-card p-12 text-left">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black">Add curriculum (week)</h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Optional Program Type Selection (Hidden if locked) */}
              {!defaultProgramType && (
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Program Type *
                  </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setProgramType('gopro')
                      setFormData({ ...formData, specialization: '' })
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2 ${
                      programType === 'gopro'
                        ? 'border-yellow-400 bg-yellow-400 text-black shadow-lg shadow-yellow-400/20'
                        : 'border-muted bg-background text-muted-foreground'
                    }`}
                  >
                    <Zap className="h-5 w-5" />
                    Go pro
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProgramType('mentorship')
                      setFormData({ ...formData, specialization: '' })
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2 ${
                      programType === 'mentorship'
                        ? 'border-yellow-400 bg-yellow-400 text-black shadow-lg shadow-yellow-400/20'
                        : 'border-muted bg-background text-muted-foreground'
                    }`}
                  >
                    <Users className="h-5 w-5" />
                    Mentorship
                  </button>
                  </div>
                </div>
              )}

              {/* Optional Specialization (Hidden if locked) */}
              {!defaultSpecialization && (
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Specialization *
                  </label>
                  <select
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border border-muted-foreground/30 bg-background text-foreground focus:ring-2 focus:ring-yellow-400 focus:outline-none appearance-none"
                  >
                    <option value="" className="bg-card text-foreground">Select specialization</option>
                    {currentSpecializations.map((spec) => (
                      <option key={spec.value} value={spec.value} className="bg-card text-foreground">
                        {spec.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Title */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Curriculum Title (e.g. Week 1: Premiere Basics) *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Week 1: Introduction to Premiere Pro"
                  className="h-12 rounded-xl border-gray-200"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Description *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe everything that will be taught this week"
                  className="min-h-24 rounded-xl border-gray-200"
                />
              </div>

              {/* Color Theme */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Color Theme
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`h-10 rounded-lg border-2 transition-all ${
                        formData.color === color
                          ? `border-${color}-600 ring-2 ring-${color}-400`
                          : 'border-gray-200 hover:border-gray-300'
                      } bg-${color}-100`}
                      title={color}
                    />
                  ))}
                </div>
              </div>



              <div className="flex gap-4 pt-6 border-t">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-yellow-400 text-black font-black h-14 rounded-2xl"
                >
                  {loading ? "Creating..." : "Add Curriculum"}
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
    </div>
  )
}

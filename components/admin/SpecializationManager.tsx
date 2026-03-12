"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Plus, Trash2, Edit2, X, Zap, Users } from "lucide-react"
import { specializationService } from "@/lib/services"
import { motion } from "framer-motion"

export default function SpecializationManager() {
  const [specializations, setSpecializations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [programType, setProgramType] = useState<'gopro' | 'mentorship'>('gopro')
  const [formData, setFormData] = useState({
    label: "",
    value: "",
    description: "",
    color: "#FCD34D",
  })

  useEffect(() => {
    loadSpecializations()
  }, [])

  const loadSpecializations = async () => {
    try {
      setLoading(true)
      const data = await specializationService.getAllSpecializations()
      setSpecializations(data)
    } catch (error) {
      console.error("Error loading specializations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.label || !formData.value) {
      alert("Please fill in label and value")
      return
    }

    try {
      const data = {
        label: formData.label,
        value: formData.value,
        description: formData.description,
        programType,
        color: formData.color,
      }

      if (editingId) {
        await specializationService.updateSpecialization(editingId, data)
        alert("Specialization updated!")
      } else {
        await specializationService.createSpecialization(data)
        alert("Specialization created!")
      }

      resetForm()
      loadSpecializations()
    } catch (error) {
      alert("Error: " + (error as any).message)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await specializationService.deleteSpecialization(id)
      loadSpecializations()
    } catch (error) {
      alert("Error deleting specialization")
    }
  }

  const handleEdit = (spec: any) => {
    setEditingId(spec.id)
    setProgramType(spec.programType)
    setFormData({
      label: spec.label,
      value: spec.value,
      description: spec.description || "",
      color: spec.color || "#FCD34D",
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({ label: "", value: "", description: "", color: "#FCD34D" })
    setEditingId(null)
    setShowForm(false)
    setProgramType('gopro')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400"></div>
      </div>
    )
  }

  const goproSpecs = specializations.filter(s => s.programType === 'gopro')
  const mentorshipSpecs = specializations.filter(s => s.programType === 'mentorship')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black">Specializations</h2>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-yellow-400 text-black font-bold h-14 px-6 rounded-2xl flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Specialization
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-none shadow-premium rounded-[2.5rem] bg-white p-12">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black">
                {editingId ? "Edit Specialization" : "Add New Specialization"}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Program Type */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Program Type *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setProgramType('gopro')}
                    className={`p-4 rounded-2xl border-2 transition-all font-bold flex items-center gap-2 ${
                      programType === 'gopro'
                        ? 'border-yellow-400 bg-yellow-50 text-black'
                        : 'border-gray-200 bg-white text-gray-600'
                    }`}
                  >
                    <Zap className="h-5 w-5" />
                    Go Pro
                  </button>
                  <button
                    type="button"
                    onClick={() => setProgramType('mentorship')}
                    className={`p-4 rounded-2xl border-2 transition-all font-bold flex items-center gap-2 ${
                      programType === 'mentorship'
                        ? 'border-yellow-400 bg-yellow-50 text-black'
                        : 'border-gray-200 bg-white text-gray-600'
                    }`}
                  >
                    <Users className="h-5 w-5" />
                    Mentorship
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Label *
                  </label>
                  <Input
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="e.g., Video Editing - Laptop"
                    className="h-12 rounded-xl border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Value *
                  </label>
                  <Input
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    placeholder="e.g., video-editing-laptop"
                    className="h-12 rounded-xl border-gray-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  className="min-h-20 rounded-xl border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Color
                </label>
                <div className="flex items-center gap-4">
                  <Input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="h-12 w-20 rounded-xl border-gray-200 cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">{formData.color}</span>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t">
                <Button type="submit" className="flex-1 bg-yellow-400 text-black font-black h-14 rounded-2xl">
                  {editingId ? "Update" : "Add"} Specialization
                </Button>
                <Button type="button" onClick={resetForm} variant="outline" className="flex-1 h-14 rounded-2xl">
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Go Pro Specializations */}
      <div>
        <h3 className="text-lg font-black mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Go Pro Specializations ({goproSpecs.length})
        </h3>
        <div className="space-y-3">
          {goproSpecs.length === 0 ? (
            <Card className="border-none shadow-sm rounded-xl bg-gray-50 p-6 text-center">
              <p className="text-gray-500 font-medium">No Go Pro specializations added</p>
            </Card>
          ) : (
            goproSpecs.map((spec) => (
              <motion.div key={spec.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="border-none shadow-sm rounded-xl hover:shadow-md transition-shadow p-4">
                  <CardContent className="p-0 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-6 h-6 rounded-full flex-shrink-0"
                        style={{ backgroundColor: spec.color }}
                      ></div>
                      <div>
                        <p className="font-bold text-gray-900">{spec.label}</p>
                        <p className="text-xs text-gray-500">{spec.value}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEdit(spec)}
                        size="sm"
                        variant="outline"
                        className="rounded-lg"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive" className="rounded-lg">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogTitle>Delete Specialization</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure? This will affect all assignments and curricula using this specialization.
                          </AlertDialogDescription>
                          <div className="flex gap-4 justify-end">
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(spec.id)}
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
            ))
          )}
        </div>
      </div>

      {/* Mentorship Specializations */}
      <div>
        <h3 className="text-lg font-black mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Mentorship Specializations ({mentorshipSpecs.length})
        </h3>
        <div className="space-y-3">
          {mentorshipSpecs.length === 0 ? (
            <Card className="border-none shadow-sm rounded-xl bg-gray-50 p-6 text-center">
              <p className="text-gray-500 font-medium">No Mentorship specializations added</p>
            </Card>
          ) : (
            mentorshipSpecs.map((spec) => (
              <motion.div key={spec.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="border-none shadow-sm rounded-xl hover:shadow-md transition-shadow p-4">
                  <CardContent className="p-0 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-6 h-6 rounded-full flex-shrink-0"
                        style={{ backgroundColor: spec.color }}
                      ></div>
                      <div>
                        <p className="font-bold text-gray-900">{spec.label}</p>
                        <p className="text-xs text-gray-500">{spec.value}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEdit(spec)}
                        size="sm"
                        variant="outline"
                        className="rounded-lg"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive" className="rounded-lg">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogTitle>Delete Specialization</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure? This will affect all assignments and curricula using this specialization.
                          </AlertDialogDescription>
                          <div className="flex gap-4 justify-end">
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(spec.id)}
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
            ))
          )}
        </div>
      </div>
    </div>
  )
}

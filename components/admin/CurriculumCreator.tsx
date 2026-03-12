"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X, Zap, Users, Upload, Trash2, Lock } from "lucide-react"
import { curriculumService } from "@/lib/services"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { motion } from "framer-motion"

interface CurriculumCreatorProps {
  onCurriculumCreated: () => void
}

const SPECIALIZATIONS = {
  gopro: [
    { value: 'video-editing-laptop', label: 'Video Editing - Laptop' },
    { value: 'video-editing-mobile', label: 'Video Editing - Mobile' },
    { value: 'after-effects', label: 'After Effects' },
  ],
  mentorship: [
    { value: 'video-editing-laptop', label: 'Video Editing - Laptop' },
    { value: 'motion-design', label: 'Motion Design' },
    { value: 'script-writing', label: 'Script Writing' },
    { value: 'storytelling', label: 'Storytelling' },
  ]
}

const COLORS = ['blue', 'purple', 'green', 'yellow', 'red', 'pink', 'indigo']

export default function CurriculumCreator({ onCurriculumCreated }: CurriculumCreatorProps) {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [programType, setProgramType] = useState<'gopro' | 'mentorship'>('gopro')
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    specialization: "",
    color: "blue"
  })
  const [files, setFiles] = useState<File[]>([])
  const storage = getStorage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.specialization || !formData.description) {
      alert("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
      
      // Upload PDFs if any
      const pdfUrls: string[] = []
      if (files.length > 0) {
        for (const file of files) {
          try {
            const fileRef = ref(storage, `curriculum-pdfs/${Date.now()}-${file.name}`)
            const uploadSnapshot = await uploadBytes(fileRef, file)
            const fileUrl = await getDownloadURL(uploadSnapshot.ref)
            pdfUrls.push(fileUrl)
          } catch (error) {
            console.error(`Error uploading ${file.name}:`, error)
          }
        }
      }

      await curriculumService.createCurriculum({
        title: formData.title,
        description: formData.description,
        programType,
        specialization: formData.specialization,
        color: formData.color,
        createdBy: "admin",
        pdfUrls: pdfUrls
      })
      alert("Curriculum created successfully!")
      resetForm()
      onCurriculumCreated()
    } catch (error) {
      console.error("Error creating curriculum:", error)
      alert("Failed to create curriculum")
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles([...files, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const resetForm = () => {
    setFormData({ title: "", description: "", specialization: "", color: "blue" })
    setProgramType('gopro')
    setFiles([])
    setShowForm(false)
  }

  const currentSpecializations = SPECIALIZATIONS[programType]

  return (
    <div className="space-y-6">
      {!showForm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-yellow-400 text-black font-bold h-14 px-6 rounded-2xl flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Create New Curriculum
          </Button>
        </motion.div>
      )}

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-none shadow-premium rounded-[2.5rem] bg-white p-12">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black">Create New Curriculum</h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Program Type Selection */}
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
                    className={`p-4 rounded-2xl border-2 transition-all font-bold flex items-center gap-2 ${
                      programType === 'gopro'
                        ? 'border-yellow-400 bg-yellow-50 text-black'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Zap className="h-5 w-5" />
                    Go Pro
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProgramType('mentorship')
                      setFormData({ ...formData, specialization: '' })
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all font-bold flex items-center gap-2 ${
                      programType === 'mentorship'
                        ? 'border-yellow-400 bg-yellow-50 text-black'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Users className="h-5 w-5" />
                    Mentorship
                  </button>
                </div>
              </div>

              {/* Specialization */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Specialization *
                </label>
                <select
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                >
                  <option value="">Select specialization</option>
                  {currentSpecializations.map((spec) => (
                    <option key={spec.value} value={spec.value}>
                      {spec.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Curriculum Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., ÀGBÀ Cinema Video Editing Course"
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
                  placeholder="Describe what this curriculum covers and the learning outcomes"
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

              {/* PDF Upload */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Upload PDFs (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-yellow-400 transition-colors">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf"
                    multiple
                    className="hidden"
                    id="pdf-input"
                  />
                  <label htmlFor="pdf-input" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm font-bold text-gray-600">
                      Click to upload or drag and drop PDFs
                    </p>
                    <p className="text-xs text-gray-400">Multiple PDFs supported (Max 50MB each)</p>
                  </label>
                </div>

                {/* Uploaded Files List */}
                {files.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {files.map((file, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3"
                      >
                        <div className="flex items-center gap-2 flex-grow">
                          <span className="text-xs font-black text-blue-700 bg-blue-100 px-2 py-1 rounded">
                            PDF
                          </span>
                          <p className="text-sm font-bold text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-6 border-t">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-yellow-400 text-black font-black h-14 rounded-2xl"
                >
                  {loading ? "Creating..." : "Create Curriculum"}
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

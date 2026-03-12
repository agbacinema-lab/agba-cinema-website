"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Upload, Trash2, FileText, PlayCircle, Link as LinkIcon, Plus, X, Eye } from "lucide-react"
import { curriculumService } from "@/lib/services"
import PDFViewer from "@/components/curriculum/PDFViewer"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { motion } from "framer-motion"

interface CurriculumMaterialsProps {
  moduleId: string
  moduleName: string
  materials: any[]
  onMaterialAdded: () => void
}

export default function CurriculumMaterials({
  moduleId,
  moduleName,
  materials,
  onMaterialAdded
}: CurriculumMaterialsProps) {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [materialType, setMaterialType] = useState<'pdf' | 'video' | 'document' | 'link'>('pdf')
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    externalLink: "",
  })
  const [file, setFile] = useState<File | null>(null)
  const [pdfViewingFile, setPdfViewingFile] = useState<{ url: string; name: string } | null>(null)
  const storage = getStorage()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.description) {
      alert("Please fill in title and description")
      return
    }

    if (materialType === 'pdf' || materialType === 'document') {
      if (!file) {
        alert("Please select a file")
        return
      }
    }

    if (materialType === 'video' && !formData.videoUrl) {
      alert("Please enter a video URL")
      return
    }

    if (materialType === 'link' && !formData.externalLink) {
      alert("Please enter a link")
      return
    }

    try {
      setLoading(true)
      let fileUrl = ""
      let fileName = ""

      if ((materialType === 'pdf' || materialType === 'document') && file) {
        const fileRef = ref(storage, `curriculum/${moduleId}/${file.name}`)
        const uploadSnapshot = await uploadBytes(fileRef, file)
        fileUrl = await getDownloadURL(uploadSnapshot.ref)
        fileName = file.name
      }

      const material = {
        title: formData.title,
        description: formData.description,
        type: materialType,
        fileUrl: materialType === 'pdf' || materialType === 'document' ? fileUrl : null,
        fileName: materialType === 'pdf' || materialType === 'document' ? fileName : null,
        fileSize: file?.size || 0,
        videoUrl: materialType === 'video' ? formData.videoUrl : null,
        externalLink: materialType === 'link' ? formData.externalLink : null,
        uploadedBy: "tutor",
        readOnly: true
      }

      await curriculumService.addLearningMaterial(moduleId, material)
      alert("Material added successfully!")
      resetForm()
      onMaterialAdded()
    } catch (error) {
      console.error("Error uploading material:", error)
      alert("Failed to add material: " + (error as any).message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (materialId: string) => {
    try {
      setLoading(true)
      await curriculumService.deleteMaterial(moduleId, materialId)
      alert("Material deleted successfully!")
      onMaterialAdded()
    } catch (error) {
      alert("Failed to delete material")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ title: "", description: "", videoUrl: "", externalLink: "" })
    setFile(null)
    setShowForm(false)
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'document':
        return <FileText className="h-5 w-5 text-red-500" />
      case 'video':
        return <PlayCircle className="h-5 w-5 text-blue-500" />
      case 'link':
        return <LinkIcon className="h-5 w-5 text-purple-500" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  return (
    <>
    <div className="space-y-6 border-t pt-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black">Learning Materials</h3>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-yellow-400 text-black font-bold h-12 px-6 rounded-xl flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Material
        </Button>
      </div>

      {/* Add Material Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-none shadow-md rounded-2xl bg-white p-8">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-black">Add Learning Material</h4>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Material Type
                </label>
                <select
                  value={materialType}
                  onChange={(e) => setMaterialType(e.target.value as any)}
                  className="w-full h-12 px-4 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                >
                  <option value="pdf">PDF Document</option>
                  <option value="document">Course Material</option>
                  <option value="video">Video (YouTube/Vimeo)</option>
                  <option value="link">External Link</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Material title"
                  className="h-12 rounded-xl border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Description *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what students will learn from this material"
                  className="min-h-20 rounded-xl border-gray-200"
                />
              </div>

              {(materialType === 'pdf' || materialType === 'document') && (
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Upload File *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-yellow-400 transition-colors">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      id="file-input"
                    />
                    <label htmlFor="file-input" className="cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm font-bold text-gray-600">
                        {file ? file.name : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-gray-400">PDF or DOCX (Max 50MB)</p>
                    </label>
                  </div>
                </div>
              )}

              {materialType === 'video' && (
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Video URL *
                  </label>
                  <Input
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                    className="h-12 rounded-xl border-gray-200"
                  />
                </div>
              )}

              {materialType === 'link' && (
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                    External Link *
                  </label>
                  <Input
                    value={formData.externalLink}
                    onChange={(e) => setFormData({ ...formData, externalLink: e.target.value })}
                    placeholder="https://example.com"
                    className="h-12 rounded-xl border-gray-200"
                  />
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-yellow-400 text-black font-black h-12 rounded-xl"
                >
                  {loading ? "Uploading..." : "Add Material"}
                </Button>
                <Button
                  type="button"
                  onClick={resetForm}
                  variant="outline"
                  className="flex-1 h-12 rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Materials List */}
      <div className="space-y-4">
        {materials.length === 0 ? (
          <Card className="border-none shadow-sm rounded-xl bg-gray-50 p-8 text-center">
            <p className="text-gray-500 font-medium">No materials added yet</p>
          </Card>
        ) : (
          materials.map((material) => (
            <motion.div
              key={material.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="border-none shadow-sm rounded-xl hover:shadow-md transition-shadow p-4">
                <CardContent className="p-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getFileIcon(material.type)}
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-bold uppercase">
                          {material.type}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-1">{material.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{material.description}</p>
                      {material.fileSize && (
                        <p className="text-xs text-gray-400 mt-2">
                          Size: {(material.fileSize / 1024 / 1024).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {(material.type === 'pdf' || material.type === 'document') && material.fileUrl && (
                        <Button
                          size="sm"
                          onClick={() => setPdfViewingFile({ url: material.fileUrl, name: material.title })}
                          className="bg-blue-500 text-white rounded-lg flex items-center gap-1 hover:bg-blue-600"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      )}
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
                          <AlertDialogTitle>Delete Material</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{material.title}"?
                          </AlertDialogDescription>
                          <div className="flex gap-4 justify-end">
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(material.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
    {/* PDF Viewer Modal */}
    {pdfViewingFile && (
      <PDFViewer
        fileUrl={pdfViewingFile.url}
        fileName={pdfViewingFile.name}
        onClose={() => setPdfViewingFile(null)}
      />
    )}
    </>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Trash2, FileText, PlayCircle, Link as LinkIcon, Plus, X, Eye, ExternalLink } from "lucide-react"
import { curriculumService } from "@/lib/services"
import { motion } from "framer-motion"
import { toast } from "sonner"

interface CurriculumMaterialsProps {
  curriculumId: string
  moduleId: string
  moduleName: string
  materials?: any[]
  onMaterialAdded: () => void
}

// Convert Google Drive share link to embeddable preview link
function convertToEmbedUrl(url: string): string {
  // Google Drive: https://drive.google.com/file/d/FILE_ID/view?...
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (driveMatch) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`
  }
  // Google Docs: https://docs.google.com/document/d/FILE_ID/...
  const docsMatch = url.match(/docs\.google\.com\/(document|spreadsheets|presentation)\/d\/([a-zA-Z0-9_-]+)/)
  if (docsMatch) {
    return `https://docs.google.com/${docsMatch[1]}/d/${docsMatch[2]}/preview`
  }
  // OneDrive: https://onedrive.live.com/...
  if (url.includes('onedrive.live.com') || url.includes('1drv.ms')) {
    // OneDrive embed — append embed param
    const cleanUrl = url.split('?')[0]
    return cleanUrl + '?embed=1'
  }
  // Fallback — use as-is
  return url
}

function isGoogleDrive(url: string) {
  return url?.includes('drive.google.com') || url?.includes('docs.google.com')
}

function isOneDrive(url: string) {
  return url?.includes('onedrive.live.com') || url?.includes('1drv.ms')
}

export default function CurriculumMaterials({
  curriculumId,
  moduleId,
  moduleName,
  onMaterialAdded
}: CurriculumMaterialsProps) {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [materialType, setMaterialType] = useState<'pdf' | 'video' | 'link'>('pdf')
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    driveUrl: "",      // Google Drive / OneDrive URL for PDFs
    videoUrl: "",      // YouTube / Vimeo
    externalLink: "",  // Any external URL
  })
  const [localMaterials, setLocalMaterials] = useState<any[]>([])
  const [previewingMaterial, setPreviewingMaterial] = useState<any | null>(null)

  useEffect(() => {
    loadMaterials()
  }, [curriculumId, moduleId])

  const loadMaterials = async () => {
    try {
      const data = await curriculumService.getMaterialsByModule(curriculumId, moduleId)
      setLocalMaterials(data)
    } catch (error) {
      console.error("Error loading materials:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.description) {
      toast.error("Please fill in title and description")
      return
    }

    if (materialType === 'pdf' && !formData.driveUrl) {
      toast.error("Please paste a Google Drive or OneDrive link")
      return
    }
    if (materialType === 'video' && !formData.videoUrl) {
      toast.error("Please enter a video URL")
      return
    }
    if (materialType === 'link' && !formData.externalLink) {
      toast.error("Please enter a link")
      return
    }

    try {
      setLoading(true)
      let fileUrl = null
      let embedUrl = null

      if (materialType === 'pdf') {
        fileUrl = formData.driveUrl
        embedUrl = convertToEmbedUrl(formData.driveUrl)
      }

      const material = {
        title: formData.title,
        description: formData.description,
        type: materialType,
        fileUrl: materialType === 'pdf' ? fileUrl : null,
        embedUrl: materialType === 'pdf' ? embedUrl : null,
        videoUrl: materialType === 'video' ? formData.videoUrl : null,
        externalLink: materialType === 'link' ? formData.externalLink : null,
        uploadedBy: "tutor",
        readOnly: true,
        source: materialType === 'pdf' ? (isGoogleDrive(formData.driveUrl) ? 'google_drive' : isOneDrive(formData.driveUrl) ? 'onedrive' : 'external') : materialType
      }

      await curriculumService.addLearningMaterial(curriculumId, moduleId, material)
      toast.success("Material added successfully!")
      resetForm()
      loadMaterials()
      onMaterialAdded()
    } catch (error) {
      console.error("Error saving material:", error)
      toast.error("Failed to add material: " + (error as any).message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (materialId: string) => {
    try {
      setLoading(true)
      await curriculumService.deleteMaterial(curriculumId, moduleId, materialId)
      toast.success("Material deleted")
      loadMaterials()
      onMaterialAdded()
    } catch (error) {
      toast.error("Failed to delete material")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ title: "", description: "", driveUrl: "", videoUrl: "", externalLink: "" })
    setMaterialType('pdf')
    setShowForm(false)
  }

  const getFileIcon = (type: string) => {
    if (type === 'pdf') return <FileText className="h-5 w-5 text-red-500" />
    if (type === 'video') return <PlayCircle className="h-5 w-5 text-blue-500" />
    return <LinkIcon className="h-5 w-5 text-purple-500" />
  }

  const getSourceBadge = (material: any) => {
    if (material.source === 'google_drive') return '📁 Google Drive'
    if (material.source === 'onedrive') return '☁️ OneDrive'
    if (material.type === 'video') return '🎬 Video'
    return '🔗 Link'
  }

  return (
    <>
    <div className="space-y-6 border-t pt-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black">Module Content & Materials</h3>
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
              {/* Type selector */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Material Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['pdf', 'video', 'link'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setMaterialType(type)}
                      className={`h-12 rounded-xl font-bold border-2 transition-all capitalize flex items-center justify-center gap-2 ${
                        materialType === type
                          ? "border-yellow-400 bg-yellow-50 text-black"
                          : "border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200"
                      }`}
                    >
                      {type === 'pdf' && <FileText className="h-4 w-4" />}
                      {type === 'video' && <PlayCircle className="h-4 w-4" />}
                      {type === 'link' && <LinkIcon className="h-4 w-4" />}
                      {type === 'pdf' ? 'PDF / Doc' : type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Week 1 - Premiere Pro Basics"
                  className="h-12 rounded-xl border-gray-200"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Description *</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what students will learn from this material"
                  className="min-h-20 rounded-xl border-gray-200"
                />
              </div>

              {/* PDF - Google Drive / OneDrive link */}
              {materialType === 'pdf' && (
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Google Drive or OneDrive Link *
                  </label>
                  <Input
                    value={formData.driveUrl}
                    onChange={(e) => setFormData({ ...formData, driveUrl: e.target.value })}
                    placeholder="https://drive.google.com/file/d/... or OneDrive link"
                    className="h-12 rounded-xl border-gray-200"
                  />
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2 text-xs text-blue-700">
                    <p className="font-black uppercase tracking-wide">How to get your Google Drive link:</p>
                    <ol className="list-decimal list-inside space-y-1 font-medium">
                      <li>Upload your PDF to Google Drive</li>
                      <li>Right-click the file → <strong>"Share"</strong></li>
                      <li>Set to <strong>"Anyone with the link"</strong> → Viewer</li>
                      <li>Click <strong>"Copy link"</strong> and paste it above</li>
                    </ol>
                  </div>
                  {formData.driveUrl && (
                    <div className="flex items-center gap-2 text-xs text-green-600 font-bold bg-green-50 px-3 py-2 rounded-lg">
                      ✓ {isGoogleDrive(formData.driveUrl) ? 'Google Drive link detected' : isOneDrive(formData.driveUrl) ? 'OneDrive link detected' : 'Link entered'}
                    </div>
                  )}
                </div>
              )}

              {/* Video URL */}
              {materialType === 'video' && (
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Video URL *</label>
                  <Input
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://youtube.com/watch?v=... or Vimeo/Loom link"
                    className="h-12 rounded-xl border-gray-200"
                  />
                </div>
              )}

              {/* External Link */}
              {materialType === 'link' && (
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">External Link *</label>
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
                  {loading ? "Saving..." : "Add Material"}
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
        {localMaterials.length === 0 ? (
          <Card className="border-none shadow-sm rounded-xl bg-gray-50 p-8 text-center">
            <p className="text-gray-500 font-medium">No materials added yet</p>
            <p className="text-xs text-gray-400 mt-1">Upload PDFs via Google Drive or add video/links</p>
          </Card>
        ) : (
          localMaterials.map((material) => (
            <motion.div
              key={material.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="border-none shadow-sm rounded-xl hover:shadow-md transition-shadow p-4">
                <CardContent className="p-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {getFileIcon(material.type)}
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-bold">
                          {getSourceBadge(material)}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-1">{material.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{material.description}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {/* View button */}
                      {material.type === 'pdf' && material.fileUrl && (
                        <Button
                          size="sm"
                          onClick={() => setPreviewingMaterial(material)}
                          className="bg-blue-500 text-white rounded-lg flex items-center gap-1 hover:bg-blue-600"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      )}
                      {material.type === 'video' && material.videoUrl && (
                        <a href={material.videoUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" className="bg-blue-500 text-white rounded-lg flex items-center gap-1 hover:bg-blue-600">
                            <ExternalLink className="h-4 w-4" />
                            Open
                          </Button>
                        </a>
                      )}
                      {material.type === 'link' && material.externalLink && (
                        <a href={material.externalLink} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" className="bg-purple-500 text-white rounded-lg flex items-center gap-1 hover:bg-purple-600">
                            <ExternalLink className="h-4 w-4" />
                            Open
                          </Button>
                        </a>
                      )}
                      {/* Delete */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive" className="rounded-lg">
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

    {/* PDF Preview Modal — built-in viewer, no external links */}
    {previewingMaterial && (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
          <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-red-500" />
              <h3 className="font-black text-gray-900">{previewingMaterial.title}</h3>
            </div>
            <button
              onClick={() => setPreviewingMaterial(null)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <iframe
            src={previewingMaterial.embedUrl || convertToEmbedUrl(previewingMaterial.fileUrl)}
            className="flex-1 w-full"
            style={{ minHeight: '72vh' }}
            allow="autoplay"
            title={previewingMaterial.title}
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>
      </div>
    )}
    </>
  )
}

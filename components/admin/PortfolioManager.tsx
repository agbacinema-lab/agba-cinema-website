"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Plus, Edit2, Trash2, X } from "lucide-react"
import { portfolioService } from "@/lib/services"
import { motion } from "framer-motion"

export default function PortfolioManager() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    client: "",
    category: "",
    description: "",
    image: "",
    duration: "",
    year: new Date().getFullYear(),
    youtubeEmbedUrl: "",
    tags: ""
  })

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    try {
      setLoading(true)
      const allItems = await portfolioService.getAllItems()
      setItems(allItems)
    } catch (error) {
      console.error("Error loading portfolio items:", error)
      alert("Failed to load portfolio items")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.category || !formData.youtubeEmbedUrl) {
      alert("Please fill in required fields (Title, Category, YouTube Embed URL)")
      return
    }

    try {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")

      const itemData = {
        title: formData.title,
        client: formData.client,
        category: formData.category,
        description: formData.description,
        image: formData.image,
        duration: formData.duration,
        year: Number(formData.year),
        youtubeEmbedUrl: formData.youtubeEmbedUrl,
        tags: formData.tags.split(",").map(t => t.trim()).filter(t => t),
        slug,
      }

      if (editingId) {
        await portfolioService.updateItem(editingId, itemData)
        alert("Portfolio item updated successfully!")
      } else {
        await portfolioService.createItem(itemData)
        alert("Portfolio item created successfully!")
      }

      resetForm()
      loadItems()
    } catch (error) {
      console.error("Error saving item:", error)
      alert("Failed to save portfolio item: " + (error as any).message)
    }
  }

  const handleEdit = (item: any) => {
    setFormData({
      title: item.title || "",
      client: item.client || "",
      category: item.category || "",
      description: item.description || "",
      image: item.image || "",
      duration: item.duration || "",
      year: item.year || new Date().getFullYear(),
      youtubeEmbedUrl: item.youtubeEmbedUrl || "",
      tags: (item.tags || []).join(", "),
    })
    setEditingId(item.id)
    setShowForm(true)
  }

  const handleDelete = async (itemId: string) => {
    try {
      await portfolioService.deleteItem(itemId)
      alert("Portfolio item deleted successfully!")
      loadItems()
    } catch (error) {
      console.error("Error deleting item:", error)
      alert("Failed to delete portfolio item")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      client: "",
      category: "",
      description: "",
      image: "",
      duration: "",
      year: new Date().getFullYear(),
      youtubeEmbedUrl: "",
      tags: ""
    })
    setEditingId(null)
    setShowForm(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black">Portfolio Manager</h2>
        <Button
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
          className="bg-yellow-400 text-black font-bold h-14 px-6 rounded-2xl flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          New Item
        </Button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <Card className="border-none shadow-premium rounded-[2.5rem] bg-white p-12">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black">{editingId ? "Edit Item" : "Create New Item"}</h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Project Title"
                    className="h-12 rounded-xl border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Category *</label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Documentary, Sport, Brand Promo"
                    className="h-12 rounded-xl border-gray-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Client</label>
                  <Input
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    placeholder="Client Name"
                    className="h-12 rounded-xl border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">YouTube Embed URL *</label>
                  <Input
                    value={formData.youtubeEmbedUrl}
                    onChange={(e) => setFormData({ ...formData, youtubeEmbedUrl: e.target.value })}
                    placeholder="https://www.youtube.com/embed/..."
                    className="h-12 rounded-xl border-gray-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Project Description"
                  className="min-h-24 rounded-xl border-gray-200"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Image URL</label>
                  <Input
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="/image.jpg Or https://..."
                    className="h-12 rounded-xl border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Tags (comma-separated)</label>
                  <Input
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g., History, Marketing"
                    className="h-12 rounded-xl border-gray-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Duration</label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 3:40"
                    className="h-12 rounded-xl border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Year</label>
                  <Input
                    value={formData.year}
                    type="number"
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    placeholder="2024"
                    className="h-12 rounded-xl border-gray-200"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button type="submit" className="bg-yellow-400 text-black font-black h-14 px-8 rounded-2xl flex-1">
                  {editingId ? "Update Item" : "Create Item"}
                </Button>
                <Button type="button" onClick={resetForm} variant="outline" className="h-14 px-8 rounded-2xl flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.length === 0 ? (
          <Card className="col-span-full border-none shadow-premium rounded-[2.5rem] bg-white p-12 text-center">
            <p className="text-gray-500 font-medium">No portfolio items yet.</p>
          </Card>
        ) : (
          items.map((item) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-none shadow-md rounded-[2rem] bg-white p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0 flex flex-col gap-4">
                  <div>
                    <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-black mb-2 inline-block">
                      {item.category}
                    </span>
                    <h3 className="text-lg font-black text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                  </div>
                  <div className="flex gap-2 mt-auto pt-2 border-t border-gray-50">
                    <Button onClick={() => handleEdit(item)} size="sm" variant="outline" className="flex-1 rounded-xl">
                      <Edit2 className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive" className="flex-1 rounded-xl">
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogTitle>Delete Item</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{item.title}"?
                        </AlertDialogDescription>
                        <div className="flex gap-4 justify-end">
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-red-600 hover:bg-red-700">
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
  )
}

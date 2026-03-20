"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Plus, Edit2, Trash2, X } from "lucide-react"
import { academyService } from "@/lib/services"
import { motion } from "framer-motion"
import { toast } from "sonner"

export default function AcademyManager() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    href: "",
    features: "",
    image: ""
  })

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    try {
      setLoading(true)
      const allItems = await academyService.getAllServices()
      setItems(allItems)
    } catch (error) {
      console.error("Error loading academy services:", error)
      toast.error("Failed to load academy services")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title) {
      toast.error("Please fill in required fields (Title)")
      return
    }

    try {
      const itemData = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        href: formData.href,
        features: formData.features.split(",").map(t => t.trim()).filter(t => t),
        image: formData.image
      }

      if (editingId) {
        await academyService.updateService(editingId, itemData)
        toast.success("Academy service updated successfully!")
      } else {
        await academyService.createService(itemData)
        toast.success("Academy service created successfully!")
      }

      resetForm()
      loadItems()
    } catch (error) {
      console.error("Error saving item:", error)
      toast.error("Failed to save academy service: " + (error as any).message)
    }
  }

  const handleEdit = (item: any) => {
    setFormData({
      title: item.title || "",
      description: item.description || "",
      price: item.price || "",
      href: item.href || "",
      features: (item.features || []).join(", "),
      image: item.image || ""
    })
    setEditingId(item.id)
    setShowForm(true)
  }

  const handleDelete = async (itemId: string) => {
    try {
      await academyService.deleteService(itemId)
      toast.success("Academy service deleted successfully!")
      loadItems()
    } catch (error) {
      console.error("Error deleting service:", error)
      toast.error("Failed to delete academy service")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      href: "",
      features: "",
      image: ""
    })
    setEditingId(null)
    setShowForm(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-start h-96 pl-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-foreground tracking-tighter">Academy manager</h2>
        <Button
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
          className="bg-yellow-400 text-black font-black h-14 px-8 rounded-2xl flex items-center gap-2 hover:bg-black hover:text-white transition-all shadow-xl shadow-yellow-400/10"
        >
          <Plus className="h-5 w-5" />
          Add first service
        </Button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <Card className="border border-muted shadow-premium rounded-[2.5rem] bg-card p-12 transition-colors text-left">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-foreground tracking-tighter">{editingId ? "Edit service" : "Create new service"}</h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Service title"
                    className="h-12 rounded-xl border-muted bg-muted/20 text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/50">Price</label>
                  <Input
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. From #50,000"
                    className="h-12 rounded-xl border-muted bg-muted/20 text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/50">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Service description"
                  className="min-h-24 rounded-xl border-muted bg-muted/20 text-foreground"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/50">Link URL (href)</label>
                  <Input
                    value={formData.href}
                    onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                    placeholder="/booking/..."
                    className="h-12 rounded-xl border-muted bg-muted/20 text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/50">Features (comma-separated)</label>
                  <Input
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    placeholder="e.g. Concept development, Story structure"
                    className="h-12 rounded-xl border-muted bg-muted/20 text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/50">Image URL / Graphic</label>
                <Input
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://... or /image.jpg"
                  className="h-12 rounded-xl border-muted bg-muted/20 text-foreground"
                />
              </div>

              <div className="flex gap-4 pt-6">
                <Button type="submit" className="bg-yellow-400 text-black font-black h-14 px-8 rounded-2xl flex-1 hover:bg-black hover:text-white transition-all shadow-xl shadow-yellow-400/10">
                  {editingId ? "Update service" : "Create service"}
                </Button>
                <Button type="button" onClick={resetForm} variant="outline" className="h-14 px-8 rounded-2xl flex-1 border-muted text-foreground hover:bg-muted">
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.length === 0 ? (
          <Card className="col-span-full border border-muted shadow-premium rounded-[2.5rem] bg-card p-12 text-left transition-colors">
            <p className="text-muted-foreground font-medium">No academy services yet.</p>
          </Card>
        ) : (
          items.map((item) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border border-muted shadow-premium rounded-[2rem] bg-card p-6 hover:shadow-lg transition-all text-left">
                <CardContent className="p-0 flex flex-col gap-4 text-left">
                  <div className="text-left">
                    <h3 className="text-xl font-black text-foreground mb-1 tracking-tighter leading-tight uppercase">{item.title}</h3>
                    <p className="text-xs text-yellow-500 mb-2 font-black tracking-widest uppercase">{item.price}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2 font-medium leading-relaxed">{item.description}</p>
                  </div>
                  <div className="flex gap-2 mt-auto pt-4 border-t border-muted transition-colors">
                    <Button onClick={() => handleEdit(item)} size="sm" variant="outline" className="flex-1 rounded-xl border-muted text-foreground hover:bg-muted font-black h-10 uppercase tracking-widest text-[9px]">
                      <Edit2 className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive" className="flex-1 rounded-xl font-black h-10 uppercase tracking-widest text-[9px]">
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogTitle>Delete Service</AlertDialogTitle>
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

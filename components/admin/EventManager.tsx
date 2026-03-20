"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Plus, Edit2, Trash2, X } from "lucide-react"
import { eventService } from "@/lib/services"
import { motion } from "framer-motion"
import { toast } from "sonner"

export default function EventManager() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    href: "",
    lumaUrl: "",
    date: "",
    location: "",
    features: "",
    image: ""
  })

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    try {
      setLoading(true)
      const allItems = await eventService.getAllEvents()
      setItems(allItems)
    } catch (error) {
      console.error("Error loading events:", error)
      toast.error("Failed to load events")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.date || !formData.location) {
      toast.error("Please fill in required fields (Title, Date, Location)")
      return
    }

    try {
      const itemData = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        href: formData.href,
        lumaUrl: formData.lumaUrl,
        date: formData.date,
        location: formData.location,
        features: formData.features.split(",").map(t => t.trim()).filter(t => t),
        image: formData.image
      }

      if (editingId) {
        await eventService.updateEvent(editingId, itemData)
        toast.success("Event updated successfully!")
      } else {
        await eventService.createEvent(itemData)
        toast.success("Event created successfully!")
      }

      resetForm()
      loadItems()
    } catch (error) {
      console.error("Error saving item:", error)
      toast.error("Failed to save event: " + (error as any).message)
    }
  }

  const handleEdit = (item: any) => {
    setFormData({
      title: item.title || "",
      description: item.description || "",
      price: item.price || "",
      href: item.href || "",
      lumaUrl: item.lumaUrl || "",
      date: item.date || "",
      location: item.location || "",
      features: (item.features || []).join(", "),
      image: item.image || ""
    })
    setEditingId(item.id)
    setShowForm(true)
  }

  const handleDelete = async (itemId: string) => {
    try {
      await eventService.deleteEvent(itemId)
      toast.success("Event deleted successfully!")
      loadItems()
    } catch (error) {
      console.error("Error deleting event:", error)
      toast.error("Failed to delete event")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      href: "",
      lumaUrl: "",
      date: "",
      location: "",
      features: "",
      image: ""
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
        <h2 className="text-2xl font-black">Event manager</h2>
        <Button
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
          className="bg-yellow-400 text-black font-bold h-14 px-6 rounded-2xl flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          New event
        </Button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border border-muted shadow-premium rounded-[2.5rem] bg-card p-12 text-left transition-colors">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black tracking-tighter text-foreground">{editingId ? "Edit event" : "Create new event"}</h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
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
                    placeholder="Event title"
                    className="h-12 rounded-xl border-muted bg-muted/20 text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Price</label>
                  <Input
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. #25,000"
                    className="h-12 rounded-xl border-muted bg-muted/20 text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Date *</label>
                  <Input
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="e.g. April 26, 2026"
                    className="h-12 rounded-xl border-muted bg-muted/20 text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Location *</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Lagos, Nigeria"
                    className="h-12 rounded-xl border-muted bg-muted/20 text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black tracking-widest text-gray-400">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Event Description"
                  className="min-h-24 rounded-xl border-gray-200"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black tracking-widest text-gray-400">Link URL (href)</label>
                  <Input
                    value={formData.href}
                    onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                    placeholder="/booking/..."
                    className="h-12 rounded-xl border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black tracking-widest text-gray-400">Luma URL</label>
                  <Input
                    value={formData.lumaUrl}
                    onChange={(e) => setFormData({ ...formData, lumaUrl: e.target.value })}
                    placeholder="https://luma.com/..."
                    className="h-12 rounded-xl border-gray-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black tracking-widest text-gray-400">Features (comma-separated)</label>
                <Input
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="e.g. Workshop, Q&A"
                  className="h-12 rounded-xl border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black tracking-widest text-gray-400">Image URL / flyer</label>
                <Input
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://... or /image.jpg"
                  className="h-12 rounded-xl border-gray-200"
                />
              </div>

              <div className="flex gap-4 pt-6 text-left">
                <Button type="submit" className="bg-yellow-400 text-black font-black h-14 px-8 rounded-2xl flex-1">
                  {editingId ? "Update event" : "Create event"}
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
          <Card className="col-span-full border border-muted shadow-premium rounded-[2.5rem] bg-card p-12 text-center transition-colors">
            <p className="text-muted-foreground font-medium">No events yet.</p>
          </Card>
        ) : (
          items.map((item) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border border-muted shadow-premium rounded-[2rem] bg-card p-6 hover:shadow-lg transition-all text-left">
                <CardContent className="p-0 flex flex-col gap-4 text-left">
                  <div className="text-left">
                    <h3 className="text-xl font-black text-foreground mb-1 tracking-tighter leading-tight">{item.title}</h3>
                    <p className="text-sm text-yellow-500 mb-2 font-black tracking-widest uppercase">{item.date} | {item.location}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed font-medium">{item.description}</p>
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
                      <AlertDialogContent className="text-left">
                        <AlertDialogTitle>Delete event</AlertDialogTitle>
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

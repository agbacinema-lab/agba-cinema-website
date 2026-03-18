"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Plus, Edit2, Trash2, X, RefreshCw } from "lucide-react"
import { blogService, BlogPost } from "@/lib/services"
import { db } from "@/lib/firebase"
import { doc, deleteDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { motion } from "framer-motion"
import { toast } from "sonner"

export default function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    tags: "",
    author: "ÀGBÀ CINEMA",
    image: "",
    readTime: "5 min read",
  })

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const allPosts = await blogService.getAllPosts()
      setPosts(allPosts)
    } catch (error) {
      console.error("Error loading posts:", error)
      toast.error("Failed to load blog posts")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.excerpt || !formData.content || !formData.category) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")

      const postData = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        tags: formData.tags.split(",").map(t => t.trim()).filter(t => t),
        author: formData.author,
        image: formData.image,
        readTime: formData.readTime,
        slug,
        publishedAt: new Date().toISOString(),
        updatedAt: serverTimestamp(),
      }

      if (editingId) {
        // Update existing post
        const postRef = doc(db, "posts", editingId)
        await updateDoc(postRef, postData)
        toast.success("Blog post updated successfully!")
      } else {
        // Create new post with auto-generated ID
        const newPostRef = doc(db, "posts", slug)
        await setDoc(newPostRef, postData)
        toast.success("Blog post created successfully!")
      }

      resetForm()
      loadPosts()
    } catch (error) {
      console.error("Error saving post:", error)
      toast.error("Failed to save blog post: " + (error as any).message)
    }
  }

  const handleEdit = (post: BlogPost) => {
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      tags: post.tags.join(", "),
      author: post.author,
      image: post.image || "",
      readTime: post.readTime,
    })
    setEditingId(post.id)
    setShowForm(true)
  }

  const handleDelete = async (postId: string) => {
    try {
      const postRef = doc(db, "posts", postId)
      await deleteDoc(postRef)
      toast.success("Blog post deleted successfully!")
      loadPosts()
    } catch (error) {
      console.error("Error deleting post:", error)
      toast.error("Failed to delete blog post")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      category: "",
      tags: "",
      author: "ÀGBÀ CINEMA",
      image: "",
      readTime: "5 min read",
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSyncMedium = async () => {
    setSyncing(true)
    try {
      const res = await fetch("/api/blog/sync")
      const data = await res.json()
      if (data.success) {
        toast.success(data.message)
        loadPosts()
      } else {
        toast.error(data.error || "Sync failed")
      }
    } catch {
      toast.error("Network error during sync")
    } finally {
      setSyncing(false)
    }
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
      {/* Add Post Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black">Blog Posts</h2>
        <div className="flex gap-4">
          <Button
            onClick={handleSyncMedium}
            disabled={syncing}
            variant="outline"
            className="h-14 px-6 rounded-2xl border-2 border-gray-100 flex items-center gap-2 hover:border-black font-black uppercase text-[10px] tracking-widest transition-all"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Substack'}
          </Button>
          <Button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="bg-yellow-400 text-black font-bold h-14 px-6 rounded-2xl flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            New Post
          </Button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <Card className="border-none shadow-premium rounded-[2.5rem] bg-white p-12">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black">{editingId ? "Edit Post" : "Create New Post"}</h3>
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
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Title *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Post title"
                    className="h-12 rounded-xl border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Category *
                  </label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Tutorial, News, Behind the Scenes"
                    className="h-12 rounded-xl border-gray-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Excerpt *
                </label>
                <Textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Brief summary of the post"
                  className="min-h-24 rounded-xl border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Content *
                </label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Full post content. Use ## for subheadings and separate paragraphs with blank lines."
                  className="min-h-64 rounded-xl border-gray-200 font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Image URL
                  </label>
                  <Input
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="h-12 rounded-xl border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Read Time
                  </label>
                  <Input
                    value={formData.readTime}
                    onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                    placeholder="e.g., 5 min read"
                    className="h-12 rounded-xl border-gray-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Tags (comma-separated)
                </label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g., video production, tips, tutorial"
                  className="h-12 rounded-xl border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Author
                </label>
                <Input
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Author name"
                  className="h-12 rounded-xl border-gray-200"
                />
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  className="bg-yellow-400 text-black font-black h-14 px-8 rounded-2xl flex-1"
                >
                  {editingId ? "Update Post" : "Create Post"}
                </Button>
                <Button
                  type="button"
                  onClick={resetForm}
                  variant="outline"
                  className="h-14 px-8 rounded-2xl flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card className="border-none shadow-premium rounded-[2.5rem] bg-white p-12 text-center">
            <p className="text-gray-500 font-medium">No blog posts yet. Create your first post!</p>
          </Card>
        ) : (
          posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-none shadow-md rounded-[2rem] bg-white p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-black">
                          {post.category}
                        </span>
                        <span className="text-xs text-gray-400">{post.readTime}</span>
                      </div>
                      <h3 className="text-lg font-black text-gray-900 mb-2">{post.title}</h3>
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{post.excerpt}</p>
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <Button
                        onClick={() => handleEdit(post)}
                        size="sm"
                        variant="outline"
                        className="flex-1 md:flex-none rounded-xl"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1 md:flex-none rounded-xl"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogTitle>Delete Post</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{post.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                          <div className="flex gap-4 justify-end">
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(post.id)}
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
  )
}

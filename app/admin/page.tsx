"use client"

import { useState, useEffect } from "react"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth"
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      alert("Invalid credentials")
    }
  }

  const handleLogout = () => signOut(auth)

  if (loading) return <div className="p-20 text-center">Loading...</div>

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
        <Card className="w-full max-w-md bg-white">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-center">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input 
                type="email" 
                placeholder="Admin Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
              />
              <Input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
              />
              <Button type="submit" className="w-full bg-yellow-400 text-black hover:bg-yellow-300 font-bold">
                Enter Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 sm:p-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-black text-gray-900">Backend Dashboard</h1>
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Manage Blog posts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Add, edit, or remove blog posts directly from Firestore.</p>
              <Button className="bg-primary hover:bg-primary/90">Add New Post</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manage Portfolio Items</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Update your cinematic works and student projects.</p>
              <Button className="bg-primary hover:bg-primary/90">Add New Work</Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 bg-yellow-50 border-2 border-yellow-200 p-6 rounded-2xl">
          <h3 className="font-black text-yellow-800 mb-2">Notice</h3>
          <p className="text-yellow-700">
            This dashboard is directly connected to your Firebase project. Any changes made here will reflect instantly on the website.
          </p>
        </div>
      </div>
    </div>
  )
}

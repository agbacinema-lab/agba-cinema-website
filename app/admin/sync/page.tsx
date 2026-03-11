"use client"

import { useState } from "react"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import blogData from "@/data/blog.json"
import portfolioData from "@/data/portfolio.json"

export default function SyncPage() {
  const [status, setStatus] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const handleSync = async () => {
    // Check if env vars are loaded
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      setStatus("Error: Firebase keys are not loaded. Please RESTART your terminal (npm run dev) so Next.js can read your .env.local file.")
      return
    }

    setLoading(true)
    setStatus("Connecting to Firebase...")
    
    try {
      // Sync Blog
      setStatus("Syncing 8 Blog Posts...")
      let blogCount = 0
      for (const post of blogData) {
        const { id, ...postData } = post
        await addDoc(collection(db, "posts"), {
          ...postData,
          createdAt: serverTimestamp()
        })
        blogCount++
        setStatus(`Syncing Blog: ${blogCount}/${blogData.length}`)
      }

      // Sync Portfolio
      setStatus("Syncing 15 Portfolio Items...")
      let portfolioCount = 0
      for (const item of portfolioData) {
        const { id, ...itemData } = item
        await addDoc(collection(db, "portfolio"), {
          ...itemData,
          createdAt: serverTimestamp()
        })
        portfolioCount++
        setStatus(`Syncing Portfolio: ${portfolioCount}/${portfolioData.length}`)
      }

      setStatus("✅ Sync complete! All data is now in your Firebase Firestore.")
    } catch (error: any) {
      console.error(error)
      setStatus(`❌ Error: ${error.message} (Check if your Firestore is in 'Test Mode' and that you have a stable internet connection)`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-black text-center">Firebase Data Sync</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-600 text-center">
            This tool will take your local JSON files and upload them directly to your Firestore database.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <h4 className="font-bold text-blue-800 mb-1 text-sm uppercase">Data to Sync:</h4>
            <ul className="text-sm text-blue-700 list-disc list-inside">
              <li>{blogData.length} Blog Posts</li>
              <li>{portfolioData.length} Portfolio Items</li>
            </ul>
          </div>

          <Button 
            onClick={handleSync} 
            disabled={loading}
            className="w-full bg-yellow-400 text-black hover:bg-yellow-300 font-bold py-6 rounded-xl"
          >
            {loading ? "Syncing..." : "Sync to Firestore Now"}
          </Button>

          {status && (
            <div className={`p-4 rounded-xl text-center text-sm font-medium ${status.includes("Error") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
              {status}
            </div>
          )}

          <p className="text-center text-xs text-gray-400 italic">
            Note: Only run this once to avoid duplicate entries.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

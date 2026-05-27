"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export default function PortfolioMigrationPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleMigrate = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/migrate-portfolio-sections", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Migration failed")
        setResult({ error: data.error })
      } else {
        toast.success(data.message)
        setResult(data)
      }
    } catch (error) {
      console.error("Migration error:", error)
      toast.error("Migration failed: " + (error as any).message)
      setResult({ error: (error as any).message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="border border-muted shadow-premium rounded-[2.5rem] bg-card p-12">
          <CardHeader>
            <CardTitle className="text-3xl font-black">Portfolio Database Migration</CardTitle>
          </CardHeader>

          <CardContent className="space-y-8">
            <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-6 space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-black text-yellow-400 mb-2">What this does:</h3>
                  <ul className="text-sm space-y-1 text-gray-300">
                    <li>• Adds <code className="bg-black/30 px-2 py-1 rounded">portfolioSection</code> field to items</li>
                    <li>• Maps categories to sections (Documentary → Video, Logo → Graphics, etc.)</li>
                    <li>• Skips items that already have portfolioSection set</li>
                    <li>• Enables section filtering to work properly</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleMigrate}
                disabled={loading}
                className="w-full bg-yellow-400 text-black font-black h-14 rounded-2xl hover:bg-yellow-500 disabled:opacity-50"
              >
                {loading ? "Running migration..." : "Run Migration"}
              </Button>

              {result && !result.error && (
                <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-black text-green-400 mb-2">Migration Complete</h3>
                      <div className="text-sm space-y-1 text-gray-300">
                        <p>✓ Items migrated: <span className="font-bold text-green-400">{result.migrated}</span></p>
                        <p>✓ Items skipped: <span className="font-bold">{result.skipped}</span></p>
                        <p>✓ Total items: <span className="font-bold">{result.total}</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {result?.error && (
                <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-black text-red-400 mb-2">Migration Failed</h3>
                      <p className="text-sm text-gray-300">{result.error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-black/30 rounded-xl p-6 text-sm text-gray-400 space-y-2">
              <p className="font-bold text-white">Category to Section Mapping:</p>
              <ul className="space-y-1 text-xs">
                <li><span className="text-gray-300">Video:</span> Documentary, Motion Graphic, Short Form, Event, Product Launch, Brand Story</li>
                <li><span className="text-gray-300">Graphics:</span> Logo, Brand Identity, Social, Print, Packaging</li>
                <li><span className="text-gray-300">Content Writing:</span> Scripts, Copywriting, Ad Copy, Blog, SEO, Case Study</li>
                <li><span className="text-gray-300">Digital Marketing:</span> Campaign, Social Ads, Growth, Strategy, Analytics</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

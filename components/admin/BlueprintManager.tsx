"use client"

import { useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { motion, Reorder } from "framer-motion"
import { Plus, Trash2, GripVertical, Save, Sparkles, Footprints } from "lucide-react"

export default function BlueprintManager() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [features, setFeatures] = useState<string[]>([])
  const [steps, setSteps] = useState<{step: string, label: string}[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        const snap = await getDoc(doc(db, "siteSettings", "blueprint"))
        if (snap.exists()) {
          const data = snap.data()
          setFeatures(data.features || [])
          setSteps(data.steps || [])
        } else {
          // Default data if none exists
          setFeatures([
            "Structured video editing training",
            "Real brand projects",
            "Internship placement",
            "1-on-1 mentorship",
            "Portfolio development"
          ])
          setSteps([
            { step: "01", label: "Learn Editing" },
            { step: "02", label: "Work on Brands" },
            { step: "03", label: "Get Internship" },
            { step: "04", label: "Build Portfolio" }
          ])
        }
      } catch (e) {
        toast.error("Failed to load blueprint data")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const saveBlueprint = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, "siteSettings", "blueprint"), {
        features,
        steps,
        updatedAt: new Date().toISOString()
      })
      toast.success("Blueprint synchronized successfully!")
    } catch (e) {
      toast.error("Synchronization failed")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-20 text-center font-black animate-pulse">Initializing Blueprint Registry...</div>

  return (
    <div className="space-y-12 max-w-5xl mx-auto pb-20">
      <div className="flex justify-between items-end">
        <div className="text-left">
          <h3 className="text-3xl font-black tracking-tighter mb-2">Program Blueprint</h3>
          <p className="text-muted-foreground text-sm font-medium">Define the core value stack and mission trajectory for the GoPro program.</p>
        </div>
        <Button 
          onClick={saveBlueprint} 
          disabled={saving}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-black h-16 px-10 rounded-2xl shadow-xl shadow-yellow-400/20"
        >
          {saving ? "Deploying..." : "Deploy blueprint"}
          <Save className="ml-2 h-5 w-5" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Features Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="text-yellow-500 h-6 w-6" />
            <h4 className="text-xl font-black tracking-tight">Core Features (What They Get)</h4>
          </div>
          
          <Reorder.Group axis="y" values={features} onReorder={setFeatures} className="space-y-3">
            {features.map((feature, index) => (
              <Reorder.Item key={feature} value={feature}>
                <div className="flex gap-3 group">
                  <div className="flex-grow flex items-center bg-muted/20 border border-muted/30 rounded-xl px-4 h-14 focus-within:border-yellow-400 transition-all">
                    <GripVertical className="h-4 w-4 text-muted-foreground mr-3 cursor-grab opacity-30 group-hover:opacity-100" />
                    <Input 
                      value={feature}
                      onChange={(e) => {
                        const newF = [...features]
                        newF[index] = e.target.value
                        setFeatures(newF)
                      }}
                      className="border-none bg-transparent h-full px-0 font-medium focus-visible:ring-0"
                    />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setFeatures(features.filter((_, i) => i !== index))}
                    className="h-14 w-14 rounded-xl text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
          
          <Button 
            onClick={() => setFeatures([...features, "New feature item"])}
            variant="outline" 
            className="w-full h-14 border-dashed rounded-xl font-black text-[10px] uppercase tracking-widest"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add feature component
          </Button>
        </section>

        {/* Steps Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Footprints className="text-yellow-500 h-6 w-6" />
            <h4 className="text-xl font-black tracking-tight">Mission Steps (The Journey)</h4>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <motion.div key={index} layout className="flex gap-4 items-start">
                <div className="h-14 w-20 flex items-center justify-center bg-black text-yellow-400 rounded-xl font-black text-sm shrink-0 border border-yellow-400/20">
                  {step.step}
                </div>
                <div className="flex-grow flex gap-2">
                   <Input 
                    value={step.label}
                    onChange={(e) => {
                      const newS = [...steps]
                      newS[index].label = e.target.value
                      setSteps(newS)
                    }}
                    className="h-14 rounded-xl bg-muted/20 border-muted/30 font-black tracking-tight focus:bg-card transition-all"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setSteps(steps.filter((_, i) => i !== index))}
                    className="h-14 w-14 rounded-xl text-red-500 hover:bg-red-500/10 shrink-0"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          <Button 
            onClick={() => setSteps([...steps, { step: `0${steps.length + 1}`, label: "Next mission milestone" }])}
            variant="outline" 
            className="w-full h-14 border-dashed rounded-xl font-black text-[10px] uppercase tracking-widest"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add journey step
          </Button>
        </section>
      </div>
    </div>
  )
}

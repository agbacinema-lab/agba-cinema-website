"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Building2, Globe, Mail, Phone, User, Save, ShieldCheck } from "lucide-react"

export default function BrandSettings({ brandData, onRefresh }: any) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    companyName: brandData?.companyName || "",
    contactPerson: brandData?.contactPerson || "",
    website: brandData?.website || "",
    industry: brandData?.industry || "",
    requirements: brandData?.requirements || "",
  })

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const brandRef = doc(db, "brands", user.uid)
      await updateDoc(brandRef, {
        ...formData,
        updatedAt: serverTimestamp()
      })
      toast.success("Brand profile updated successfully!")
      onRefresh()
    } catch (error) {
      console.error("Error updating brand profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl pb-20">
      <header>
        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-foreground">Corporate Configuration</h2>
        <p className="text-muted-foreground font-medium">Manage your brand identity and recruitment preferences within the ÀGBÀ ecosystem.</p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        <Card className="border-none shadow-premium rounded-[2.5rem] bg-card overflow-hidden transition-colors">
           <CardHeader className="bg-black text-white p-10">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-6 w-6 text-yellow-400" />
                    <CardTitle className="text-2xl font-black italic uppercase tracking-tighter text-white">Brand Identity</CardTitle>
                  </div>
                  <CardDescription className="text-gray-400">Public metadata and contact channels.</CardDescription>
                </div>
                {brandData?.verified && (
                  <div className="bg-yellow-400/10 text-yellow-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-yellow-400/20">
                    <ShieldCheck className="h-3 w-3" /> Verified Partner
                  </div>
                )}
              </div>
           </CardHeader>

           <CardContent className="p-10">
             <form onSubmit={handleUpdate} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormInput 
                    label="Company Name" 
                    value={formData.companyName} 
                    onChange={(v: string) => setFormData({...formData, companyName: v})} 
                    icon={<Building2 className="h-4 w-4" />}
                  />
                  <FormInput 
                    label="Contact Person" 
                    value={formData.contactPerson} 
                    onChange={(v: string) => setFormData({...formData, contactPerson: v})} 
                    icon={<User className="h-4 w-4" />}
                  />
                  <FormInput 
                    label="Official Website" 
                    value={formData.website} 
                    onChange={(v: string) => setFormData({...formData, website: v})} 
                    icon={<Globe className="h-4 w-4" />}
                    placeholder="https://..."
                  />
                  <FormInput 
                    label="Industry Focus" 
                    value={formData.industry} 
                    onChange={(v: string) => setFormData({...formData, industry: v})} 
                    placeholder="e.g. Media Production, FinTech"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Current Recruitment Brief</label>
                  <Textarea 
                    value={formData.requirements}
                    onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                    placeholder="Describe the type of talent you are looking for..."
                    className="min-h-32 rounded-3xl border-muted bg-muted/30 focus:bg-background text-foreground font-medium p-6 leading-relaxed outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                   <p className="text-[9px] text-muted-foreground italic text-center">This brief helps our HODs match the best students to your requirements.</p>
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full md:w-auto bg-yellow-400 hover:bg-yellow-500 text-black font-black h-16 rounded-2xl px-12 italic uppercase tracking-tighter shadow-xl shadow-yellow-400/20"
                    disabled={loading}
                  >
                    {loading ? "Updating Systems..." : "Commit Profile Changes"}
                    <Save className="ml-2 h-4 w-4" />
                  </Button>
                </div>
             </form>
           </CardContent>
        </Card>

        {/* Access Level Card */}
        <Card className="border-none shadow-premium rounded-[2.5rem] bg-black text-white p-10 relative overflow-hidden group">
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="space-y-2 text-center md:text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400">Subscription Status</p>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter">
                  {brandData?.hasPaidAccess ? "AGBA ELITE BOARD ACCESS" : "STANDARD PARTNER ACCESS"}
                </h3>
                <p className="text-gray-400 font-medium text-sm italic">
                  {brandData?.hasPaidAccess 
                    ? "Full visibility into our entire talent collective and priority deployment." 
                    : "Limited talent scouting. Upgrade to unlock full student portfolios and direct contact."}
                </p>
              </div>
              {!brandData?.hasPaidAccess && (
                <Button className="bg-white text-black hover:bg-yellow-400 font-black px-10 h-16 rounded-2xl italic uppercase tracking-tighter shadow-xl">
                  Unlock Elite Board
                </Button>
              )}
           </div>
           <div className="absolute right-0 top-0 w-64 h-64 bg-yellow-400/5 blur-[80px] -mr-32 -mt-32" />
        </Card>
      </div>
    </div>
  )
}

function FormInput({ label, value, onChange, icon, placeholder }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <Input 
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`${icon ? "pl-12" : "px-6"} h-14 rounded-2xl border-muted bg-muted/30 focus:bg-background text-foreground font-bold transition-all focus:ring-2 focus:ring-yellow-400`}
        />
      </div>
    </div>
  )
}

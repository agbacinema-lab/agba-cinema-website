"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { User, Mail, Shield, Phone, Camera, Save, Fingerprint } from "lucide-react"

export default function AdminProfile() {
  const { profile, user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    phone: profile?.phone || "",
    bio: profile?.bio || "",
    specialization: profile?.specialization || "",
  })

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, {
        ...formData,
        updatedAt: serverTimestamp()
      })
      toast.success("Profile updated successfully!")
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Profile Card */}
        <Card className="w-full md:w-80 border-none shadow-premium rounded-[2.5rem] bg-black text-white overflow-hidden shrink-0">
          <div className="h-32 bg-yellow-400 relative" />
          <CardContent className="pt-0 relative px-8 pb-12">
            <div className="flex justify-center -mt-16 mb-6">
              <div className="w-32 h-32 bg-black rounded-[2rem] border-8 border-black flex items-center justify-center text-4xl font-black relative group cursor-pointer">
                {profile?.name?.[0]}
                <div className="absolute inset-0 bg-black/60 rounded-[1.5rem] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">{profile?.name}</h3>
              <div className="inline-flex items-center gap-2 bg-yellow-400 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                <Shield className="h-3 w-3" />
                {profile?.role?.replace('_', ' ')}
              </div>
              <p className="text-gray-500 text-sm font-medium pt-4">
                {profile?.bio || "No bio set. Tell the team about yourself."}
              </p>
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
              <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-gray-400">
                <Mail className="h-4 w-4 text-yellow-500" />
                {profile?.email}
              </div>
              <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-gray-400">
                <Fingerprint className="h-4 w-4 text-yellow-500" />
                {profile?.tutorId || profile?.uid.substring(0, 8)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="flex-grow border-none shadow-premium rounded-[2.5rem] bg-white p-12 overflow-hidden relative">
           <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 blur-3xl rounded-full" />
           
           <CardHeader className="p-0 mb-8">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter">Personnel Profile</h2>
                  <p className="text-gray-500 font-medium">Manage your administrative identity and credentials.</p>
                </div>
                {!isEditing && (
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="bg-black text-white hover:bg-gray-800 h-12 rounded-xl px-6 font-bold"
                  >
                    Edit Details
                  </Button>
                )}
              </div>
           </CardHeader>

           <CardContent className="p-0">
             <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Display Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        disabled={!isEditing}
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="pl-12 h-14 rounded-2xl border-gray-100 bg-gray-50 font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Phone Contact</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        disabled={!isEditing}
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="+234..."
                        className="pl-12 h-14 rounded-2xl border-gray-100 bg-gray-50 font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Department / Specialization</label>
                  <Input 
                    disabled={!isEditing}
                    value={formData.specialization}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    placeholder="e.g. Head of Video Editing"
                    className="h-14 rounded-2xl border-gray-100 bg-gray-50 font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Professional Bio</label>
                  <Textarea 
                    disabled={!isEditing}
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Tell the team about your creative background..."
                    className="min-h-32 rounded-2xl border-gray-100 bg-gray-50 font-medium leading-relaxed"
                  />
                </div>

                {isEditing && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 pt-4"
                  >
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="bg-yellow-400 hover:bg-yellow-500 text-black font-black h-14 rounded-2xl px-12 italic uppercase tracking-tighter"
                    >
                      {loading ? "Processing..." : "Commit Changes"}
                      <Save className="ml-2 h-4 w-4" />
                    </Button>
                    <Button 
                      type="button"
                      variant="ghost" 
                      onClick={() => setIsEditing(false)}
                      className="h-14 rounded-2xl px-12 font-black italic uppercase tracking-tighter text-gray-400"
                    >
                      Discard
                    </Button>
                  </motion.div>
                )}
             </form>
           </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AccessCard title="System Role" value={profile?.role?.toUpperCase()} sub="Full Administrative Access" />
        <AccessCard title="Last Activity" value="Today" sub={new Date().toLocaleTimeString()} />
        <AccessCard title="Account Secure" value="Verified" sub="Multi-Factor Active" />
      </div>
    </div>
  )
}

function AccessCard({ title, value, sub }: any) {
  return (
    <Card className="border-none shadow-premium rounded-3xl bg-gray-50/50 p-6 border border-gray-100 hover:bg-white transition-colors">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{title}</p>
      <h4 className="text-xl font-black italic uppercase tracking-tighter text-gray-900">{value}</h4>
      <p className="text-xs text-gray-500 font-medium">{sub}</p>
    </Card>
  )
}

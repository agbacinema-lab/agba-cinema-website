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
              <div className="w-32 h-32 bg-background rounded-[2rem] border-8 border-card flex items-center justify-center text-4xl font-black relative group cursor-pointer transition-colors shadow-2xl">
                {profile?.name?.[0]}
                <div className="absolute inset-0 bg-background/60 rounded-[1.5rem] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="h-6 w-6 text-foreground" />
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
        <Card className="flex-grow border border-muted shadow-premium rounded-[3rem] bg-card p-12 overflow-hidden relative transition-colors">
           <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-400/5 blur-[100px] rounded-full pointer-events-none" />
           
           <CardHeader className="p-0 mb-10 relative z-10">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <h2 className="text-4xl font-black italic uppercase tracking-tighter text-foreground">Profile Settings</h2>
                  <p className="text-muted-foreground font-medium italic">Manage your name, contact info, and role details here.</p>
                </div>
                {!isEditing && (
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="bg-foreground text-background hover:bg-yellow-400 hover:text-black h-16 rounded-[1.5rem] px-8 font-black uppercase tracking-widest text-[11px] transition-all shadow-xl active:scale-95"
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
           </CardHeader>

           <CardContent className="p-0 relative z-10">
             <form onSubmit={handleUpdate} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-6">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500" />
                      <Input 
                        disabled={!isEditing}
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="pl-14 h-16 rounded-2xl border-muted bg-muted/20 font-black uppercase italic tracking-tighter focus:bg-card focus:border-foreground transition-all text-foreground"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-6">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500" />
                      <Input 
                        disabled={!isEditing}
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="+234..."
                        className="pl-14 h-16 rounded-2xl border-muted bg-muted/20 font-black uppercase italic tracking-tighter focus:bg-card focus:border-foreground transition-all text-foreground"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-6">Role / Job Title</label>
                  <Input 
                    disabled={!isEditing}
                    value={formData.specialization}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    placeholder="e.g. Head of Visual Effects"
                    className="h-16 rounded-2xl border-muted bg-muted/20 font-black uppercase italic tracking-tighter focus:bg-card focus:border-foreground transition-all text-foreground"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-6">Bio</label>
                  <Textarea 
                    disabled={!isEditing}
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Describe your creative authority and trajectory..."
                    className="min-h-40 rounded-[2.5rem] border-muted bg-muted/20 font-medium leading-relaxed italic focus:bg-card focus:border-foreground transition-all text-foreground p-8"
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
                      className="bg-yellow-400 hover:bg-yellow-500 text-black font-black h-16 rounded-[1.5rem] px-12 italic uppercase tracking-tighter transition-all shadow-xl shadow-yellow-400/20 active:scale-95"
                    >
                      {loading ? "SAVING..." : "SAVE CHANGES"}
                      <Save className="ml-3 h-5 w-5" />
                    </Button>
                    <Button 
                      type="button"
                      variant="ghost" 
                      onClick={() => setIsEditing(false)}
                      className="h-16 rounded-[1.5rem] px-10 font-black italic uppercase tracking-tighter text-muted-foreground hover:text-foreground hover:bg-muted/10 transition-all"
                    >
                      CANCEL
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
    <Card className="border border-muted shadow-premium rounded-[2.5rem] bg-card p-8 hover:border-foreground/30 transition-all duration-500 group overflow-hidden relative">
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-3 relative z-10 transition-colors group-hover:text-yellow-500">{title}</p>
      <h4 className="text-2xl font-black italic uppercase tracking-tighter text-foreground relative z-10">{value}</h4>
      <p className="text-[10px] text-muted-foreground font-medium mt-1 relative z-10 opacity-60 tracking-widest">{sub}</p>
      <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-yellow-400/5 blur-2xl rounded-full transition-all group-hover:bg-yellow-400/10" />
    </Card>
  )
}

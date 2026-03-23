"use client"

import { useState, useEffect } from "react"
import { promoCodeService, adminService } from "@/lib/services"
import { PromoCode, UserProfile } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Ticket, Plus, Loader2, Trash2, Users, Search, QrCode } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"

export default function PromoCodeManager() {
  const [codes, setCodes] = useState<PromoCode[]>([])
  const [ngos, setNgos] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState({
    code: "",
    ngoId: "",
    maxUses: 10,
    discountType: "percent" as "percent" | "fixed",
    discountValue: 100,
    programType: "gopro" as "gopro" | "mentorship",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [allCodes, allUsers] = await Promise.all([
        promoCodeService.getAllCodes(),
        adminService.getAllUsers()
      ])
      setCodes(allCodes)
      setNgos(allUsers.filter(u => u.role === 'ngo'))
    } catch (error) {
      toast.error("Failed to load promo code infrastructure.")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.code || !formData.ngoId) {
        toast.error("Code and NGO assignment are mandatory.")
        return
    }

    setCreating(true)
    try {
      const ngo = ngos.find(n => n.uid === formData.ngoId)
      await promoCodeService.createCode({
        code: formData.code.toUpperCase(),
        ngoId: formData.ngoId,
        ngoName: ngo?.name || "Unknown NGO",
        maxUses: Number(formData.maxUses),
        usedCount: 0,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        programType: formData.programType,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months default
        createdAt: new Date()
      })
      toast.success(`Promo code ${formData.code} generated successfully for ${ngo?.name}.`)
      setFormData({ code: "", ngoId: "", maxUses: 10, discountType: "percent", discountValue: 100, programType: "mentorship" })
      loadData()
    } catch (error) {
      toast.error("Failed to generate code.")
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-yellow-500">
                <Ticket className="h-6 w-6" />
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">Voucher Command Center</h2>
            </div>
            <p className="text-muted-foreground font-medium max-w-xl">
                Generate and manage high-authority sponsorship codes for NGO partners and specialized grants.
            </p>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Create Code Form */}
        <Card className="lg:col-span-1 border-none shadow-premium rounded-[2.5rem] bg-card overflow-hidden h-fit">
            <CardHeader className="bg-black text-white p-8">
                <CardTitle className="text-xl font-black italic uppercase tracking-tighter">New Authorization</CardTitle>
                <CardDescription className="text-gray-400 font-bold">Define the parameters for a new sponsorship code.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
                <form onSubmit={handleCreate} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Unique Protocol Code</label>
                        <Input 
                            placeholder="e.g. NGO_FREE_2024" 
                            value={formData.code}
                            onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                            className="bg-muted/10 border-muted h-14 rounded-2xl px-6 font-black uppercase text-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Assign to Partner (NGO)</label>
                        <Select value={formData.ngoId} onValueChange={v => setFormData({...formData, ngoId: v})}>
                            <SelectTrigger className="h-14 bg-muted/10 border-muted rounded-2xl px-6 font-bold focus:ring-2 focus:ring-yellow-400 outline-none">
                                <SelectValue placeholder="Select Partner Authority" />
                            </SelectTrigger>
                            <SelectContent className="bg-black text-white border-white/10 rounded-2xl">
                                {ngos.map(ngo => (
                                    <SelectItem key={ngo.uid} value={ngo.uid} className="font-bold py-3 hover:bg-white/10 text-white">
                                        {ngo.name}
                                    </SelectItem>
                                ))}
                                {ngos.length === 0 && (
                                    <p className="p-4 text-xs font-bold text-gray-500 italic">No NGO partners detected in sector.</p>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Target Program / Sector</label>
                        <Select value={formData.programType} onValueChange={v => setFormData({...formData, programType: v as any})}>
                            <SelectTrigger className="h-14 bg-muted/10 border-muted rounded-2xl px-6 font-bold focus:ring-2 focus:ring-yellow-400 outline-none">
                                <SelectValue placeholder="Select Program Goal" />
                            </SelectTrigger>
                            <SelectContent className="bg-black text-white border-white/10 rounded-2xl">
                                <SelectItem value="gopro" className="font-bold py-3 hover:bg-white/10 text-white uppercase tracking-widest">GoPro (Creative Career)</SelectItem>
                                <SelectItem value="mentorship" className="font-bold py-3 hover:bg-white/10 text-white uppercase tracking-widest">Mentorship (Advanced)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Authority Limit</label>
                            <Input 
                                type="number" 
                                value={formData.maxUses}
                                onChange={e => setFormData({...formData, maxUses: parseInt(e.target.value)})}
                                className="bg-muted/10 border-muted h-14 rounded-2xl px-6 font-black text-lg"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Value (%)</label>
                            <Input 
                                type="number" 
                                value={formData.discountValue}
                                onChange={e => setFormData({...formData, discountValue: parseInt(e.target.value)})}
                                className="bg-muted/10 border-muted h-14 rounded-2xl px-6 font-black text-lg"
                            />
                        </div>
                    </div>

                    <Button 
                        type="submit" 
                        disabled={creating || loading}
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-black h-16 rounded-2xl italic uppercase tracking-tighter shadow-xl shadow-yellow-400/20 active:scale-95 transition-all mt-4"
                    >
                        {creating ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Plus className="h-4 w-4 mr-2" /> Activate Code</>}
                    </Button>
                </form>
            </CardContent>
        </Card>

        {/* Existing Codes List */}
        <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-4 mb-2">
                <div className="h-px flex-1 bg-muted" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground">Active Sponsorship Fleet</span>
                <div className="h-px flex-1 bg-muted" />
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1,2,3].map(i => <div key={i} className="h-24 bg-muted/20 rounded-3xl animate-pulse" />)}
                </div>
            ) : codes.length === 0 ? (
                <div className="p-20 text-center space-y-4 border-2 border-dashed border-muted rounded-[3rem]">
                    <QrCode className="h-12 w-12 text-muted/30 mx-auto" />
                    <p className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground italic">No sponsorship signals detected.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {codes.map(code => (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={code.id}
                            className="bg-card border border-muted p-6 rounded-[2.5rem] hover:border-yellow-400 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-yellow-400/10 rounded-xl group-hover:bg-yellow-400 group-hover:text-black transition-colors">
                                    <Ticket className="h-5 w-5" />
                                </div>
                                    <div className="flex flex-col items-end">
                                         {/* Usage Ring */}
                                         <div className="flex items-center gap-2">
                                              <span className="text-[9px] font-black uppercase text-yellow-400 tracking-widest mb-1">Target: {code.programType || "ALL SECTORS"}</span>
                                         </div>
                                         <div className="flex items-center gap-2">
                                              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{code.discountValue}% DISCOUNT</span>
                                         </div>
                                         <p className="text-[10px] font-bold text-gray-500 uppercase italic mt-1">Exp: 90 Days</p>
                                    </div>
                            </div>
                            
                            <h3 className="text-xl font-black italic tracking-tighter uppercase mb-1">{code.code}</h3>
                            <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest mb-4">FOR: {code.ngoName}</p>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                        <span>Authority Reach</span>
                                        <span>{Math.round((code.usedCount / code.maxUses) * 100)}%</span>
                                    </div>
                                    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(code.usedCount / code.maxUses) * 100}%` }}
                                            className="h-full bg-yellow-400"
                                        />
                                    </div>
                                    <p className="text-right text-[10px] font-bold text-muted-foreground italic">{code.usedCount} of {code.maxUses} Units Deployed</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  )
}

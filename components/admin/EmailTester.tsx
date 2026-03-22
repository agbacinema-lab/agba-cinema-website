"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Send, Loader2, CheckCircle2, Users, User, Zap, Shield, MessageSquare, AlertTriangle, Filter } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

export default function EmailTester() {
  const [targetType, setTargetType] = useState<"individual" | "broadcast">("individual")
  const [targetAudience, setTargetAudience] = useState("all_students")
  const [selectedCohort, setSelectedCohort] = useState("all")
  const [receiver, setReceiver] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [lastSentCount, setLastSentCount] = useState<number | null>(null)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (targetType === 'individual' && !receiver) {
      toast.error("Please provide a target coordinate.")
      return
    }
    if (!subject || !message) {
      toast.error("Subject and payload are required.")
      return
    }

    setLoading(true)
    const t = toast.loading(targetType === 'individual' ? "Broadcasting signal..." : "Initiating bulk broadcast sequence...")

    try {
      const endpoint = targetType === 'individual' ? "/api/notifications/email" : "/api/notifications/bulk-email"
      const payload = targetType === 'individual' 
        ? { to_email: receiver, to_name: "Creative Liaison", subject, message }
        : { targetAudience, subject, message, cohort: selectedCohort }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Signal interference detected. Broadcast failed.")
      }

      toast.success(data.message || "Broadcast successful! Signal received at destination.", { id: t })
      setLastSentCount(targetType === 'individual' ? 1 : data.recipientCount)
      setSubject("")
      setMessage("")
      
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Protocol failure.", { id: t })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-12 max-w-5xl mx-auto pb-20">
      <div className="space-y-4">
        <div className="flex items-center gap-4 text-yellow-400 mb-2">
            <div className="p-3 bg-yellow-400/10 rounded-2xl">
                <Mail className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-black tracking-tighter uppercase italic">Platform Communications Command</h2>
        </div>
        <p className="text-muted-foreground text-lg max-w-3xl font-medium leading-relaxed">
            Execute manual broadcasts to test signal clarity or deploy targeted transmissions across the entire fleet of students, staff, and partners. 
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-2">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Card className="border border-muted shadow-premium bg-card overflow-hidden rounded-[3rem]">
                <CardHeader className="p-10 border-b border-muted bg-muted/5">
                    <CardTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center justify-between">
                        <span>Transmission Payload</span>
                        <Zap className="h-5 w-5 text-yellow-400 animate-pulse" />
                    </CardTitle>
                    <CardDescription className="font-bold text-muted-foreground">Define your signal parameters and deployment target.</CardDescription>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                    <form onSubmit={handleSend} className="space-y-10">
                    
                    {/* Target Selection */}
                    <div className="grid grid-cols-2 gap-4 p-2 bg-muted/20 rounded-2xl">
                        <button 
                            type="button"
                            onClick={() => setTargetType('individual')}
                            className={`flex items-center justify-center gap-2 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${targetType === 'individual' ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' : 'text-gray-500 hover:text-white'}`}
                        >
                            <User className="h-4 w-4" />
                            Individual
                        </button>
                        <button 
                            type="button"
                            onClick={() => setTargetType('broadcast')}
                            className={`flex items-center justify-center gap-2 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${targetType === 'broadcast' ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' : 'text-gray-500 hover:text-white'}`}
                        >
                            <Users className="h-4 w-4" />
                            Broadcast
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {targetType === 'individual' ? (
                            <motion.div 
                                key="individual"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-3"
                            >
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Receiver Coordinates (Email)</label>
                                <Input 
                                value={receiver}
                                onChange={(e) => setReceiver(e.target.value)}
                                placeholder="e.g. operative@gmail.com" 
                                className="bg-muted/20 border-muted h-16 rounded-2xl px-6 font-bold text-lg focus:ring-2 focus:ring-yellow-400"
                                />
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="broadcast"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-6"
                            >
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Target Audience Segment</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 'all_students', label: 'All Students' },
                                            { id: 'all_staff', label: 'All Staff' },
                                            { id: 'all_brand', label: 'All Brands' },
                                            { id: 'all_tutor', label: 'All Tutors' },
                                            { id: 'all_director', label: 'All Directors' },
                                            { id: 'all_gopro', label: 'GoPro Fleet' },
                                            { id: 'all_mentorship', label: 'Mentorship Ops' },
                                            { id: 'everyone', label: 'Platform Global' },
                                        ].map((opt) => (
                                            <button 
                                                key={opt.id}
                                                type="button"
                                                onClick={() => setTargetAudience(opt.id)}
                                                className={`h-14 rounded-2xl px-4 font-bold text-xs border border-muted transition-all flex items-center gap-3 ${targetAudience === opt.id ? 'bg-yellow-400 text-black border-yellow-400 shadow-xl' : 'bg-muted/5 text-gray-400 hover:bg-muted/20'}`}
                                            >
                                                <div className={`w-2 h-2 rounded-full ${targetAudience === opt.id ? 'bg-black animate-pulse' : 'bg-gray-700'}`} />
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Dynamic Cohort Selection for GoPro */}
                                {targetAudience === 'all_gopro' && (
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="p-6 bg-yellow-400/5 border border-yellow-400/10 rounded-3xl space-y-4"
                                    >
                                        <div className="flex items-center gap-2 text-yellow-400">
                                            <Filter className="h-4 w-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Cohort Precision Filter</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['all', 'Cohort 1', 'Cohort 2', 'Cohort 3', 'Cohort 4'].map((c) => (
                                                <button 
                                                    key={c}
                                                    type="button"
                                                    onClick={() => setSelectedCohort(c)}
                                                    className={`h-10 rounded-xl text-[10px] font-black uppercase transition-all ${selectedCohort === c ? 'bg-yellow-400 text-black' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                                                >
                                                    {c}
                                                </button>
                                            ))}
                                            <Input 
                                                placeholder="Custom..."
                                                className="h-10 bg-white/5 border-none text-[10px] font-black uppercase rounded-xl"
                                                onChange={(e) => setSelectedCohort(e.target.value)}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-10 pt-4">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Transmission Header (Subject)</label>
                            <Input 
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Priority Signal..." 
                            className="bg-muted/20 border-muted h-16 rounded-2xl px-6 font-bold text-lg focus:ring-2 focus:ring-yellow-400"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Broadcast Payload (Message Body)</label>
                            <Textarea 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Input your secure message here..." 
                            className="bg-muted/20 border-muted min-h-[220px] rounded-[2rem] p-8 font-bold text-lg focus:ring-2 focus:ring-yellow-400 transition-all leading-relaxed"
                            />
                        </div>
                    </div>

                    <Button 
                        type="submit"
                        disabled={loading}
                        variant={targetType === 'broadcast' ? 'destructive' : 'default'}
                        className={`w-full h-24 rounded-[2.5rem] font-black italic uppercase tracking-[0.2em] text-xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] active:scale-95 transition-all flex flex-col items-center justify-center gap-1 ${targetType === 'broadcast' ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-yellow-400 hover:bg-yellow-500 text-black shadow-yellow-400/10'}`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-8 w-8 animate-spin" />
                                <span className="text-[10px] tracking-[0.4em] opacity-80 mt-2">DEPLOYING SIGNAL...</span>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-3">
                                    <Send className="h-7 w-7" />
                                    <span>{targetType === 'broadcast' ? 'Deploy Global Signal' : 'Deploy Transmission'}</span>
                                </div>
                                <span className="text-[10px] tracking-[0.4em] opacity-60 mt-2 font-black italic">
                                    TARGET: {targetType === 'individual' ? 'SINGLE UNIT' : `${targetAudience.replace('_', ' ').toUpperCase()}${selectedCohort !== 'all' ? ` [${selectedCohort.toUpperCase()}]` : ''}`}
                                </span>
                            </>
                        )}
                    </Button>
                    </form>

                    {lastSentCount !== null && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 flex items-center justify-between mt-8"
                    >
                        <div className="flex items-center gap-4">
                            <CheckCircle2 className="h-6 w-6 text-blue-500 shrink-0" />
                            <p className="text-blue-500 font-black tracking-tight italic">TRANSMISSION ACKNOWLEDGED: {lastSentCount} RECIPIENTS REACHED</p>
                        </div>
                        <div className="h-10 w-10 bg-blue-500/20 rounded-xl flex items-center justify-center font-black text-blue-500 italic">
                            #{lastSentCount}
                        </div>
                    </motion.div>
                    )}
                </CardContent>
                </Card>
            </motion.div>
        </div>

        <div className="space-y-8">
            <Card className="p-10 border border-red-500/20 shadow-premium bg-red-500/5 rounded-[3rem] space-y-6">
                <div className="flex items-center gap-3 text-red-500 mb-2">
                    <AlertTriangle className="h-6 w-6" />
                    <h3 className="font-black italic uppercase tracking-tighter">Command Warning</h3>
                </div>
                <p className="text-sm font-bold text-red-500/80 leading-relaxed italic">
                    Broadcast signals are delivered instantly to all matching units. There is NO recall protocol once the signal is in transit. 
                </p>
                <div className="space-y-4 pt-4">
                    <div className="flex gap-4 items-start">
                        <div className="h-6 w-6 shrink-0 bg-red-500/10 rounded flex items-center justify-center text-[10px] font-black text-red-500">1</div>
                        <p className="text-[11px] font-bold text-gray-400">Verify your payload message for typos before deployment.</p>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="h-6 w-6 shrink-0 bg-red-500/10 rounded flex items-center justify-center text-[10px] font-black text-red-500">2</div>
                        <p className="text-[11px] font-bold text-gray-400">Ensure the target segment is absolutely correct for the message content.</p>
                    </div>
                </div>
            </Card>

            <Card className="p-10 border border-muted bg-muted/5 rounded-[3rem] space-y-8">
                <div className="flex items-center gap-3 text-blue-400">
                    <Shield className="h-6 w-6" />
                    <h3 className="font-black italic uppercase tracking-tighter">Transmission Security</h3>
                </div>
                <div className="space-y-6">
                    <div className="p-6 bg-muted/20 rounded-2xl border-l-4 border-yellow-400">
                        <p className="text-[10px] font-black uppercase text-yellow-400 mb-2">Signal Method</p>
                        <p className="text-sm font-bold text-gray-300 italic">Loop-safe SendGrid Protocol</p>
                    </div>
                    <div className="p-6 bg-muted/20 rounded-2xl border-l-4 border-blue-400">
                        <p className="text-[10px] font-black uppercase text-blue-400 mb-2">Operational Note</p>
                        <p className="text-sm font-bold text-gray-300 italic">Signals bypass spam-traps via clean API authentication.</p>
                    </div>
                </div>
            </Card>

            <Card className="p-10 border-yellow-400/20 bg-yellow-400/5 rounded-[3rem] flex flex-col items-center justify-center text-center py-12">
                <MessageSquare className="h-10 w-10 text-yellow-400 mb-6 opacity-40" />
                <h4 className="font-black italic uppercase text-yellow-400 text-lg mb-2">Total Outreach Potential</h4>
                <p className="text-3xl font-black italic tracking-tighter text-white">SYNCING...</p>
                <p className="text-[10px] font-bold text-gray-500 mt-4 uppercase tracking-[0.2em]">Contacting platform database</p>
            </Card>
        </div>
      </div>
    </div>
  )
}

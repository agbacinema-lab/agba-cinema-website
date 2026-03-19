"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ShoppingBag, ArrowRight, BookOpen, CircleDollarSign, BadgeCheck, CheckCircle2, Loader2 } from "lucide-react"
import { academyService, notificationService } from "@/lib/services"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"

export default function StudentShop() {
  const { profile } = useAuth()
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    setLoading(true)
    try {
      const data = await academyService.getAllServices()
      setCourses(data)
    } catch (error) {
      console.error("Error loading marketplace:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnrollment = async (course: any) => {
    if (!profile) return toast.error("Please log in to enroll.")
    
    setProcessingId(course.id)
    try {
      // Clean price string for numeric value (e.g. "#50,000" or "50,000")
      const numericPrice = parseFloat(course.price.replace(/[^0-9.]/g, ''))
      
      if (isNaN(numericPrice) || numericPrice <= 0) {
        throw new Error("Invalid course price detected.")
      }

      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numericPrice,
          email: profile.email,
          service: course.title,
          fullName: profile.name || "Student",
          phone: profile.phone || "",
          userId: profile.uid
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Initialization failed")

      // Send operational notification
      await notificationService.sendNotification({
        recipientId: profile.uid,
        title: "Enrollment Protocol Initialized",
        message: `Secure payment transaction started for ${course.title}.`,
        type: "payment"
      })

      // Redirect to Paystack
      window.location.href = data.authorization_url
    } catch (err: any) {
      toast.error(err.message || "Checkout failed. Try again later.")
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-12 pb-32 max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col gap-2">
         <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="h-4 w-4 text-yellow-500" />
            <span className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.4em]">Academy Offerings</span>
         </div>
         <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none text-foreground">The Curriculum</h2>
         <p className="text-muted-foreground font-medium italic mt-2 text-lg">Official Academy programs as seen on the public portal.</p>
      </div>

      {/* Course List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map(i => <div key={i} className="h-96 bg-gray-50 rounded-[3rem] animate-pulse" />)}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[3rem] border border-gray-100 italic">
           <BookOpen className="h-10 w-10 text-gray-200 mx-auto mb-4" />
           <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No active services found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {courses.map((course, i) => (
            <motion.div
              key={course.id || i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group bg-card p-12 rounded-[3.5rem] border border-muted hover:border-yellow-400 hover:shadow-2xl transition-all duration-500 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="space-y-8 relative z-10">
                <div className="flex justify-between items-start">
                   <div className="bg-black text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl border border-white/5">
                      AGBA ENROLLMENT
                   </div>
                   <div className="p-3 bg-yellow-400/10 rounded-2xl">
                      <BadgeCheck className="h-6 w-6 text-yellow-500" />
                   </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none text-foreground group-hover:text-yellow-400 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-lg text-muted-foreground font-bold italic leading-relaxed line-clamp-3">
                    {course.description}
                  </p>
                </div>

                {/* Features Mirroring Global View */}
                <div className="space-y-4 pt-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">Curriculum Highlights</p>
                  <div className="grid grid-cols-1 gap-3">
                    {(course.features || []).slice(0, 3).map((f: string, j: number) => (
                      <div key={j} className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-yellow-500" />
                        <span className="text-[11px] font-black uppercase tracking-wide text-muted-foreground group-hover:text-foreground transition-colors">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-14 flex items-end justify-between pt-10 border-t border-muted relative z-10 transition-colors">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-1">Standard Tuition</p>
                  <p className="text-3xl font-black text-foreground italic tracking-tighter">
                     {course.price}
                  </p>
                </div>
                <button 
                  disabled={processingId === course.id}
                  onClick={() => handleEnrollment(course)}
                  className="h-20 px-10 bg-foreground text-background rounded-[2rem] font-black text-[11px] uppercase tracking-widest flex items-center gap-3 hover:bg-yellow-400 hover:text-black transition-all shadow-2xl hover:scale-105 active:scale-95 group-hover:-translate-y-2 disabled:opacity-50"
                >
                  {processingId === course.id ? <Loader2 className="h-5 w-5 animate-spin" /> : "Apply for Access"} <ArrowRight className="h-5 w-5" />
                </button>
              </div>

              {/* Aesthetic Background Glow */}
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-yellow-400/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-yellow-400/10 transition-all duration-700" />
            </motion.div>
          ))}
        </div>
      )}

      {/* Footer Info */}
      <div className="p-12 bg-black rounded-[4rem] flex flex-col md:flex-row items-center justify-between gap-8 text-white relative overflow-hidden">
         <div className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 bg-yellow-400 rounded-3xl flex items-center justify-center text-black shadow-2xl transform rotate-12">
               <CircleDollarSign className="h-8 w-8" />
            </div>
            <div>
               <p className="text-xl font-black italic uppercase tracking-tighter">Tuition & Financial Protocol</p>
               <p className="text-[10px] uppercase font-black tracking-widest text-gray-500 mt-1">Installment plans are handled per intake session.</p>
            </div>
         </div>
         <button className="relative z-10 bg-white text-black px-12 h-16 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-yellow-400 transition-all">
            Inquire about Plans
         </button>
         <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/5 blur-[100px] -mr-48 -mt-48" />
      </div>
    </div>
  )
}

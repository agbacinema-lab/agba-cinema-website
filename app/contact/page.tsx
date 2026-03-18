"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Clock, Send, Zap, ShieldCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import emailjs from "@emailjs/browser"
import PageHero from "@/components/common/layout/PageHero"
import { motion } from "framer-motion"

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const form = e.currentTarget

    try {
      await emailjs.sendForm(
        "service_a1sqad8",
        "template_87aom8b",
        form,
        "JH5HK81ALIHAE-ELW"
      )
      toast({
        title: "Transmission Received",
        description: "Our unit will respond within the next 24 operational hours.",
      })
      form.reset()
    } catch (error) {
      console.error("EmailJS Error:", error)
      toast({
        title: "Transmission Failed",
        description: "Please check your network and attempt the protocol again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <PageHero 
        title="OPERATIONAL HUB"
        subtitle="Deployment begins with dialogue. Connect with Nigeria's elite cinematic unit."
        backgroundImage="/creative and legal crises.jpg"
      />

      <section className="py-32 relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gray-50/50 -skew-x-12 translate-x-32 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
            
            {/* Intel Side */}
            <motion.div 
               initial={{ opacity: 0, x: -30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="lg:col-span-5 space-y-12"
            >
              <div className="space-y-6">
                 <h4 className="text-yellow-500 font-black uppercase tracking-[0.5em] text-[10px]">Information Hub</h4>
                 <h2 className="text-5xl md:text-7xl font-black text-black italic uppercase tracking-tighter leading-none">
                    Base of <br /> <span className="text-gray-200">Operations.</span>
                 </h2>
                 <p className="text-xl text-gray-500 font-medium italic leading-relaxed">
                    Our units are strategically deployed across the globe, with our central command based in the heart of Lagos.
                 </p>
              </div>

              <div className="space-y-8">
                {[
                  { icon: Mail, label: "Secure Email", value: "agbacinema@gmail.com" },
                  { icon: Phone, label: "Comm Line", value: "+234 90652360464" },
                  { icon: MapPin, label: "HQ Coordinates", value: "Lagos, Nigeria" },
                  { icon: Clock, label: "Ops Hours", value: "Mon - Fri: 09:00 - 18:00" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-6 group">
                    <div className="w-12 h-12 rounded-2xl bg-black text-yellow-400 flex items-center justify-center group-hover:bg-yellow-400 group-hover:text-black transition-all duration-500 shadow-xl">
                       <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{item.label}</p>
                       <p className="text-xl font-black text-black italic tracking-tight">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-10 bg-black rounded-[2.5rem] border border-white/10 shadow-2xl space-y-4">
                 <div className="flex items-center gap-3 text-yellow-400">
                    <ShieldCheck className="h-6 w-6" />
                    <span className="font-black uppercase tracking-widest text-xs italic">Response Guarantee</span>
                 </div>
                 <p className="text-gray-400 font-medium italic text-sm leading-relaxed">
                    All incoming signals are processed by our senior architects. Expect a definitive response within 24 hours.
                 </p>
              </div>
            </motion.div>

            {/* Protocol Form */}
            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="lg:col-span-7 bg-white rounded-[3rem] border border-gray-100 p-10 md:p-16 shadow-premium hover:border-black transition-all duration-700"
            >
              <div className="mb-12">
                 <h3 className="text-4xl font-black text-black italic uppercase tracking-tighter mb-4">Initiate Protocol</h3>
                 <p className="text-gray-400 font-medium italic uppercase tracking-widest text-[10px]">Fill the brief below to establish contact</p>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Codename / First Name</Label>
                  <Input 
                    id="firstName" 
                    name="firstName" 
                    required 
                    placeholder="ENTER NAME" 
                    className="h-16 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-yellow-400 px-6 font-bold text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Surname</Label>
                  <Input 
                    id="lastName" 
                    name="lastName" 
                    required 
                    placeholder="ENTER SURNAME" 
                    className="h-16 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-yellow-400 px-6 font-bold text-sm"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Secure Channel (Email)</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    required 
                    placeholder="VITAL@EMAIL.COM" 
                    className="h-16 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-yellow-400 px-6 font-bold text-sm"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="subject" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Inquiry Objective</Label>
                  <Input 
                    id="subject" 
                    name="subject" 
                    required 
                    placeholder="E.G. DIRECTORIAL INQUIRY" 
                    className="h-16 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-yellow-400 px-6 font-bold text-sm"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="message" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Project Brief / Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    placeholder="DESCRIBE THE VISION AND MISSION..."
                    rows={6}
                    className="rounded-[2rem] bg-gray-50 border-none focus:ring-2 focus:ring-yellow-400 p-8 font-bold text-sm"
                  />
                </div>

                <div className="md:col-span-2 pt-6">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-20 bg-black text-white hover:bg-yellow-400 hover:text-black font-black uppercase italic tracking-tighter text-xl rounded-3xl transition-all shadow-2xl flex items-center justify-center gap-4 group"
                  >
                    {isSubmitting ? (
                       <div className="w-6 h-6 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Launch Transmission
                        <Send className="h-6 w-6 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Global Mission Bar */}
      <section className="py-24 bg-black overflow-hidden relative">
         <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="flex whitespace-nowrap animate-marquee">
               {[...Array(10)].map((_, i) => (
                 <span key={i} className="text-[8vw] font-black text-white italic uppercase tracking-tighter mx-8">
                    AGBA CINEMA UNITS // GLOBAL DEPLOYMENT // 
                 </span>
               ))}
            </div>
         </div>
      </section>
    </div>
  )
}

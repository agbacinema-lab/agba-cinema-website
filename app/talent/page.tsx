"use client"

import { useState, useEffect } from "react"
import { studentService } from "@/lib/services"
import { StudentProfile } from "@/lib/types"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { BadgeCheck, ExternalLink, Search, Youtube, Globe, Palette, Lock, Zap, ArrowRight, Star } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import PaymentForm from "@/components/services/PaymentForm"
import PageHero from "@/components/common/layout/PageHero"

export default function TalentBoard() {
  const { profile, isSuperAdmin, isAdmin } = useAuth()
  const [talent, setTalent] = useState<StudentProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'premium'>('all')

  // Check if current user has access to full profiles
  const hasAccess = isSuperAdmin || isAdmin || (profile?.role === 'tutor') || (profile?.hasPaidAccess)

  useEffect(() => {
    studentService.getAllTalent(filter === 'premium').then(data => {
      setTalent(data)
      setLoading(false)
    })
  }, [filter])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <PageHero 
        title="THE ROSTER"
        subtitle="Nigeria's most elite creative force. Vetted storytellers, editors, and visionaries ready for deployment."
        backgroundImage="/creative and legal crises.jpg"
      />

      {/* Control Bar */}
      <section className="py-20 relative border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-12">
            
            <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
              <button 
                onClick={() => setFilter('all')}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-black text-white shadow-xl' : 'text-gray-400 hover:text-black'}`}
              >
                Open Roster
              </button>
              <button 
                onClick={() => setFilter('premium')}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${filter === 'premium' ? 'bg-yellow-400 text-black shadow-xl shadow-yellow-400/20' : 'text-gray-400 hover:text-black'}`}
              >
                <Star className="h-3.5 w-3.5 fill-current" />
                Elite Selection
              </button>
            </div>

            <div className="relative w-full md:w-[400px] group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 h-4 w-4 group-focus-within:text-yellow-500 transition-colors" />
              <input 
                type="text" 
                placeholder="SCOUT BY SKILL (E.G. AFTER EFFECTS)"
                className="w-full bg-transparent border-none focus:ring-0 pl-16 pr-6 h-16 text-[10px] font-black uppercase tracking-[0.2em] placeholder:text-gray-200"
              />
              <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-gray-100 group-focus-within:bg-yellow-400 transition-all origin-left" />
            </div>
        </div>
      </section>

      {/* Talent Grid */}
      <section className="py-32 max-w-7xl mx-auto px-4">
        {loading ? (
          <div className="flex justify-center py-40">
            <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
          >
            <AnimatePresence mode="popLayout">
              {talent.map((student, idx) => (
                <motion.div
                  key={student.studentId}
                  className="group relative bg-white rounded-[2.5rem] overflow-hidden border border-gray-50 hover:border-black transition-all duration-500 hover:shadow-premium p-10 flex flex-col h-full"
                >
                  <div className="flex justify-between items-start mb-10">
                    <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-3xl group-hover:bg-yellow-400 group-hover:rotate-[360deg] transition-all duration-1000">
                      🎬
                    </div>
                    {student.programType === 'mentorship' && (
                      <div className="bg-black text-yellow-400 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2 border border-white/10 animate-pulse">
                        <Zap className="h-3.5 w-3.5 fill-yellow-400" />
                        ELITE
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-4">
                    <h3 className="text-3xl font-black text-black italic uppercase tracking-tighter group-hover:text-yellow-600 transition-colors">
                      {hasAccess ? student.fullName : `SC_AGENT_${student.studentId.slice(-4)}`}
                    </h3>
                    
                    <p className="text-gray-400 font-medium leading-relaxed italic line-clamp-2">
                       {hasAccess ? `"${student.bio || 'Exploring the boundaries of cinematic storytelling.'}"` : 'Premium talent profile awaiting brand unlock.'}
                    </p>

                    {/* Skills Roster */}
                    <div className="flex flex-wrap gap-2 pt-4">
                      {student.skills.slice(0, 3).map(skill => (
                        <span key={skill} className="bg-gray-50 text-gray-500 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-gray-100 group-hover:border-black/10 transition-colors">
                          {skill}
                        </span>
                      ))}
                      {student.skills.length > 3 && (
                        <span className="text-gray-300 text-[9px] font-black pt-2">+{student.skills.length - 3}</span>
                      )}
                    </div>
                  </div>

                  {/* Operational Controls */}
                  <div className="mt-12 pt-8 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex gap-4">
                      {hasAccess ? (
                        <>
                          <Youtube className="h-4 w-4 text-gray-300 hover:text-red-600 cursor-pointer transition-colors" />
                          <Palette className="h-4 w-4 text-gray-300 hover:text-blue-600 cursor-pointer transition-colors" />
                          <Globe className="h-4 w-4 text-gray-300 hover:text-black cursor-pointer transition-colors" />
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-300">
                           <Lock className="h-3.5 w-3.5" />
                           Classified
                        </div>
                      )}
                    </div>

                    <div className="h-px flex-1 bg-gray-50 mx-4" />

                    {hasAccess ? (
                      <button className="text-[10px] font-black uppercase tracking-tighter text-black hover:text-yellow-600 flex items-center gap-2">
                        Draft <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </div>

                  {!hasAccess && (
                    <div className="mt-8">
                       <PaymentForm service="Talent Board Access" amount={50000} category="service" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* Global Scouting Note */}
      <section className="py-40 bg-black text-white">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-12">
             <div className="space-y-4">
               <h4 className="text-yellow-400 font-black uppercase tracking-[0.6em] text-xs">Industry Deployment</h4>
               <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">
                 Looking for <br /> Perfection?
               </h2>
               <p className="text-xl text-gray-500 font-medium italic max-w-2xl mx-auto">
                 We've trained them. We've vetted them. Now, we're ready to deploy them to your vision.
               </p>
             </div>
             <button className="h-20 px-16 bg-yellow-400 text-black font-black uppercase italic tracking-tighter text-xl rounded-[2rem] hover:scale-105 transition-all shadow-premium">
               Request Custom Roster
             </button>
          </div>
      </section>
    </div>
  )
}

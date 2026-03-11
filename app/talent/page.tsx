"use client"

import { useState, useEffect } from "react"
import { studentService } from "@/lib/services"
import { StudentProfile } from "@/lib/types"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BadgeCheck, ExternalLink, Filter, Search, Youtube, Globe, Palette, Lock } from "lucide-react"
import { motion } from "framer-motion"
import PaymentForm from "@/components/services/PaymentForm"
import Image from "next/image"

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

  return (
    <div className="min-h-screen bg-[#FDFCF6]">
      {/* Hero Header */}
      <section className="relative pt-32 pb-20 bg-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(250,204,21,0.1),transparent)]" />
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black mb-6"
          >
            Hire Our <span className="text-yellow-400">Top Talent</span>
          </motion.h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium">
            Connect with the next generation of content creators, video editors, and motion designers from Nigeria's #1 academy.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
            <button 
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'all' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900'}`}
            >
              All Talent
            </button>
            <button 
              onClick={() => setFilter('premium')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${filter === 'premium' ? 'bg-yellow-400 text-black' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <BadgeCheck className="h-4 w-4" />
              Premium Only
            </button>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input 
              type="text" 
              placeholder="Search by skill (e.g. After Effects)"
              className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Talent Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {talent.map((student, idx) => (
              <motion.div
                key={student.studentId}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="group border-none shadow-premium bg-white hover:shadow-2xl transition-all duration-500 rounded-[2rem] overflow-hidden">
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-yellow-400 transition-colors duration-500">
                        🎬
                      </div>
                      {student.programType === 'mentorship' && (
                        <span className="bg-black text-[#FFD700] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center gap-2 border border-yellow-400/30">
                          <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                          Premium Talent
                        </span>
                      )}
                    </div>

                    <h3 className="text-2xl font-black text-gray-900 mb-2">
                      {hasAccess ? student.fullName : `Creative Talent #${student.studentId.slice(-4)}`}
                    </h3>
                    <p className="text-gray-500 text-sm mb-6 line-clamp-2 italic">
                      {hasAccess ? `"${student.bio || 'Exploring the boundaries of cinematic storytelling.'}"` : 'Premium talent profile ready for brand collaboration.'}
                    </p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mb-8">
                      {student.skills.slice(0, 3).map(skill => (
                        <span key={skill} className="bg-gray-50 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold border border-gray-100">
                          {skill}
                        </span>
                      ))}
                      {student.skills.length > 3 && (
                        <span className="text-gray-400 text-xs font-bold pt-1">+{student.skills.length - 3}</span>
                      )}
                    </div>

                    {/* Links */}
                    <div className="flex gap-4 mb-8">
                      {hasAccess ? (
                        <>
                          {student.portfolioLinks?.youtube && (
                            <a href={student.portfolioLinks.youtube} target="_blank" className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                              <Youtube className="h-5 w-5" />
                            </a>
                          )}
                          {student.portfolioLinks?.behance && (
                            <a href={student.portfolioLinks.behance} target="_blank" className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                              <Palette className="h-5 w-5" />
                            </a>
                          )}
                          {student.portfolioLinks?.website && (
                            <a href={student.portfolioLinks.website} target="_blank" className="p-3 bg-gray-50 text-gray-900 rounded-xl hover:bg-gray-900 hover:text-white transition-all">
                              <Globe className="h-5 w-5" />
                            </a>
                          )}
                        </>
                      ) : (
                        <div className="w-full flex items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-400 font-bold text-xs gap-2">
                          <Lock className="h-4 w-4" /> Portfolios hidden until unlock
                        </div>
                      )}
                    </div>

                    {hasAccess ? (
                      <Button className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black py-6 rounded-2xl shadow-lg shadow-yellow-400/20 group-hover:scale-[1.02] transition-all">
                        Request Internship →
                      </Button>
                    ) : (
                      <PaymentForm service="Talent Board Access" amount={50000} category="service" />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

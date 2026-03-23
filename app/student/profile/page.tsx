"use client"

import { useAuth } from "@/context/AuthContext"
import { Shield, Mail, Smartphone, User, Settings, GraduationCap } from "lucide-react"
import Link from "next/link"

export default function StudentProfile() {
  const { profile } = useAuth()
  
  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-yellow-400" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pt-6 pb-24 space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 p-6 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-black shadow-md shadow-yellow-400/20 shrink-0 font-black text-2xl uppercase">
            {profile.name ? profile.name[0] : <User className="h-8 w-8" />}
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-gray-900 dark:text-white leading-none">
              {profile.name || "Student"}
            </h1>
            <p className="text-sm text-gray-400 font-medium mt-1">My Profile</p>
          </div>
        </div>
        <Link href="/student/settings" className="h-10 px-5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold text-sm flex items-center gap-2 transition-all">
          <Settings className="h-4 w-4" /> Edit Profile
        </Link>
      </div>

      {/* ── Account Details ── */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-3xl p-6 space-y-5">
        <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Account Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email */}
          <div className="bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-indigo-500 mb-2">
              <Mail className="h-4 w-4" />
              <p className="text-xs font-bold uppercase tracking-widest">Email Address</p>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{profile.email}</p>
          </div>

          {/* Phone */}
          <div className="bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-indigo-500 mb-2">
              <Smartphone className="h-4 w-4" />
              <p className="text-xs font-bold uppercase tracking-widest">Phone Number</p>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{profile.phone || "Not provided"}</p>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 p-5 rounded-2xl mt-4">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Bio</p>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl">
            {profile.bio || "You haven't added a bio yet. Go to Settings to add one."}
          </p>
        </div>
      </div>

      {/* ── Academy Status ── */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-3xl p-6 space-y-4">
        <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Academy Status</h2>

        {/* Role */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Account Role</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{profile.role?.replace(/_/g, " ") || "Student"}</p>
            </div>
          </div>
          <span className="text-[10px] bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 px-2 py-1 rounded-full font-bold uppercase tracking-widest">
            {(profile as any).status === 'internship_ready' ? 'Elite Ready' : (profile as any).status || 'Active'}
          </span>
        </div>

        {/* Enrollments */}
        {(profile.enrolledSpecializations?.length || profile.specialization) && (
          <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700">
            <div className="flex items-center gap-3 mb-3">
              <GraduationCap className="h-5 w-5 text-indigo-500" />
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Enrolled Courses</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.enrolledSpecializations?.length 
                ? profile.enrolledSpecializations.map((spec) => (
                    <span key={spec.id} className="bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-400/20 text-xs font-bold px-3 py-1.5 rounded-xl">
                      {spec.title || spec.value}
                    </span>
                  ))
                : <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-400/20 text-xs font-bold px-3 py-1.5 rounded-xl capitalize">
                    {String(profile.specialization).replace(/-/g, " ")}
                  </span>
              }
            </div>
          </div>
        )}

        {/* Tutor */}
        {profile.tutorName && (
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Assigned Tutor</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{profile.tutorName}</p>
              </div>
            </div>
          </div>
        )}

        {/* Disciplinary Record */}
        {((profile as any).strikes || 0) > 0 && (
          <div className="p-4 bg-red-50 dark:bg-red-500/5 rounded-2xl border border-red-100 dark:border-red-500/20">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-5 w-5 text-red-500" />
              <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Disciplinary Record (Queries)</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xl font-black text-red-600 dark:text-red-400">{(profile as any).strikes}/3 STRIKES</p>
              <div className="text-[9px] font-black uppercase tracking-widest text-red-600/50 italic py-1 px-3 bg-red-100 dark:bg-red-500/20 rounded-lg">
                Critical Threshold: 3
              </div>
            </div>
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-2">Warning: Accumulating 3 queries within a 90-day cycle results in automatic mission deactivation.</p>
          </div>
        )}

        {/* Mission Logistics */}
        <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700">
          <div className="flex items-center gap-3 mb-3">
            <Smartphone className="h-5 w-5 text-green-500" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Mission Logistics</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{profile.address || "No address protocol established"}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{profile.city || "City Location"}, {profile.state || "Territory"}</p>
          </div>
        </div>
      </div>

    </div>
  )
}

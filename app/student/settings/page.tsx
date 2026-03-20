"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "next-themes"
import { AnimatePresence, motion } from "framer-motion"
import { Save, Sun, Moon, CheckCircle, AlertCircle, User, Phone, FileText, Mail } from "lucide-react"
import { studentService as sService } from "@/lib/services"

export default function StudentSettings() {
  const { profile } = useAuth()
  const { theme, setTheme } = useTheme()

  const [formData, setFormData] = useState({ 
    name: "", 
    phone: "", 
    bio: "",
    address: "",
    city: "",
    state: "Lagos",
    country: "Nigeria"
  })
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const nigerianStates = [
    "Lagos", "Abuja", "Port Harcourt", "Rivers", "Enugu", "Anambra", "Delta", "Kano", 
    "Kaduna", "Oyo", "Ogun", "Edo", "Abia", "Adamawa", "Akwa Ibom", "Bauchi", 
    "Bayelsa", "Benue", "Borno", "Cross River", "Ebonyi", "Ekiti", "Gombe", "Imo", 
    "Jigawa", "Katsina", "Kebbi", "Kogi", "Kwara", "Nasarawa", "Niger", "Ondo", 
    "Osun", "Plateau", "Sokoto", "Taraba", "Yobe", "Zamfara"
  ]

  useEffect(() => {
    if (profile && !formData.name) {
      setFormData({
        name:  profile.name  || "",
        phone: profile.phone || "",
        bio:   profile.bio   || "",
        address: profile.address || "",
        city:    profile.city    || "",
        state:   profile.state   || "Lagos",
        country: profile.country || "Nigeria"
      })
    }
  }, [profile])

  if (!profile) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-yellow-400" />
    </div>
  )

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile?.uid) return
    setSaving(true)
    setError(null)
    try {
      await sService.updateFullProfile(profile.uid, formData)
      setSaved(true)
      setTimeout(() => setSaved(false), 4000)
    } catch {
      setError("Failed to save. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 pt-6 pb-24 space-y-6">

      {/* ── Alerts ── */}
      <AnimatePresence>
        {saved && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl text-sm font-medium"
          >
            <CheckCircle className="h-4 w-4 shrink-0" /> Profile saved successfully.
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm font-medium"
          >
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Appearance ── */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Appearance</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">Theme</p>
            <p className="text-xs text-gray-400 mt-0.5">Choose how the portal looks for you</p>
          </div>
          <div className="flex items-center bg-gray-100 dark:bg-zinc-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => setTheme("light")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                theme === "light"
                  ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              <Sun className="h-4 w-4" /> Light
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                theme === "dark"
                  ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              <Moon className="h-4 w-4" /> Dark
            </button>
          </div>
        </div>
      </div>

      {/* ── Edit Profile ── */}
      <form onSubmit={handleSave} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl p-5 space-y-5">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Profile</p>

        {/* Email – read only */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
            <Mail className="h-3.5 w-3.5" /> Email
          </label>
          <div className="flex items-center bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 px-4 py-2.5 rounded-xl text-sm text-gray-400 dark:text-gray-500">
            {profile.email}
            <span className="ml-auto text-[10px] bg-gray-200 dark:bg-zinc-700 text-gray-400 px-2 py-0.5 rounded-full font-semibold">Can't change</span>
          </div>
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
            <User className="h-3.5 w-3.5" /> Full Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Your name"
            className="w-full bg-gray-50 dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 focus:border-yellow-400 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-900 dark:text-white outline-none transition-all"
          />
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
            <Phone className="h-3.5 w-3.5" /> Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+234 000 000 0000"
            className="w-full bg-gray-50 dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 focus:border-yellow-400 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-900 dark:text-white outline-none transition-all"
          />
        </div>

        {/* Mission Logistics */}
        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
          <p className="text-[10px] font-black uppercase tracking-widest text-yellow-500">Mission Logistics (Address)</p>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500">Street Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 AGBA Avenue"
              className="w-full bg-gray-50 dark:bg-zinc-800 border-2 border-gray-100 dark:border-zinc-700 px-4 py-2.5 rounded-xl text-sm font-medium"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Lagos"
                className="w-full bg-gray-50 dark:bg-zinc-800 border-2 border-gray-100 dark:border-zinc-700 px-4 py-2.5 rounded-xl text-sm font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500">State Territory</label>
              <select 
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full bg-gray-50 dark:bg-zinc-800 border-2 border-gray-100 dark:border-zinc-700 px-4 py-2.5 rounded-xl text-sm font-medium outline-none focus:border-yellow-400"
              >
                {nigerianStates.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
            <FileText className="h-3.5 w-3.5" /> Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={4}
            placeholder="Write a short bio about yourself..."
            className="w-full bg-gray-50 dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 focus:border-yellow-400 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-900 dark:text-white outline-none transition-all resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full h-11 bg-yellow-400 hover:bg-yellow-500 text-black rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 shadow-md shadow-yellow-400/20"
        >
          {saving
            ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>

      {/* ── Account info (read-only, DB-driven) ── */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl p-5 space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Account</p>

        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Role</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{profile.role?.replace(/_/g, " ") || "Student"}</span>
        </div>

        {/* Courses – only if enrolled */}
        {(profile.enrolledSpecializations?.length || profile.specialization) && (
          <div className="flex items-start justify-between py-2 border-t border-gray-100 dark:border-zinc-800">
            <span className="text-sm text-gray-500 dark:text-gray-400">My Courses</span>
            <div className="flex flex-wrap gap-1.5 max-w-[60%] justify-end">
              {profile.enrolledSpecializations?.length
                ? profile.enrolledSpecializations.map(s => (
                    <span key={s.id} className="text-[11px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">
                      {s.title || s.value}
                    </span>
                  ))
                : <span className="text-[11px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold capitalize">
                    {String(profile.specialization).replace(/-/g, " ")}
                  </span>
              }
            </div>
          </div>
        )}

        {/* Tutor – only if assigned */}
        {profile.tutorName && (
          <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-zinc-800">
            <span className="text-sm text-gray-500 dark:text-gray-400">Tutor</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{profile.tutorName}</span>
          </div>
        )}

        <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-zinc-800">
          <span className="text-sm text-gray-500 dark:text-gray-400">Last updated</span>
          <span className="text-sm text-gray-400">
            {profile.updatedAt
              ? new Date(profile.updatedAt.seconds * 1000).toLocaleDateString()
              : "Never"}
          </span>
        </div>
      </div>

    </div>
  )
}

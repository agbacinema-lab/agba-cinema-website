"use client"

import { useAuth } from "@/context/AuthContext"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  User, 
  ShoppingBag, 
  LogOut, 
  Menu, 
  X, 
  Bell,
  Star
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { authService } from "@/lib/auth-service"

const SIDEBAR_ITEMS = [
  { id: "dashboard",   label: "Dashboard",   icon: LayoutDashboard, href: "/student/dashboard" },
  { id: "lms",         label: "Academy LMS", icon: BookOpen,        href: "/student/learning" },
  { id: "assignments", label: "Assignments", icon: FileText,        href: "/student/assignments" },
  { id: "portfolio",   label: "My Portfolio",icon: Star,            href: "/student/portfolio" },
  { id: "shop",        label: "Marketplace", icon: ShoppingBag,     href: "/student/shop" },
  { id: "profile",     label: "Student ID",  icon: User,            href: "/student/profile" },
]

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, isStudent, isAdmin, isSuperAdmin } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Protect the route - Allow students and admins (for testing)
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    } else if (!loading && user && !profile) {
      // Profile not loaded yet
    } else if (!loading && profile && !(profile.role === 'student' || profile.role === 'admin' || profile.role === 'super_admin')) {
      router.push("/")
    }
  }, [user, profile, loading, router])

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400 mx-auto mb-4" />
          <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-xs">Accessing Portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex text-black">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-black text-white p-6 flex flex-col shadow-2xl"
          >
            {/* Logo */}
            <div className="mb-12 px-2">
              <h1 className="text-2xl font-black italic tracking-tighter">
                ÀGBÀ <span className="text-yellow-400 not-italic">STUDENT</span>
              </h1>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-1">Academy Portal</p>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-2">
              {SIDEBAR_ITEMS.map((item) => {
                const isActive = pathname === item.href
                return (
                  <button
                    key={item.id}
                    onClick={() => router.push(item.href)}
                    className={`w-full flex items-center gap-4 px-4 h-14 rounded-2xl transition-all duration-300 group ${
                      isActive 
                        ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/20" 
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${isActive ? "text-black" : "group-hover:scale-110 transition-transform"}`} />
                    <span className="font-black text-sm uppercase tracking-wider">{item.label}</span>
                  </button>
                )
              })}
            </nav>

            {/* Bottom Section */}
            <div className="pt-6 border-t border-white/10">
              <div className="bg-white/5 rounded-[2rem] p-4 mb-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-black font-black text-xs">
                  {profile.name?.[0] || 'S'}
                </div>
                <div className="overflow-hidden">
                  <p className="font-black text-sm truncate">{profile.name}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest truncate">{profile.uid.slice(-6)}</p>
                </div>
              </div>

              <button
                onClick={() => authService.logout()}
                className="w-full flex items-center gap-4 px-4 h-14 rounded-2xl text-red-400 hover:bg-red-400/10 transition-all font-black text-sm uppercase tracking-wider"
              >
                <LogOut className="h-5 w-5" />
                <span>Log Out</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-500 ${isSidebarOpen ? "pl-72" : "pl-0"}`}>
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <h2 className="font-black text-xl italic uppercase tracking-tight">
              {SIDEBAR_ITEMS.find(i => i.href === pathname)?.label || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-6">
             {/* Notification */}
             <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full border-2 border-white" />
            </button>

            <div className="h-10 w-px bg-gray-100" />

            <div className="text-right hidden md:block">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">Status</p>
              <p className="text-sm font-black text-green-600 uppercase">Active Student</p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

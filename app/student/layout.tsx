"use client"

import { useAuth } from "@/context/AuthContext"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  User, 
  ShoppingBag, 
  LogOut, 
  Star,
  Bell
} from "lucide-react"
import { authService } from "@/lib/auth-service"
import PushPrompt from "@/components/common/PushPrompt"
import { UserDropdown } from "@/components/common/UserDropdown"
import NotificationBell from "@/components/common/NotificationBell"

const NAV_ITEMS = [
  { id: "dashboard",   label: "Home",       icon: LayoutDashboard, href: "/student/dashboard" },
  { id: "lms",         label: "Academy",    icon: BookOpen,        href: "/student/learning" },
  { id: "assignments", label: "Tasks",      icon: FileText,        href: "/student/assignments" },
  { id: "portfolio",   label: "Portfolio",  icon: Star,            href: "/student/portfolio" },
  { id: "shop",        label: "Shop",       icon: ShoppingBag,     href: "/student/shop" },
]

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, isStudent, isAdmin, isSuperAdmin } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    } else if (!loading && profile) {
      if (['super_admin', 'director', 'hod', 'admin', 'tutor', 'staff'].includes(profile.role)) {
        router.push("/admin")
      } else if (profile.role === 'brand') {
        router.push("/brand/dashboard")
      } else if (profile.role !== 'student') {
        router.push("/")
      }
    }
  }, [user, profile, loading, router])

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400 mx-auto mb-4" />
          <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-xs">Accessing Portal...</p>
        </div>
      </div>
    )
  }

  const currentPage = NAV_ITEMS.find(i => i.href === pathname)?.label || "Dashboard"

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* ── TOP HEADER (always visible) ── */}
      <header className="fixed top-0 inset-x-0 z-50 h-16 bg-black text-white flex items-center justify-between px-4 md:px-6 shadow-2xl">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div>
            <h1 className="text-base font-black italic tracking-tighter leading-none">
              ÀGBÀ <span className="text-yellow-400 not-italic">STUDENT</span>
            </h1>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Academy Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Page label – desktop only */}
          <span className="hidden md:block text-[10px] font-black uppercase tracking-widest text-gray-400 mr-2">{currentPage}</span>

          <NotificationBell />
          <UserDropdown onSettingsClick={() => router.push('/student/profile')} />
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="flex pt-16">
        {/* ── DESKTOP SIDEBAR ── */}
        <aside className="hidden md:flex flex-col w-64 fixed top-16 bottom-0 left-0 bg-black text-white p-5 border-r border-white/5 overflow-y-auto">
          {/* Nav links */}
          <nav className="flex-1 space-y-1.5 mt-8">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href
              return (
                <button
                  key={item.id}
                  onClick={() => router.push(item.href)}
                  className={`w-full flex items-center gap-3 px-4 h-12 rounded-2xl transition-all duration-200 group ${
                    isActive
                      ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/20"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="font-black text-xs uppercase tracking-wider">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 md:ml-64 min-h-[calc(100vh-4rem)] w-full max-w-full overflow-x-hidden">

          <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8 w-full">
            {children}
          </div>
        </main>
      </div>

      {/* ── MOBILE BOTTOM TAB BAR ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-black border-t border-white/10 flex items-stretch">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-colors ${
                isActive ? "text-yellow-400" : "text-gray-500"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : ""}`} />
              <span className={`text-[9px] font-black uppercase tracking-wider ${isActive ? "text-yellow-400" : "text-gray-600"}`}>
                {item.label}
              </span>
              {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400" />}
            </button>
          )
        })}
      </nav>

      <PushPrompt />
    </div>
  )
}

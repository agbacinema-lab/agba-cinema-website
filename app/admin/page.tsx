"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { authService } from "@/lib/auth-service"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import UserManagement from "@/components/admin/UserManagement"
import NotificationBar from "@/components/admin/NotificationBar"
import StudentReadiness from "@/components/admin/StudentReadiness"
import AssignmentManagementPanel from "@/components/admin/AssignmentManagementPanel"
import BlogManager from "@/components/admin/BlogManager"
import CurriculumAdminPanel from "@/components/admin/CurriculumAdminPanel"
import ContentHub from "@/components/admin/ContentHub"
import EventManager from "@/components/admin/EventManager"
import AcademyManager from "@/components/admin/AcademyManager"
import BrandManagementPanel from "@/components/admin/BrandManagementPanel"
import AnnouncementManager from "@/components/admin/AnnouncementManager"
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard"
import AdminProfile from "@/components/admin/AdminProfile"
import AdminSettings from "@/components/admin/AdminSettings"
import { LogOut, LayoutDashboard, Users, Briefcase, Star, Settings, GraduationCap, BookOpen, FileText, BookMarked, MonitorPlay, Calendar, Image as ImageIcon, Layers, Bell, BarChart3, UserCircle, Shield } from "lucide-react"
import { motion } from "framer-motion"

export default function AdminDashboardPage() {
  const { user, profile, loading, isAdmin, isSuperAdmin, isStudent, isBrand } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (!loading && profile) {
      if (profile.role === 'student') {
        window.location.href = '/student/dashboard'
      } else if (profile.role === 'brand') {
        window.location.href = '/brand/dashboard'
      }
    }
  }, [loading, profile])

  const isStaff = ['super_admin', 'director', 'hod', 'admin', 'tutor', 'staff'].includes(profile?.role || '');

  const hasAccess = (tab: string) => {
    if (tab === 'overview' || tab === 'settings' || tab === 'profile' || tab === 'lms' || tab === 'portfolio' || tab === 'requests') return true;
    if (['super_admin', 'director'].includes(profile?.role || '')) return true;
    
    const permissions: Record<string, string[]> = {
      hod: ['readiness', 'courses', 'content', 'assignments'],
      tutor: ['content', 'assignments'],
      staff: ['readiness', 'content'],
      admin: ['readiness', 'content', 'assignments']
    };

    return permissions[profile?.role || '']?.includes(tab) || false;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400" />
      </div>
    )
  }

  if (!user || !profile) {
    if (!loading) {
      if (!user) {
        window.location.href = "/login"
      } else if (!profile) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="text-center">
              <h2 className="text-2xl font-black mb-4">Account profile not found.</h2>
              <p className="text-gray-500 mb-8">Please log out and try registering again.</p>
              <Button onClick={() => authService.logout()} className="bg-black text-white px-8 h-14 rounded-2xl font-bold">Log Out</Button>
            </div>
          </div>
        )
      }
    }
    return null
  }

  // Build a flat list of visible tabs for mobile bar
  const mobileTabs = [
    { id: 'overview', label: 'Home', icon: LayoutDashboard },
    ...(isStaff ? [
      { id: 'users', label: 'Users', icon: Users },
      { id: 'readiness', label: 'Ready', icon: GraduationCap },
      { id: 'assignments', label: 'Tasks', icon: BookOpen },
    ] : []),
    { id: 'analytics', label: 'Stats', icon: BarChart3 },
    { id: 'broadcasts', label: 'Alerts', icon: Bell },
    { id: 'brands', label: 'Brands', icon: Briefcase },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-[#FDFCF6] text-black">
      {isSuperAdmin && <NotificationBar />}

      {/* ── TOP HEADER ── */}
      <header className="fixed top-0 inset-x-0 z-50 h-16 bg-black text-white flex items-center justify-between px-4 md:px-6 shadow-2xl">
        <div>
          <p className="text-[9px] text-yellow-400 font-black uppercase tracking-[0.3em]">Admin Portal</p>
          <h1 className="text-base font-black italic tracking-tighter leading-none capitalize">
            {profile?.role?.replace('_', ' ')}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{profile?.name}</p>
            <p className="text-[9px] text-gray-600">{profile?.email}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center text-black font-black text-sm">
            {profile?.name[0]}
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* ── DESKTOP SIDEBAR ── */}
        <aside className="hidden md:flex flex-col w-72 fixed top-16 bottom-0 left-0 bg-black text-white p-5 border-r border-white/5 overflow-y-auto">
          <nav className="flex-1 space-y-1.5 mt-4">
            <NavItem active={activeTab === 'overview'} disabled={!hasAccess('overview')} icon={<LayoutDashboard className="h-4 w-4" />} label="Overview" onClick={() => setActiveTab('overview')} />
            {isStaff && (
              <>
                <NavItem active={activeTab === 'users'} disabled={!hasAccess('users')} icon={<Users className="h-4 w-4" />} label="User Management" onClick={() => setActiveTab('users')} />
                <NavItem active={activeTab === 'readiness'} disabled={!hasAccess('readiness')} icon={<GraduationCap className="h-4 w-4" />} label="Internship Ready" onClick={() => setActiveTab('readiness')} />
                <NavItem active={activeTab === 'courses'} disabled={!hasAccess('courses')} icon={<BookMarked className="h-4 w-4" />} label="Course Builder" onClick={() => setActiveTab('courses')} />
                <NavItem active={activeTab === 'content'} disabled={!hasAccess('content')} icon={<Layers className="h-4 w-4" />} label="Content Hub" onClick={() => setActiveTab('content')} />
                <NavItem active={activeTab === 'assignments'} disabled={!hasAccess('assignments')} icon={<BookOpen className="h-4 w-4" />} label="Manage Assignments" onClick={() => setActiveTab('assignments')} />
                <NavItem active={activeTab === 'profile'} icon={<UserCircle className="h-4 w-4" />} label="Personnel Identity" onClick={() => setActiveTab('profile')} />
              </>
            )}
            <NavItem active={activeTab === 'analytics'} icon={<BarChart3 className="h-4 w-4" />} label="Intelligence Hub" onClick={() => setActiveTab('analytics')} />
            <NavItem active={activeTab === 'broadcasts'} icon={<Bell className="h-4 w-4" />} label="Home Broadcasts" onClick={() => setActiveTab('broadcasts')} />
            <NavItem active={activeTab === 'brands'} disabled={!hasAccess('manageBrands')} icon={<Briefcase className="h-4 w-4" />} label="Brands & Partners" onClick={() => setActiveTab('brands')} />
            {isBrand && <NavItem active={activeTab === 'requests'} icon={<Briefcase className="h-4 w-4" />} label="Talent Requests" onClick={() => setActiveTab('requests')} />}
            <NavItem active={activeTab === 'settings'} disabled={!hasAccess('settings')} icon={<Settings className="h-4 w-4" />} label="Settings" onClick={() => setActiveTab('settings')} />
          </nav>
          <Button variant="ghost" onClick={() => authService.logout()} className="mt-6 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl justify-start p-4 h-auto font-bold border-t border-white/10 pt-4">
            <LogOut className="h-4 w-4 mr-3" /> Log Out
          </Button>
        </aside>

        {/* Main content area */}
        <main className="flex-1 md:ml-72 min-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Mobile page title */}
          <div className="md:hidden bg-white border-b border-gray-100 px-4 py-3 sticky top-16 z-40">
            <h2 className="font-black text-sm uppercase tracking-widest text-gray-800">
              {mobileTabs.find(t => t.id === activeTab)?.label || 'Overview'}
            </h2>
          </div>

          <div className="p-4 md:p-12 pb-24 md:pb-12 max-w-6xl">
            <div className="hidden md:block mb-10">
              <h2 className="text-4xl font-black text-gray-900 mb-2 capitalize">Welcome, {profile?.name.split(' ')[0]}</h2>
              <p className="text-gray-500 font-medium">Here's what's happening in the ÀGBÀ ecosystem.</p>
            </div>

            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard label="Total Projects" value="12" subtext="+2 this month" color="bg-blue-50 text-blue-600" />
                <StatCard label="Live Profile" value="Public" subtext="Viewable by brands" color="bg-green-50 text-green-600" />
                <StatCard label="Feedback" value="4.8/5" subtext="From 3 tutors" color="bg-yellow-50 text-yellow-600" />
              </motion.div>
            )}

            {activeTab === 'users' && isStaff && hasAccess('users') && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <UserManagement />
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <AnalyticsDashboard />
              </motion.div>
            )}

            {activeTab === 'broadcasts' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <AnnouncementManager />
              </motion.div>
            )}

            {activeTab === 'brands' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <BrandManagementPanel />
              </motion.div>
            )}

            {activeTab === 'readiness' && isStaff && hasAccess('readiness') && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <StudentReadiness />
              </motion.div>
            )}

            {activeTab === 'courses' && isStaff && hasAccess('courses') && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <CurriculumAdminPanel />
              </motion.div>
            )}

            {activeTab === 'content' && isStaff && hasAccess('content') && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <ContentHub />
              </motion.div>
            )}

            {activeTab === 'assignments' && isStaff && hasAccess('assignments') && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <AssignmentManagementPanel />
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <AdminProfile />
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <AdminSettings />
              </motion.div>
            )}
          </div>

        </main>
      </div>


      {/* ── MOBILE BOTTOM TAB BAR ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-black border-t border-white/10 flex items-stretch overflow-x-auto">
        {mobileTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[56px] flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors ${isActive ? 'text-yellow-400' : 'text-gray-500'}`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-[8px] font-black uppercase tracking-wider whitespace-nowrap ${isActive ? 'text-yellow-400' : 'text-gray-600'}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
        <button
          onClick={() => authService.logout()}
          className="flex-1 min-w-[56px] flex flex-col items-center justify-center gap-0.5 py-2.5 text-red-500"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-[8px] font-black uppercase tracking-wider">Exit</span>
        </button>
      </nav>
    </div>
  )
}

function NavItem({ active, icon, label, onClick, disabled }: any) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all font-bold ${
        disabled 
          ? 'opacity-40 cursor-not-allowed text-gray-400' 
          : active 
            ? 'bg-yellow-400 text-black' 
            : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function StatCard({ label, value, subtext, color }: any) {
  return (
    <Card className="border-none shadow-xl bg-white p-8 rounded-[2rem] hover:scale-[1.02] transition-transform">
      <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center font-bold ${color}`}>
        {value[0]}
      </div>
      <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-3xl font-black text-gray-900 mb-2">{value}</h3>
      <p className="text-xs text-gray-500 font-medium">{subtext}</p>
    </Card>
  )
}

function PortfolioInput({ label, placeholder }: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black uppercase tracking-widest text-gray-400">{label}</label>
      <input
        className="w-full h-14 px-6 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-all"
        placeholder={placeholder}
      />
    </div>
  )
}

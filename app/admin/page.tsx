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
import { LogOut, LayoutDashboard, Users, Briefcase, Star, Settings, GraduationCap, BookOpen, FileText, BookMarked, MonitorPlay, Calendar, Image as ImageIcon, Layers } from "lucide-react"
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
    if (tab === 'overview' || tab === 'settings' || tab === 'lms' || tab === 'portfolio' || tab === 'requests') return true;
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

  return (
    <div className="min-h-screen bg-[#FDFCF6] flex flex-col md:flex-row shadow-2xl overflow-hidden">
      {isSuperAdmin && <NotificationBar />}
      {/* Sidebar navigation */}
      <aside className="w-full md:w-80 bg-black text-white p-8 flex flex-col pt-24 border-r border-white/5">
        <div className="mb-12">
          <div className="text-sm font-black uppercase tracking-widest text-yellow-400 mb-2">Portal</div>
          <h1 className="text-2xl font-black">{profile?.role?.replace('_', ' ')}</h1>
        </div>

        <nav className="space-y-2 flex-grow">
          <NavItem
            active={activeTab === 'overview'}
            disabled={!hasAccess('overview')}
            icon={<LayoutDashboard className="h-5 w-5" />}
            label="Overview"
            onClick={() => setActiveTab('overview')}
          />
          {isStaff && (
            <>
              <NavItem
                active={activeTab === 'users'}
                disabled={!hasAccess('users')}
                icon={<Users className="h-5 w-5" />}
                label="User Management"
                onClick={() => setActiveTab('users')}
              />
              <NavItem
                active={activeTab === 'readiness'}
                disabled={!hasAccess('readiness')}
                icon={<GraduationCap className="h-5 w-5" />}
                label="Internship Ready"
                onClick={() => setActiveTab('readiness')}
              />
              <NavItem
                active={activeTab === 'courses'}
                disabled={!hasAccess('courses')}
                icon={<BookMarked className="h-5 w-5" />}
                label="Course Builder"
                onClick={() => setActiveTab('courses')}
              />
              <NavItem
                active={activeTab === 'content'}
                disabled={!hasAccess('content')}
                icon={<Layers className="h-5 w-5" />}
                label="Content Hub"
                onClick={() => setActiveTab('content')}
              />
              <NavItem
                active={activeTab === 'assignments'}
                disabled={!hasAccess('assignments')}
                icon={<BookOpen className="h-5 w-5" />}
                label="Manage Assignments"
                onClick={() => setActiveTab('assignments')}
              />
            </>
          )}


          <NavItem
            active={activeTab === 'brands'}
            disabled={!hasAccess('manageBrands')}
            icon={<Briefcase className="h-5 w-5" />}
            label="Brands & Partners"
            onClick={() => setActiveTab('brands')}
          />
          {isBrand && (
            <NavItem
              active={activeTab === 'requests'}
              icon={<Briefcase className="h-5 w-5" />}
              label="Talent Requests"
              onClick={() => setActiveTab('requests')}
            />
          )}
          <NavItem
            active={activeTab === 'settings'}
            disabled={!hasAccess('settings')}
            icon={<Settings className="h-5 w-5" />}
            label="Settings"
            onClick={() => setActiveTab('settings')}
          />
        </nav>

        <Button
          variant="ghost"
          onClick={() => authService.logout()}
          className="mt-20 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl justify-start p-4 h-auto font-bold"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Log Out
        </Button>
      </aside>

      {/* Main content area */}
      <main className="flex-grow p-8 md:p-20 pt-24 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-2 capitalize">Welcome, {profile?.name.split(' ')[0]}</h2>
            <p className="text-gray-500 font-medium">Here's what's happening in the ÀGBÀ ecosystem.</p>
          </div>
          <div className="hidden md:flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center font-black">
              {profile?.name[0]}
            </div>
            <div className="pr-4">
              <p className="text-sm font-bold text-gray-900">{profile?.name}</p>
              <p className="text-xs text-gray-400">{profile?.email}</p>
            </div>
          </div>
        </header>

        {/* Content Tabs */}
        <div className="max-w-6xl">
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
        </div>
      </main>
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

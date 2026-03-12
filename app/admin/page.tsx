"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { authService } from "@/lib/auth-service"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import UserManagement from "@/components/admin/UserManagement"
import NotificationBar from "@/components/admin/NotificationBar"
import StudentReadiness from "@/components/admin/StudentReadiness"
import AssignmentManager from "@/components/admin/AssignmentManager"
import StudentLMS from "@/components/admin/StudentLMS"
import BlogManager from "@/components/admin/BlogManager"
import { LogOut, LayoutDashboard, Users, Briefcase, Star, Settings, GraduationCap, BookOpen, FileText } from "lucide-react"
import { motion } from "framer-motion"

export default function AdminDashboardPage() {
  const { user, profile, loading, isAdmin, isSuperAdmin, isStudent, isBrand } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

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
            icon={<LayoutDashboard className="h-5 w-5" />} 
            label="Overview" 
            onClick={() => setActiveTab('overview')} 
          />
          {isAdmin && (
            <>
              <NavItem 
                active={activeTab === 'users'} 
                icon={<Users className="h-5 w-5" />} 
                label="User Management" 
                onClick={() => setActiveTab('users')} 
              />
              <NavItem 
                active={activeTab === 'readiness'} 
                icon={<GraduationCap className="h-5 w-5" />} 
                label="Internship Ready" 
                onClick={() => setActiveTab('readiness')} 
              />
              <NavItem 
                active={activeTab === 'blog'} 
                icon={<FileText className="h-5 w-5" />} 
                label="Blog Posts" 
                onClick={() => setActiveTab('blog')} 
              />
            </>
          )}
          
          {/* Shared / Tutor / Admin */}
          {(isAdmin || profile?.role === 'tutor') && (
            <NavItem 
              active={activeTab === 'assignments'} 
              icon={<BookOpen className="h-5 w-5" />} 
              label="Manage Assignments" 
              onClick={() => setActiveTab('assignments')} 
            />
          )}

          {isStudent && (
            <>
              <NavItem 
                active={activeTab === 'lms'} 
                icon={<BookOpen className="h-5 w-5" />} 
                label="Academy LMS" 
                onClick={() => setActiveTab('lms')} 
              />
              <NavItem 
                active={activeTab === 'portfolio'} 
                icon={<Star className="h-5 w-5" />} 
                label="My Portfolio" 
                onClick={() => setActiveTab('portfolio')} 
              />
            </>
          )}
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

          {activeTab === 'users' && isAdmin && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <UserManagement />
            </motion.div>
          )}

          {activeTab === 'readiness' && isAdmin && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <StudentReadiness />
            </motion.div>
          )}

          {activeTab === 'blog' && isAdmin && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <BlogManager />
            </motion.div>
          )}

          {activeTab === 'assignments' && (isAdmin || profile?.role === 'tutor') && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <AssignmentManager />
            </motion.div>
          )}

          {activeTab === 'lms' && isStudent && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <StudentLMS />
            </motion.div>
          )}

          {activeTab === 'portfolio' && isStudent && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
               <Card className="border-none shadow-premium rounded-[2.5rem] bg-white p-12">
                 <h3 className="text-2xl font-black mb-6">Portfolio Submissions</h3>
                 <p className="text-gray-500 mb-10">Add your work links to be visible to brands.</p>
                 <div className="grid gap-6">
                   <PortfolioInput label="YouTube Channel" placeholder="https://youtube.com/@yourchannel" />
                   <PortfolioInput label="Behance Portfolio" placeholder="https://behance.net/username" />
                   <PortfolioInput label="Google Drive / Dropbox" placeholder="https://drive.google.com/..." />
                 </div>
                 <Button className="mt-10 bg-yellow-400 text-black font-black h-14 px-10 rounded-2xl">Update Portfolio</Button>
               </Card>
             </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}

function NavItem({ active, icon, label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all font-bold ${active ? 'bg-yellow-400 text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
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

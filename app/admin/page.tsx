"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { adminService } from "@/lib/services"
import { useAuth } from "@/context/AuthContext"
import { authService } from "@/lib/auth-service"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import UserManagement from "@/components/admin/UserManagement"

import StudentReadiness from "@/components/admin/StudentReadiness"
import StudentDatabase from "@/components/admin/StudentDatabase"
import AssignmentManagementPanel from "@/components/admin/AssignmentManagementPanel"
import BlogManager from "@/components/admin/BlogManager"
import CurriculumAdminPanel from "@/components/admin/CurriculumAdminPanel"
import ContentHub from "@/components/admin/ContentHub"
import EventManager from "@/components/admin/EventManager"
import LiveTimetableManager from "@/components/admin/LiveTimetableManager"
import AcademyManager from "@/components/admin/AcademyManager"
import BrandManagementPanel from "@/components/admin/BrandManagementPanel"
import AnnouncementManager from "@/components/admin/AnnouncementManager"
import AdminSettings from "@/components/admin/AdminSettings"
import ProductManager from "@/components/admin/ProductManager"
import AdminProfile from "@/components/admin/AdminProfile"
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard"
import EmailTester from "@/components/admin/EmailTester"
import PromoCodeManager from "@/components/admin/PromoCodeManager"
import ChatMonitoring from "@/components/admin/ChatMonitoring"
import { LogOut, LayoutDashboard, Users, Briefcase, Star, Settings, GraduationCap, BookOpen, FileText, BookMarked, MonitorPlay, Calendar, Image as ImageIcon, Layers, Bell, BarChart3, UserCircle, Shield, Package, Mail, Ticket, MessageSquare } from "lucide-react"
import { motion } from "framer-motion"
import PushPrompt from "@/components/common/PushPrompt"
import { UserDropdown } from "@/components/common/UserDropdown"
import NotificationBell from "@/components/common/NotificationBell"

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background transition-colors">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400" />
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  )
}

function AdminDashboardContent() {
  const { user, profile, loading, isAdmin, isSuperAdmin, isStudent, isBrand } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()

  const initialTab = searchParams.get('tab') || 'overview'
  const [activeTab, setActiveTab] = useState(initialTab)
  const [stats, setStats] = useState<{ revenue: number; users: number; pending: number }>({ revenue: 0, users: 0, pending: 0 })
  const [loadingStats, setLoadingStats] = useState(true)

  // Sync tab with URL
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tabId)
    router.replace(`/admin?${params.toString()}`, { scroll: false })
  }

  useEffect(() => {
    async function loadStats() {
      try {
        const [sales, engagement, pending] = await Promise.all([
          adminService.getSalesStats(),
          adminService.getEngagementData(),
          adminService.getPendingApprovals()
        ])
        setStats({
          revenue: sales.totalRevenue || 0,
          users: engagement.totalUsers || 0,
          pending: pending.length || 0
        })
      } catch (err) {
        console.error("Error loading admin stats:", err)
      } finally {
        setLoadingStats(false)
      }
    }
    loadStats()
  }, [])

  useEffect(() => {
    if (!loading && profile) {
      if (profile.role === 'student') {
        window.location.href = '/student/dashboard'
      } else if (profile.role === 'brand' || profile.role === 'ngo') {
        window.location.href = '/brand/dashboard'
      }
    }
  }, [loading, profile])

  const isStaff = ['super_admin', 'director', 'hod', 'admin', 'tutor', 'staff'].includes(profile?.role || '');

  const hasAccess = (tab: string) => {
    if (tab === 'overview' || tab === 'settings' || tab === 'profile' || tab === 'lms' || tab === 'portfolio' || tab === 'requests') return true;
    if (['super_admin', 'director'].includes(profile?.role || '')) return true;

    const permissions: Record<string, string[]> = {
      hod: ['readiness', 'courses', 'content', 'assignments', 'timetable'],
      head_of_department: ['readiness', 'courses', 'content', 'assignments', 'timetable'],
      tutor: ['content', 'assignments', 'timetable', 'communications'],
      staff: ['readiness', 'content'],
      admin: ['readiness', 'content', 'assignments', 'timetable', 'communications']
    };

    return permissions[profile?.role || '']?.includes(tab) || false;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background transition-colors">
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
          <div className="min-h-screen flex items-center justify-center bg-background p-4 transition-colors">
            <div className="text-center">
              <h2 className="text-2xl font-black mb-4 text-foreground">Account profile not found.</h2>
              <p className="text-muted-foreground mb-8">Please log out and try registering again.</p>
              <Button onClick={() => authService.logout()} className="bg-foreground text-background px-8 h-14 rounded-2xl font-bold hover:bg-yellow-400 hover:text-black transition-all">Log Out</Button>
            </div>
          </div>
        )
      }
    }
    return null
  }

  // --- STAFF APPROVAL GUARD ---
  // Allow super_admin and verified students/brands. Staff/Tutors/HOD/Director need approvalStatus === 'approved'
  const restrictedRoles = ['staff', 'tutor', 'hod', 'head_of_department', 'director', 'admin'];
  // Ensure the check only runs for non-super_admins
  const isPendingApproval = (profile as any).approvalStatus === 'pending';

  if (restrictedRoles.includes(profile.role) && profile.role !== 'super_admin' && isPendingApproval) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-4 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(250,204,21,0.1),transparent_50%)]" />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full text-center space-y-10 relative z-10"
        >
          <div className="w-32 h-32 bg-yellow-400 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-[0_40px_80px_rgba(250,204,21,0.3)]">
            <Shield className="h-16 w-16 text-black" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Access Pending</h2>
            <p className="text-gray-400 font-medium leading-relaxed">
              Your staff account is currently scheduled for <span className="text-yellow-400 font-black">Admin Approval</span>.
              Access to operational tools is restricted until verified.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-left space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Security Note</p>
            <p className="text-sm text-gray-300 font-medium">Verify your credentials with the Super Admin or Director to activate your dashboard access.</p>
          </div>
          <Button
            onClick={() => authService.logout()}
            className="w-full bg-white hover:bg-yellow-400 text-black font-black h-14 rounded-2xl transition-all shadow-xl active:scale-95"
          >
            Sign Out Securely
          </Button>
        </motion.div>
      </div>
    )
  }

  // Build a flat list of visible tabs for mobile bar
  const mobileTabs = [
    { id: 'overview', label: 'Home', icon: LayoutDashboard },
    ...(isStaff ? [
      { id: 'users', label: 'Users', icon: Users },
      { id: 'timetable', label: 'Live', icon: Calendar },
    ] : []),
    { id: 'analytics', label: 'Stats', icon: BarChart3 },
    ...(['super_admin', 'tutor', 'admin'].includes(profile?.role || '') ? [
      { id: 'communications', label: 'Comms', icon: MessageSquare }
    ] : [])
  ]

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">

      {/* ── TOP HEADER ── */}
      <header className="fixed top-0 inset-x-0 z-50 h-20 bg-black text-white flex items-center justify-between px-6 md:px-12 shadow-[0_4px_30px_rgba(0,0,0,0.5)] border-b border-white/5 backdrop-blur-md bg-black/90 transition-all">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center transform hover:rotate-12 transition-transform">
            <Shield className="h-6 w-6 text-black" />
          </div>
          <div>
            <p className="text-[10px] text-yellow-400 font-black tracking-[0.4em]">Admin portal</p>
            <h1 className="text-xl font-black tracking-tighter leading-none text-white">
              {profile?.role?.replace('_', ' ').charAt(0).toUpperCase() + profile?.role?.replace('_', ' ').slice(1).toLowerCase()}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <NotificationBell />
          <UserDropdown
            onSettingsClick={() => handleTabChange('settings')}
            onProfileClick={() => handleTabChange('profile')}
          />
        </div>
      </header>

      <div className="flex pt-20 transition-colors">
        {/* ── DESKTOP SIDEBAR ── */}
        <aside className="hidden md:flex flex-col w-80 fixed top-20 bottom-0 left-0 bg-black text-white p-8 border-r border-white/5 overflow-y-auto custom-scrollbar">
          <div className="mb-10 px-4">
            <div className="h-0.5 w-12 bg-yellow-400 mb-6" />
            <p className="text-[12px] font-black tracking-[0.5em] text-white">Operational Menu</p>
          </div>
          <nav className="flex-1 space-y-2">
            <NavItem active={activeTab === 'overview'} disabled={!hasAccess('overview')} icon={<LayoutDashboard className="h-5 w-5" />} label="Overview" onClick={() => handleTabChange('overview')} />
            {isStaff && (
              <>
                <NavItem active={activeTab === 'users'} disabled={!hasAccess('users')} icon={<Users className="h-5 w-5" />} label="Manage Users" onClick={() => handleTabChange('users')} />
                <NavItem active={activeTab === 'students'} disabled={!hasAccess('students')} icon={<Users className="h-5 w-5" />} label="Student Database" onClick={() => handleTabChange('students')} />
                <NavItem active={activeTab === 'readiness'} disabled={!hasAccess('readiness')} icon={<Shield className="h-5 w-5" />} label="Nominate Ready" onClick={() => handleTabChange('readiness')} />
                <NavItem active={activeTab === 'timetable'} disabled={!hasAccess('timetable')} icon={<Calendar className="h-5 w-5" />} label="Live Schedule" onClick={() => handleTabChange('timetable')} />
                <NavItem active={activeTab === 'courses'} disabled={!hasAccess('courses')} icon={<BookMarked className="h-5 w-5" />} label="Manage Courses" onClick={() => handleTabChange('courses')} />
                <NavItem active={activeTab === 'content'} disabled={!hasAccess('content')} icon={<Layers className="h-5 w-5" />} label="Media Library" onClick={() => handleTabChange('content')} />
                <NavItem active={activeTab === 'assignments'} disabled={!hasAccess('assignments')} icon={<BookOpen className="h-5 w-5" />} label="Assignments" onClick={() => handleTabChange('assignments')} />
                <NavItem active={activeTab === 'armory'} disabled={!['super_admin', 'director'].includes(profile?.role || '')} icon={<Package className="h-5 w-5" />} label="The Armory" onClick={() => handleTabChange('armory')} />
                {['super_admin', 'tutor', 'admin'].includes(profile?.role || '') && (
                  <>
                    {profile?.role === 'super_admin' && (
                      <>
                        <NavItem active={activeTab === 'email-tester'} icon={<Mail className="h-5 w-5" />} label="Email Tester" onClick={() => handleTabChange('email-tester')} />
                        <NavItem active={activeTab === 'promo-codes'} icon={<Ticket className="h-5 w-5" />} label="Promo Codes" onClick={() => handleTabChange('promo-codes')} />
                      </>
                    )}
                    <NavItem active={activeTab === 'communications'} icon={<MessageSquare className="h-5 w-5" />} label="Live Comms" onClick={() => handleTabChange('communications')} />
                  </>
                )}
              </>
            )}
            <NavItem active={activeTab === 'analytics'} icon={<BarChart3 className="h-5 w-5" />} label="Portal Stats" onClick={() => handleTabChange('analytics')} />
            <NavItem active={activeTab === 'broadcasts'} icon={<Bell className="h-5 w-5" />} label="Broadcasts" onClick={() => handleTabChange('broadcasts')} />
            <NavItem active={activeTab === 'brands'} disabled={!hasAccess('manageBrands')} icon={<Briefcase className="h-5 w-5" />} label="Manage Brands" onClick={() => handleTabChange('brands')} />
            {isBrand && <NavItem active={activeTab === 'requests'} icon={<Briefcase className="h-5 w-5" />} label="Talent Requests" onClick={() => handleTabChange('requests')} />}
          </nav>

        </aside>

        {/* Main content area */}
        <main className="flex-1 md:ml-80 min-h-[calc(100vh-5rem)] overflow-y-auto transition-colors">

          <div className="p-8 md:p-16 pb-32 md:pb-20 max-w-7xl">
            <div className="hidden md:block mb-12 border-b border-muted pb-8">
              <h2 className="text-3xl lg:text-4xl font-black tracking-tighter text-foreground mb-4 transition-colors">Admin hub: {profile?.name.split(' ')[0]}</h2>
              <p className="text-muted-foreground font-medium text-xl">Manage the entire ÀGBÀ CINEMA platform from one place.</p>
            </div>

            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard
                  label="Network Revenue"
                  value={loadingStats ? "..." : `₦${stats.revenue.toLocaleString()}`}
                  subtext="Total Gross Income"
                  color="bg-green-500/10 text-green-500"
                />
                <StatCard
                  label="Registered Assets"
                  value={loadingStats ? "..." : stats.users.toString()}
                  subtext="Total Platform Users"
                  color="bg-blue-500/10 text-blue-500"
                />
                <StatCard
                  label="Critical Alerts"
                  value={loadingStats ? "..." : stats.pending.toString()}
                  subtext="Tasks Awaiting Approval"
                  color="bg-red-500/10 text-red-500"
                />
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

            {activeTab === 'students' && isStaff && hasAccess('students') && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <StudentDatabase />
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

            {activeTab === 'timetable' && isStaff && hasAccess('timetable') && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <LiveTimetableManager />
              </motion.div>
            )}

            {activeTab === 'assignments' && isStaff && hasAccess('assignments') && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <AssignmentManagementPanel />
              </motion.div>
            )}

            {activeTab === 'armory' && (['super_admin', 'director'].includes(profile?.role || '')) && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <ProductManager />
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

            {activeTab === 'email-tester' && profile?.role === 'super_admin' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <EmailTester />
              </motion.div>
            )}

            {activeTab === 'promo-codes' && profile?.role === 'super_admin' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <PromoCodeManager />
              </motion.div>
            )}

            {activeTab === 'communications' && ['super_admin', 'tutor', 'admin'].includes(profile?.role || '') && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <ChatMonitoring currentUser={profile as any} />
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
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 min-w-[56px] flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors ${isActive ? 'text-yellow-400' : 'text-gray-500'}`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-[8px] font-black tracking-wider whitespace-nowrap ${isActive ? 'text-yellow-400' : 'text-gray-600'}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </nav>

      <PushPrompt />
    </div>
  )
}

function NavItem({ active, icon, label, onClick, disabled }: any) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-5 p-5 rounded-[1.5rem] transition-all font-black text-[13px] tracking-[0.2em] ${disabled
        ? 'opacity-20 cursor-not-allowed text-white/30'
        : active
          ? 'bg-yellow-400 text-black shadow-xl shadow-yellow-400/20 scale-[1.02]'
          : 'text-white hover:bg-white/5 active:scale-95'
        }`}
    >
      <div className={`transition-colors ${active ? 'text-black' : 'text-yellow-400'}`}>{icon}</div>
      {label}
    </button>
  )
}

function StatCard({ label, value, subtext, color }: any) {
  return (
    <Card className="border border-muted shadow-premium bg-card p-10 rounded-[3rem] hover:scale-[1.03] transition-all duration-500 overflow-hidden relative group">
      <div className={`w-14 h-14 rounded-2xl mb-8 flex items-center justify-center font-black text-xl shadow-xl transition-all group-hover:bg-yellow-400 group-hover:text-black ${color}`}>
        {value[0]}
      </div>
      <div>
        <p className="text-[10px] font-black text-muted-foreground tracking-[0.4em] mb-2 transition-colors group-hover:text-yellow-500">{label}</p>
        <h3 className="text-3xl font-black text-foreground tracking-tighter leading-none mb-3 transition-colors">{value}</h3>
        <p className="text-[11px] text-muted-foreground font-medium opacity-60">{subtext}</p>
      </div>
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-yellow-400/5 blur-3xl rounded-full transition-all group-hover:bg-yellow-400/10" />
    </Card>
  )
}

function PortfolioInput({ label, placeholder }: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black tracking-widest text-muted-foreground">{label}</label>
      <input
        className="w-full h-14 px-6 rounded-2xl border-muted bg-muted/20 focus:bg-card focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-all text-foreground"
        placeholder={placeholder}
      />
    </div>
  )
}

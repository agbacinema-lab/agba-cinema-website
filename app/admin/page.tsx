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
import AdminMoreSettings from "@/components/admin/AdminMoreSettings"
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard"
import EmailTester from "@/components/admin/EmailTester"
import PromoCodeManager from "@/components/admin/PromoCodeManager"
import ChatMonitoring from "@/components/admin/ChatMonitoring"
import { LogOut, LayoutDashboard, Users, Briefcase, Star, Settings, GraduationCap, BookOpen, FileText, BookMarked, MonitorPlay, Calendar, Image as ImageIcon, Layers, Bell, BarChart3, UserCircle, Shield, Package, Mail, Ticket, MessageSquare, ChevronDown, MoreHorizontal } from "lucide-react"
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
  const [isManageUsersOpen, setIsManageUsersOpen] = useState(initialTab === 'users')
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [stats, setStats] = useState<{ revenue: number; users: number; pending: number }>({ revenue: 0, users: 0, pending: 0 })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && tab !== activeTab) {
      setActiveTab(tab)
      if (tab === 'users') setIsManageUsersOpen(true)
    }
  }, [searchParams, activeTab])

  // Sync tab with URL
  const handleTabChange = (tabId: string, viewId?: string) => {
    setActiveTab(tabId)
    setIsMoreOpen(false)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tabId)
    if (viewId) {
       params.set('view', viewId)
    } else {
       params.delete('view')
    }
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
  const hasExecutiveView = ['super_admin', 'director'].includes(profile?.role || '');

  const hasAccess = (tab: string) => {
    if (tab === 'overview' || tab === 'settings' || tab === 'profile' || tab === 'lms' || tab === 'portfolio' || tab === 'requests') return true;
    if (['super_admin', 'director'].includes(profile?.role || '')) return true;

    const staffPerms = ['readiness', 'content', 'users'];
    const tutorPerms = ['content', 'assignments', 'timetable', 'communications', 'users'];
    const hodPerms = ['readiness', 'courses', 'content', 'assignments', 'timetable', 'users'];

    const permissions: Record<string, string[]> = {
      hod: hodPerms,
      head_of_department: hodPerms,
      tutor: tutorPerms,
      staff: staffPerms,
      admin: Array.from(new Set([...staffPerms, ...tutorPerms, ...hodPerms])),
      more: ['content', 'assignments', 'communications', 'users', 'courses', 'timetable'] 
    };

    if (tab === 'more') {
       // if they have any of the permissions that live in 'more', they can access 'more'
       return permissions[profile?.role || '']?.some(p => ['assignments', 'communications'].includes(p)) || false;
    }

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

  // Build mobile bottom bar — always 5 tabs for staff, 1 for others
  const mobileTabs = [
    { id: 'overview', label: 'Home', icon: LayoutDashboard, show: true },
    { id: 'users', label: 'Users', icon: Users, show: isStaff },
    { id: 'timetable', label: 'Live', icon: Calendar, show: isStaff },
    { id: 'content', label: 'Media', icon: Layers, show: isStaff },
    { id: 'more', label: 'More', icon: MoreHorizontal, show: isStaff },
  ].filter(t => t.show)

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">

      {/* ── TOP HEADER ── */}
      <header className="fixed top-0 inset-x-0 z-50 h-20 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 md:px-12 transition-all">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center transform hover:rotate-12 transition-transform shadow-lg shadow-yellow-400/20">
            <Shield className="h-6 w-6 text-black" />
          </div>
          <div>
            <p className="text-[10px] text-yellow-400 font-black tracking-[0.4em] uppercase">Admin portal</p>
            <h1 className="text-xl font-black tracking-tighter leading-none text-foreground">
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
        <aside className="hidden md:flex flex-col w-80 fixed top-20 bottom-0 left-0 bg-card p-8 border-r border-border overflow-y-auto custom-scrollbar">
          <div className="mb-10 px-4">
            <div className={`h-0.5 w-12 mb-6 ${hasExecutiveView ? 'bg-yellow-400' : 'bg-indigo-500'}`} />
            <p className="text-[12px] font-black tracking-[0.5em] text-foreground opacity-60 uppercase">
               {hasExecutiveView ? 'Executive Menu' : 'Operations Menu'}
            </p>
          </div>
          <nav className="flex-1 space-y-2">
            <NavItem active={activeTab === 'overview'} disabled={!hasAccess('overview')} icon={<LayoutDashboard className="h-5 w-5" />} label="Overview" onClick={() => handleTabChange('overview')} />
            {isStaff && (
              <>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setIsManageUsersOpen(!isManageUsersOpen)
                      if (!isManageUsersOpen) handleTabChange('users', 'students') // Automatically navigate when opening
                    }}
                    disabled={!hasAccess('users')}
                    className={`w-full flex items-center justify-between p-5 rounded-[1.5rem] transition-all font-black text-[13px] tracking-[0.2em] ${!hasAccess('users')
                      ? 'opacity-20 cursor-not-allowed text-muted-foreground/30'
                      : activeTab === 'users'
                        ? 'bg-yellow-400 text-black shadow-xl shadow-yellow-400/20 scale-[1.02]'
                        : 'text-foreground hover:bg-foreground/5 active:scale-95'
                      }`}
                  >
                     <div className="flex items-center gap-5">
                       <div className={`transition-colors ${activeTab === 'users' ? 'text-black' : 'text-yellow-400'}`}>
                         <Users className="h-5 w-5" />
                       </div>
                       Manage Users
                     </div>
                     <ChevronDown className={`h-4 w-4 transition-transform ${isManageUsersOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isManageUsersOpen && hasAccess('users') && (
                    <div className="pl-12 pr-4 space-y-1 py-2 relative before:absolute before:left-8 before:top-4 before:bottom-4 before:w-px before:bg-border">
                       <button 
                         onClick={() => handleTabChange('users', 'students')}
                         className={`w-full flex items-center p-3 rounded-xl transition-all font-black text-[11px] tracking-widest text-left ${activeTab === 'users' && searchParams.get('view') === 'students' ? 'bg-yellow-400/10 text-yellow-500' : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'}`}
                       >
                         Students
                       </button>
                       <button 
                         onClick={() => handleTabChange('users', 'staff')}
                         className={`w-full flex items-center p-3 rounded-xl transition-all font-black text-[11px] tracking-widest text-left ${activeTab === 'users' && searchParams.get('view') === 'staff' ? 'bg-yellow-400/10 text-yellow-500' : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'}`}
                       >
                         Tutors & Staff
                       </button>
                       <button 
                         onClick={() => handleTabChange('users', 'brands')}
                         className={`w-full flex items-center p-3 rounded-xl transition-all font-black text-[11px] tracking-widest text-left ${activeTab === 'users' && searchParams.get('view') === 'brands' ? 'bg-yellow-400/10 text-yellow-500' : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'}`}
                       >
                         Brands
                       </button>
                    </div>
                  )}
                </div>
                {!hasExecutiveView && (
                  <NavItem active={activeTab === 'readiness'} disabled={!hasAccess('readiness')} icon={<Shield className="h-5 w-5" />} label="Nominate Ready" onClick={() => handleTabChange('readiness')} />
                )}
                <NavItem active={activeTab === 'timetable'} disabled={!hasAccess('timetable')} icon={<Calendar className="h-5 w-5" />} label="Live Schedule" onClick={() => handleTabChange('timetable')} />
                <NavItem active={activeTab === 'courses'} disabled={!hasAccess('courses')} icon={<BookMarked className="h-5 w-5" />} label="Manage Courses" onClick={() => handleTabChange('courses')} />
                <NavItem active={activeTab === 'content'} disabled={!hasAccess('content')} icon={<Layers className="h-5 w-5" />} label="Media Library" onClick={() => handleTabChange('content')} />
                
                {/* ── Desktop More Button — opens full settings page ── */}
                <button
                  onClick={() => handleTabChange('more')}
                  className={`w-full flex items-center gap-5 p-5 rounded-[1.5rem] transition-all font-black text-[13px] tracking-[0.2em] ${
                    activeTab === 'more'
                      ? 'bg-yellow-400 text-black shadow-xl shadow-yellow-400/20 scale-[1.02]'
                      : 'text-foreground hover:bg-foreground/5 active:scale-95'
                  }`}
                >
                  <div className={`transition-colors w-7 h-7 flex items-center justify-center border-2 rounded-full ${
                    activeTab === 'more' ? 'border-black' : 'border-foreground'
                  }`}>
                    <MoreHorizontal className="h-4 w-4" />
                  </div>
                  More...
                </button>
              </>
            )}
            {/* <NavItem active={activeTab === 'analytics'} icon={<BarChart3 className="h-5 w-5" />} label="Portal Stats" onClick={() => handleTabChange('analytics')} /> */}
            {isBrand && <NavItem active={activeTab === 'requests'} icon={<Briefcase className="h-5 w-5" />} label="Talent Requests" onClick={() => handleTabChange('requests')} />}
          </nav>

        </aside>

        {/* Main content area */}
        <main className="flex-1 md:ml-80 min-h-[calc(100vh-5rem)] overflow-y-auto transition-colors">

          <div className={activeTab === 'more' ? '' : 'p-8 md:p-16 pb-32 md:pb-20 max-w-7xl'}>


            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                
                {hasExecutiveView ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <StatCard
                        label="Network Revenue"
                        value={loadingStats ? "..." : `₦${stats.revenue.toLocaleString()}`}
                        subtext="Total Gross Income"
                        color="bg-green-500/10 text-green-500"
                        allowHoverColor={true}
                      />
                      <StatCard
                        label="Registered Assets"
                        value={loadingStats ? "..." : stats.users.toString()}
                        subtext="Total Platform Users"
                        color="bg-blue-500/10 text-blue-500"
                        allowHoverColor={false}
                      />
                      <StatCard
                        label="Critical Alerts"
                        value={loadingStats ? "..." : stats.pending.toString()}
                        subtext="Tasks Awaiting Approval"
                        color="bg-red-500/10 text-red-500"
                        allowHoverColor={true}
                      />
                    </div>

                    <div className="pt-8 mb-8 border-t border-muted">
                       <h3 className="text-2xl font-black tracking-tighter text-foreground mb-8">Recently Registered Assets</h3>
                       <UserManagement compact={true} />
                    </div>

                    <div className="pt-8 border-t border-muted">
                      <h3 className="text-2xl font-black tracking-tighter text-foreground mb-8">Portal Analytics</h3>
                      <AnalyticsDashboard />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <StatCard
                        label="Active Assignments"
                        value="Active"
                        subtext="View roster below"
                        color="bg-indigo-500/10 text-indigo-500"
                      />
                      <StatCard
                        label="Incoming Messages"
                        value="Check Comms"
                        subtext="Unread communications"
                        color="bg-yellow-400/10 text-yellow-500"
                      />
                    </div>
                    
                    <div className="pt-8 mb-8 border-t border-muted">
                       <div className="flex items-center justify-between mb-8">
                         <h3 className="text-2xl font-black tracking-tighter text-foreground">My Assigned Roster</h3>
                         <span className="text-[10px] font-black tracking-widest text-indigo-500 uppercase px-4 py-2 bg-indigo-500/10 rounded-xl">Tutor Operations</span>
                       </div>
                       {/* Passing instructorId filters UserManagement to ONLY their active roster. */}
                       <UserManagement compact={true} filterByTutorId={profile?.uid} />
                    </div>
                  </>
                )}

              </motion.div>
            )}

            {activeTab === 'users' && isStaff && hasAccess('users') && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <UserManagement />
              </motion.div>
            )}

            {/* <NavItem active={activeTab === 'analytics'} icon={<BarChart3 className="h-5 w-5" />} label="Portal Stats" onClick={() => handleTabChange('analytics')} /> was removed */}

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

            {activeTab === 'more' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <AdminMoreSettings />
              </motion.div>
            )}

            {activeTab === 'timetable' && isStaff && hasAccess('timetable') && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <LiveTimetableManager />
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <AdminProfile />
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

            {activeTab === 'settings' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <AdminSettings />
              </motion.div>
            )}
          </div>



        </main>
      </div>

      {/* ── Mobile More Popover (above bottom tab bar) ── */}
      {isMoreOpen && (
        <>
          <div className="md:hidden fixed inset-0 z-[90]" onClick={() => setIsMoreOpen(false)} />
          <div className="md:hidden fixed z-[100] bg-popover border border-border rounded-[2rem] p-4 w-72 shadow-2xl flex flex-col gap-1 right-4 bottom-24">
            <p className="text-[10px] font-black tracking-[0.4em] text-muted-foreground uppercase px-2 mb-2">More options</p>
            <NavItem active={activeTab === 'assignments'} disabled={!hasAccess('assignments')} icon={<BookOpen className="h-5 w-5" />} label="Assignments" onClick={() => handleTabChange('assignments')} />
            <NavItem active={activeTab === 'courses'} disabled={!hasAccess('courses')} icon={<BookMarked className="h-5 w-5" />} label="Courses" onClick={() => handleTabChange('courses')} />
            <NavItem active={activeTab === 'armory'} disabled={!['super_admin', 'director'].includes(profile?.role || '')} icon={<Package className="h-5 w-5" />} label="The Armory" onClick={() => handleTabChange('armory')} />
            {['super_admin', 'director'].includes(profile?.role || '') && (
              <>
                <NavItem active={activeTab === 'email-tester'} icon={<Mail className="h-5 w-5" />} label="Email Tester" onClick={() => handleTabChange('email-tester')} />
                <NavItem active={activeTab === 'promo-codes'} icon={<Ticket className="h-5 w-5" />} label="Promo Codes" onClick={() => handleTabChange('promo-codes')} />
              </>
            )}
            <NavItem active={activeTab === 'communications'} disabled={!['super_admin', 'tutor', 'admin'].includes(profile?.role || '')} icon={<MessageSquare className="h-5 w-5" />} label="Live Comms" onClick={() => handleTabChange('communications')} />
          </div>
        </>
      )}

      {/* ── MOBILE BOTTOM TAB BAR ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-t border-border flex items-stretch">
        {mobileTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = tab.id === 'more' ? isMoreOpen : activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => tab.id === 'more' ? setIsMoreOpen(!isMoreOpen) : handleTabChange(tab.id)}
              className={`flex-1 min-w-[56px] flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors ${isActive ? 'text-yellow-400' : 'text-muted-foreground'}`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-[8px] font-black tracking-wider whitespace-nowrap ${isActive ? 'text-yellow-400' : 'text-muted-foreground/60'}`}>
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
        ? 'opacity-20 cursor-not-allowed text-muted-foreground/30'
        : active
          ? 'bg-yellow-400 text-black shadow-xl shadow-yellow-400/20 scale-[1.02]'
          : 'text-foreground hover:bg-foreground/5 active:scale-95'
        }`}
    >
      <div className={`transition-colors ${active ? 'text-black' : 'text-yellow-400'}`}>{icon}</div>
      {label}
    </button>
  )
}

function StatCard({ label, value, subtext, color, allowHoverColor = true }: any) {
  return (
    <Card className="border border-muted shadow-premium bg-card p-10 rounded-[3rem] hover:scale-[1.03] transition-all duration-500 overflow-hidden relative group">
      <div className={`w-14 h-14 rounded-2xl mb-8 flex items-center justify-center font-black text-xl shadow-xl transition-all ${allowHoverColor ? 'group-hover:bg-yellow-400 group-hover:text-black' : ''} ${color}`}>
        {value[0]}
      </div>
      <div>
        <p className="text-[10px] font-black text-muted-foreground tracking-[0.4em] mb-2 uppercase">{label}</p>
        <h3 className="text-3xl font-black text-foreground tracking-tighter leading-none mb-3">{value}</h3>
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

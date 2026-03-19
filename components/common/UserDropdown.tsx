"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { authService } from "@/lib/auth-service"
import { Settings, LogOut, User, Shield, CreditCard } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"

interface UserDropdownProps {
  onSettingsClick?: () => void
  onProfileClick?: () => void
}

export function UserDropdown({ onSettingsClick, onProfileClick }: UserDropdownProps) {
  const { profile } = useAuth()
  const router = useRouter()

  const handleSettingsClick = () => {
    if (onSettingsClick) onSettingsClick()
    else router.push('/student/settings')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-4 outline-none group bg-card hover:bg-muted/10 p-2 pr-4 rounded-2xl border border-muted/50 transition-all shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-yellow-400 flex items-center justify-center text-black font-black text-xl shadow-[0_10px_30px_rgba(250,204,21,0.3)] group-hover:scale-105 active:scale-95 transition-all relative overflow-hidden">
             {(profile?.name?.[0] || profile?.name?.[1] || "U").toUpperCase()}
             <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] group-hover:text-yellow-400 transition-colors">
              {profile?.name}
            </p>
            <p className="text-[9px] text-muted-foreground font-medium group-hover:text-foreground transition-colors mt-1 opacity-60">
              {profile?.email}
            </p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 bg-card border border-muted p-3 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.3)] backdrop-blur-3xl">

        <DropdownMenuLabel className="p-4 mb-2">
          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400">Account Role</p>
            <p className="text-sm font-black text-foreground uppercase italic tracking-tighter truncate">{profile?.role?.replace('_', ' ')}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-muted mx-2 mb-2" />
        
        <DropdownMenuItem 
          onClick={handleSettingsClick}
          className="p-4 focus:bg-yellow-400/10 focus:text-foreground text-muted-foreground rounded-2xl cursor-pointer transition-all gap-4 mb-2"
        >
          <div className="w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center">
             <Settings className="h-4 w-4" />
          </div>
          <span className="font-black text-[10px] uppercase tracking-widest">Settings</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          className="p-4 focus:bg-indigo-400/10 focus:text-foreground text-muted-foreground rounded-2xl cursor-pointer transition-all gap-4 mb-2"
          onClick={() => {
            if (onProfileClick) {
               onProfileClick()
               return
            }
            if (['admin', 'super_admin', 'director', 'hod', 'tutor', 'staff'].includes(profile?.role || '')) {
               router.push('/admin') // Their profile is handled inside the admin dashboard
            } else if (profile?.role === 'brand') {
               router.push('/brand/dashboard')
            } else {
               router.push('/student/profile')
            }
          }}
        >
          <div className="w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center">
             <User className="h-4 w-4" />
          </div>
          <span className="font-black text-[10px] uppercase tracking-widest">My Profile</span>
        </DropdownMenuItem>

        {profile?.role === 'brand' && (
          <DropdownMenuItem 
            className="p-4 focus:bg-green-400/10 focus:text-foreground text-muted-foreground rounded-2xl cursor-pointer transition-all gap-4 mb-2"
          >
            <div className="w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center">
               <CreditCard className="h-4 w-4" />
            </div>
            <span className="font-black text-[10px] uppercase tracking-widest">Billing</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator className="bg-muted mx-2 mb-2" />

        
        <DropdownMenuItem 
          onClick={async () => {
             await authService.logout()
             window.location.href = '/login'
          }}
          className="p-4 focus:bg-red-500/10 focus:text-red-500 text-red-500 rounded-2xl cursor-pointer transition-all gap-4"
        >
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
             <LogOut className="h-4 w-4" />
          </div>
          <span className="font-black uppercase tracking-[0.3em] text-[10px]">Log Out</span>
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  )
}

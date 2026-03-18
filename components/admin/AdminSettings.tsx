"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Moon, Sun, Bell, Shield, Globe, Zap, Palette, Lock } from "lucide-react"

export default function AdminSettings() {
  const [theme, setTheme] = useState("dark")
  const [notifications, setNotifications] = useState({
    email: true,
    browser: false,
    payments: true,
    newUsers: true
  })

  const handleSave = () => {
    toast.success("Settings saved successfully!")
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <header>
        <h2 className="text-4xl font-black italic uppercase tracking-tighter">System Configuration</h2>
        <p className="text-gray-500 font-medium">Control the ÀGBÀ CINEMA administrative environment and preferences.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Appearance Section */}
        <Card className="border-none shadow-premium rounded-[2rem] bg-white overflow-hidden">
          <CardHeader className="bg-black text-white p-8">
            <div className="flex items-center gap-3">
              <Palette className="h-5 w-5 text-yellow-400" />
              <CardTitle className="text-xl font-black italic uppercase tracking-tighter">Appearance</CardTitle>
            </div>
            <CardDescription className="text-gray-400">Manage the visual interface of the portal.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="space-y-0.5">
                <Label className="text-sm font-black uppercase tracking-widest">Dark Mode</Label>
                <p className="text-xs text-gray-500">Enable cinematic dark theme across the portal.</p>
              </div>
              <Switch 
                checked={theme === "dark"} 
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>

            <div className="space-y-3">
               <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Interface Color</Label>
               <div className="flex gap-2">
                 {["#EAB308", "#3B82F6", "#EF4444", "#10B981"].map(c => (
                   <button 
                     key={c}
                     className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                     style={{ backgroundColor: c }}
                   />
                 ))}
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card className="border-none shadow-premium rounded-[2rem] bg-white overflow-hidden">
          <CardHeader className="bg-black text-white p-8">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-yellow-400" />
              <CardTitle className="text-xl font-black italic uppercase tracking-tighter">Security</CardTitle>
            </div>
            <CardDescription className="text-gray-400">Strict access and authentication protocols.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="space-y-0.5">
                <Label className="text-sm font-black uppercase tracking-widest">2FA Enforcement</Label>
                <p className="text-xs text-gray-500">Require MFA for all administrative roles.</p>
              </div>
              <Switch checked={true} />
            </div>
            <Button variant="outline" className="w-full h-12 rounded-xl border-2 font-bold flex gap-2">
              <Lock className="h-4 w-4" />
              Reset Security Keys
            </Button>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card className="border-none shadow-premium rounded-[2rem] bg-white overflow-hidden md:col-span-2">
          <CardHeader className="bg-black text-white p-8 flex flex-row items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-yellow-400" />
                <CardTitle className="text-xl font-black italic uppercase tracking-tighter">Notification Protocols</CardTitle>
              </div>
              <CardDescription className="text-gray-400">Configure how the system communicates with you.</CardDescription>
            </div>
            <Button onClick={handleSave} className="bg-yellow-400 text-black hover:bg-yellow-500 font-bold px-8 rounded-xl h-12">
              Save Changes
            </Button>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <NotificationToggle 
                title="Email Alerts" 
                desc="Receive crucial updates via your registered email."
                checked={notifications.email}
                onChange={(v) => setNotifications({...notifications, email: v})}
              />
              <NotificationToggle 
                title="Payment Triggers" 
                desc="Real-time alerts for all Paystack transactions."
                checked={notifications.payments}
                onChange={(v) => setNotifications({...notifications, payments: v})}
              />
              <NotificationToggle 
                title="Browser Push" 
                desc="Direct desktop notifications for immediate action."
                checked={notifications.browser}
                onChange={(v) => setNotifications({...notifications, browser: v})}
              />
              <NotificationToggle 
                title="New Student Enrollment" 
                desc="Get notified when a new creative joins the academy."
                checked={notifications.newUsers}
                onChange={(v) => setNotifications({...notifications, newUsers: v})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Critical Actions */}
        <Card className="border-2 border-red-100 shadow-premium rounded-[2rem] bg-white md:col-span-2">
          <CardContent className="p-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
                <Zap className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h4 className="font-black uppercase tracking-widest text-red-600">Maintenance Mode</h4>
                <p className="text-sm text-gray-400">Temporarily disable public access to the portal.</p>
              </div>
            </div>
            <Button variant="destructive" className="px-8 h-12 rounded-xl font-bold">Activate</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function NotificationToggle({ title, desc, checked, onChange }: any) {
  return (
    <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-gray-100 hover:border-gray-200 transition-all">
      <div className="space-y-1">
        <Label className="text-sm font-black uppercase tracking-widest">{title}</Label>
        <p className="text-xs text-gray-500 font-medium max-w-[200px]">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} className="data-[state=checked]:bg-black" />
    </div>
  )
}

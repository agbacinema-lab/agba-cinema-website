"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Search, ChevronRight } from "lucide-react"

// Import all the components that belong in the "More" section
import AssignmentManagementPanel from "./AssignmentManagementPanel"
import ProductManager from "./ProductManager"
import EmailTester from "./EmailTester"
import PromoCodeManager from "./PromoCodeManager"
import ChatMonitoring from "./ChatMonitoring"

const SETTINGS_SECTIONS = [
  { id: "assignments", title: "Assignments", description: "Manage platform assignments and submissions." },
  { id: "communications", title: "Live Comms", description: "Monitor active portal communications." },
  { id: "armory", title: "The Armory", description: "Manage premium digital products.", requiresExecutive: true },
  { id: "email-tester", title: "Email Tester", description: "Send and verify template test emails.", requiresSuperAdmin: true },
  { id: "promo-codes", title: "Promo Codes", description: "Generate and manage access discounts.", requiresSuperAdmin: true },
]

export default function AdminMoreSettings() {
  const { profile } = useAuth()
  const isSuperAdmin = profile?.role === 'super_admin'
  const isExecutive = ['super_admin', 'director'].includes(profile?.role || '')
  
  const [activeSection, setActiveSection] = useState("assignments")
  const [searchQuery, setSearchQuery] = useState("")

  const visibleSections = SETTINGS_SECTIONS.filter(sec => {
    if (sec.requiresSuperAdmin && !isSuperAdmin) return false
    if (sec.requiresExecutive && !isExecutive) return false
    if (searchQuery) {
      return sec.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
             sec.description.toLowerCase().includes(searchQuery.toLowerCase())
    }
    return true
  })

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-background transition-colors w-full">
      
      {/* ─── LEFT COLUMN: SETTINGS NAV ─── */}
      <div className="w-1/3 min-w-[320px] max-w-[400px] border-r border-muted bg-muted/5 flex flex-col transition-colors">
        <div className="p-8 border-b border-muted transition-colors">
          <h2 className="text-2xl font-black tracking-tighter text-foreground mb-6">More Settings</h2>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Search Settings"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-background border border-muted rounded-full text-sm font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1">
          {visibleSections.map(sec => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all text-left ${
                activeSection === sec.id 
                  ? 'bg-muted border-l-4 border-yellow-400 text-foreground'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              <div>
                <p className="font-black tracking-tight text-sm">{sec.title}</p>
                <p className={`text-[10px] font-medium mt-1 truncate max-w-[200px] ${activeSection === sec.id ? 'opacity-70' : 'opacity-40'}`}>
                   {sec.description}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 opacity-50" />
            </button>
          ))}
        </div>
      </div>

      {/* ─── RIGHT COLUMN: SETTINGS CONTENT ─── */}
      <div className="flex-1 bg-background overflow-y-auto custom-scrollbar relative">
        <div className="min-h-full">
           {activeSection === "assignments" && <div className="p-8"><AssignmentManagementPanel /></div>}
           {activeSection === "communications" && <div className="p-8"><ChatMonitoring currentUser={profile as any} /></div>}
           {activeSection === "armory" && <div className="p-8"><ProductManager /></div>}
           {activeSection === "email-tester" && <div className="p-8"><EmailTester /></div>}
           {activeSection === "promo-codes" && <div className="p-8"><PromoCodeManager /></div>}
        </div>
      </div>

    </div>
  )
}

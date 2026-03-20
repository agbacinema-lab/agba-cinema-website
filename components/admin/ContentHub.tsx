"use client"

import { useState } from "react"
import { FileText, Calendar, MonitorPlay, Image as ImageIcon, Clock, Clipboard, MailOpen } from "lucide-react"
import BlogManager from "./BlogManager"
import EventManager from "./EventManager"
import AcademyManager from "./AcademyManager"
import PortfolioManager from "./PortfolioManager"
import UrgencyManager from "./UrgencyManager"
import BlueprintManager from "./BlueprintManager"
import LeadDispatcher from "./LeadDispatcher"
import { motion } from "framer-motion"

const TABS = [
  { id: "blog", label: "Blog Posts", icon: FileText, color: "from-orange-400 to-yellow-400" },
  { id: "events", label: "Events", icon: Calendar, color: "from-blue-500 to-cyan-400" },
  { id: "academy", label: "Academy Services", icon: MonitorPlay, color: "from-purple-500 to-pink-400" },
  { id: "portfolio", label: "Portfolio", icon: ImageIcon, color: "from-green-500 to-emerald-400" },
  { id: "urgency", label: "Urgency Signals", icon: Clock, color: "from-red-500 to-orange-400" },
  { id: "blueprint", label: "Program Blueprint", icon: Clipboard, color: "from-indigo-500 to-violet-400" },
  { id: "leads", label: "Lead Dispatcher", icon: MailOpen, color: "from-pink-500 to-rose-400" },
]

export default function ContentHub() {
  const [activeSection, setActiveSection] = useState("blog")
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-left">
        <h2 className="text-3xl font-black mb-1 tracking-tighter text-foreground">Content hub</h2>
        <p className="text-muted-foreground font-black text-[10px] tracking-widest uppercase opacity-60">Manage all public-facing content from one place</p>
      </div>

      {/* Sub-tab bar */}
      <div className="bg-card rounded-[2.5rem] p-4 shadow-premium border border-muted/30 flex gap-6 flex-wrap items-center justify-center">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeSection === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center gap-4 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all min-w-[140px] ${isActive
                  ? `bg-foreground text-background shadow-xl scale-105 z-10`
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Panel content */}
      <motion.div
        key={`${activeSection}-${refreshKey}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
      >
        {activeSection === "blog" && <BlogManager />}
        {activeSection === "events" && <EventManager />}
        {activeSection === "academy" && <AcademyManager />}
        {activeSection === "portfolio" && <PortfolioManager />}
        {activeSection === "urgency" && <UrgencyManager />}
        {activeSection === "blueprint" && <BlueprintManager />}
        {activeSection === "leads" && <LeadDispatcher />}
      </motion.div>
    </div>
  )
}

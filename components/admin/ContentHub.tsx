"use client"

import { useState } from "react"
import { FileText, Calendar, MonitorPlay, Image as ImageIcon } from "lucide-react"
import BlogManager from "./BlogManager"
import EventManager from "./EventManager"
import AcademyManager from "./AcademyManager"
import PortfolioManager from "./PortfolioManager"
import { motion } from "framer-motion"
import { eventService, academyService } from "@/lib/services"

const TABS = [
  { id: "blog",     label: "Blog Posts",       icon: FileText,    color: "from-orange-400 to-yellow-400" },
  { id: "events",   label: "Events",            icon: Calendar,    color: "from-blue-500 to-cyan-400" },
  { id: "academy",  label: "Academy Services",  icon: MonitorPlay, color: "from-purple-500 to-pink-400" },
  { id: "portfolio",label: "Portfolio",          icon: ImageIcon,   color: "from-green-500 to-emerald-400" },
]

export default function ContentHub() {
  const [activeSection, setActiveSection] = useState("blog")
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-black mb-1">Content Hub</h2>
          <p className="text-gray-500 font-medium">Manage all public-facing content from one place</p>
        </div>
      </div>

      {/* Sub-tab bar */}
      <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 flex gap-2 flex-wrap">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeSection === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all flex-1 justify-center min-w-[120px] ${
                isActive
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-md`
                  : "text-gray-500 hover:bg-gray-50"
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
        {activeSection === "blog"      && <BlogManager />}
        {activeSection === "events"    && <EventManager />}
        {activeSection === "academy"   && <AcademyManager />}
        {activeSection === "portfolio" && <PortfolioManager />}
      </motion.div>
    </div>
  )
}

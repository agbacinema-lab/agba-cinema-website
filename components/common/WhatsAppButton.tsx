'use client'

import React, { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(true)
  const pathname = usePathname()

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/student') || pathname?.startsWith('/brand') || pathname?.startsWith('/login')) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Tooltip bubble */}
      {showTooltip && (
        <div className="relative bg-white border border-gray-100 text-gray-900 text-sm font-medium px-4 py-2.5 rounded-2xl shadow-xl max-w-[200px] text-center animate-bounce-slow">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute -top-2 -right-2 bg-gray-200 hover:bg-gray-300 rounded-full w-5 h-5 flex items-center justify-center"
            aria-label="Dismiss"
          >
            <X size={11} />
          </button>
          💬 Chat with us on WhatsApp!
          {/* Arrow */}
          <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-r border-b border-gray-100 rotate-45" />
        </div>
      )}

      {/* Main button */}
      <a
        href="https://wa.me/2349065230464"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with ÀGBÀ CINEMA on WhatsApp"
        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-3.5 rounded-full shadow-2xl shadow-green-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-green-500/50 group"
      >
        <MessageCircle size={24} className="flex-shrink-0 group-hover:scale-110 transition-transform" />
        <span className="hidden md:inline font-bold text-sm whitespace-nowrap">Chat with ÀGBÀ CINEMA</span>
      </a>
    </div>
  )
}

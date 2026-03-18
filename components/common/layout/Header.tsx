"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X, User, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { motion, AnimatePresence } from "framer-motion"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user } = useAuth()
  const pathname = usePathname()

  const navigation = [
    { name: "Academy", href: "/academy" },
    { name: "Work Bank", href: "/portfolio" },
    { name: "Talent Board", href: "/talent" },
    { name: "Events", href: "/events" },
    { name: "Blog", href: "/blog" },
    { name: "About", href: "/about" },
    { name: "AI Tool", href: "/tools/video-caption" },
  ]

  return (
    <header className="bg-white/95 backdrop-blur-xl sticky top-0 z-[9999] border-b border-gray-100 pointer-events-auto">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-[9999]">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center group relative">
            <div className="absolute -inset-2 bg-yellow-400/0 group-hover:bg-yellow-400/5 rounded-xl transition-all duration-500" />
            <Image
              src="/agba  white.jpg"
              alt="ÀGBÀ CINEMA Logo"
              width={140}
              height={45}
              className="relative transition-transform duration-500 group-hover:scale-[1.02]"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="relative px-4 py-2 group"
                >
                  <span className={`relative z-10 text-[10px] font-black uppercase italic tracking-widest transition-colors duration-300 ${
                    isActive ? "text-black" : "text-gray-400 group-hover:text-black"
                  }`}>
                    {item.name}
                  </span>
                  {isActive && (
                    <motion.div 
                      key="headerNav"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute bottom-1 left-4 right-4 h-0.5 bg-yellow-400 rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              )
            })}

            <div className="h-4 w-px bg-gray-100 mx-4" />

            {user ? (
              <Button asChild className="bg-black hover:bg-yellow-400 hover:text-black text-white font-black uppercase italic tracking-tighter h-11 px-6 rounded-xl text-xs transition-all duration-500 shadow-premium">
                <Link href="/admin" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            ) : (
              <div className="flex items-center gap-6">
                <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">Log In</Link>
                <Button asChild className="relative group overflow-hidden bg-black text-white hover:bg-black font-black uppercase italic tracking-tighter h-11 px-6 rounded-xl text-xs transition-all shadow-xl shadow-yellow-400/5 border border-white/10">
                  <Link href="/register" className="flex items-center gap-2 relative z-10 transition-colors group-hover:text-yellow-400">
                    <Zap className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    Join Academy
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-black hover:bg-gray-50 rounded-xl transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden border-t border-gray-100"
            >
              <div className="py-8 space-y-4 px-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-4 py-3 text-sm font-black uppercase italic tracking-widest text-gray-400 hover:text-yellow-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="pt-6 border-t border-gray-50 space-y-4 px-4">
                  {user ? (
                    <Button asChild className="w-full bg-black text-white font-black uppercase italic h-14 rounded-2xl">
                      <Link href="/admin" onClick={() => setIsMenuOpen(false)}>My Dashboard</Link>
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" asChild className="w-full font-black uppercase italic h-14 rounded-2xl border-2 border-gray-100">
                        <Link href="/login" onClick={() => setIsMenuOpen(false)}>Log In</Link>
                      </Button>
                      <Button asChild className="w-full bg-yellow-400 text-black font-black uppercase italic h-14 rounded-2xl shadow-xl shadow-yellow-400/20">
                        <Link href="/register" onClick={() => setIsMenuOpen(false)}>Join Academy</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}

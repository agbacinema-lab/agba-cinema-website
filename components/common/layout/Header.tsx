"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, profile } = useAuth()

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
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-[9999] border-b border-gray-100 pointer-events-auto">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-[9999]">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Image
              src="/agba  white.jpg"
              alt="ÀGBÀ CINEMA Logo"
              width={140}
              height={45}
              className="group-hover:opacity-80 transition-opacity"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-black font-semibold transition-colors duration-200 text-sm tracking-tight"
              >
                {item.name}
              </Link>
            ))}

            <div className="h-4 w-px bg-gray-200 mx-2" />

            {user ? (
              <Button asChild className="bg-black hover:bg-gray-800 text-white font-bold h-11 px-6 rounded-xl text-sm">
                <Link href="/admin" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  My Dashboard
                </Link>
              </Button>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-bold text-gray-900 hover:text-yellow-600 transition-colors">Log In</Link>
                <Button asChild className="bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold h-11 px-6 rounded-xl text-sm border-0 shadow-lg shadow-yellow-400/20">
                  <Link href="/register">Join Academy</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-6 space-y-1 sm:px-3 bg-white border-t">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-3 text-gray-700 font-bold hover:text-yellow-600 transition-colors duration-200 border-b border-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-6 px-3 space-y-3">
                {user ? (
                  <Button asChild className="w-full bg-black text-white font-bold h-12 rounded-xl">
                    <Link href="/admin" onClick={() => setIsMenuOpen(false)}>My Dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" asChild className="w-full font-bold h-12 rounded-xl border-gray-200">
                      <Link href="/login" onClick={() => setIsMenuOpen(false)}>Log In</Link>
                    </Button>
                    <Button asChild className="w-full bg-yellow-400 text-black font-extrabold h-12 rounded-xl">
                      <Link href="/register" onClick={() => setIsMenuOpen(false)}>Join Academy</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

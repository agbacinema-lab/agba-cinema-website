"use client"

import { useState } from "react"
import Image from "next/image"
import { Menu, X, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"


export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Programs", href: "/academy" },
    { name: "Student Work", href: "/portfolio" },
    { name: "Hire Editors", href: "/services" },
    { name: "Blog", href: "/blog" },
    { name: "Events", href: "/events" },
    { name: "About", href: "/about" },
  ]

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <Image
              src="/agba  white.jpg"
              alt="ÀGBÀ CINEMA Logo"
              width={150}
              height={50}
              priority
            />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <a
              href="/"
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 text-sm"
            >
              Home
            </a>
            {navigation.slice(1).map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 text-sm"
              >
                {item.name}
              </a>
            ))}
            <Button asChild className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold border-0">
              <a href="/apply">Apply Now</a>
            </Button>
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
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-gray-700 hover:text-primary transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="px-3 py-2">
                <Button asChild className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold border-0">
                  <a href="/apply" onClick={() => setIsMenuOpen(false)}>Apply Now</a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

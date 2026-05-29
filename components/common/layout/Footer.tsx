"use client"

import { usePathname } from "next/navigation"
import Image from "next/image"
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin } from "lucide-react"

export default function Footer() {
  const pathname = usePathname()

  if (pathname?.startsWith('/student') || pathname?.startsWith('/admin') || pathname?.startsWith('/brand')) {
    return null
  }

  return (
    <footer className="bg-black text-white border-t border-[#FFD700]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <a href="/" className="inline-block mb-4">
              <Image 
                src="/white long logo.png" 
                alt="ÀGBÀ CINEMA Logo" 
                width={240}
                height={80}
                priority
              />
            </a>
            <p className="text-gray-300 mb-6 max-w-md">
              Professional video production services for brands, events, and storytelling. Creating cinematic
              experiences that captivate and inspire.
            </p>
            <div className="flex space-x-4">
              <a href="https://web.facebook.com/profile.php?id=61561591466125" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-[#FFD700] transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/agbacinema/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-[#FFD700] transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://x.com/AgbaCinema" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-[#FFD700] transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/company/agbacinema/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-[#FFD700] transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://www.tiktok.com/@agbacinema" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-[#FFD700] transition-colors">
                <Image
                  src="/tiktok-svgrepo-com.svg"
                  alt="TikTok"
                  width={20}
                  height={20}
                  className="h-5 w-5 filter invert brightness-[200%]"
                  unoptimized
                />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/services" className="text-gray-300 hover:text-[#FFD700] transition-colors">
                  Services
                </a>
              </li>
              <li>
                <a href="/portfolio" className="text-gray-300 hover:text-[#FFD700] transition-colors">
                  Portfolio
                </a>
              </li>
              <li>
                <a href="/blog" className="text-gray-300 hover:text-[#FFD700] transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="/events" className="text-gray-300 hover:text-[#FFD700] transition-colors">
                  Events
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-300 hover:text-[#FFD700] transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-300 hover:text-[#FFD700] transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="/admin" className="text-gray-300/50 hover:text-[#FFD700] transition-colors text-xs">
                  Admin Dashboard
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-[#FFD700]" />
                <span className="text-gray-300">agbacinema@gmail.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-[#FFD700]" />
                <span className="text-gray-300">+234 9065230464</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-[#FFD700]" />
                <span className="text-gray-300">Nigeria</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-900 mt-8 pt-8 text-center">
          <p className="text-gray-300">© {new Date().getFullYear()} ÀGBÀ CINEMA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

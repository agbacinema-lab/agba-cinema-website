import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/common/layout/Header"
import Footer from "@/components/common/layout/Footer"
import WhatsAppButton from "@/components/common/WhatsAppButton"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ÀGBÀ CINEMA - Video Production Company & Video Editing Training Nigeria",
  description: "Premium video production, cinematography, event coverage, and professional video editing training & mentorship in Lagos, Nigeria. Learn video editing in Lagos with the Go Pro Program.",
  keywords: [
    "Video editing training Nigeria",
    "Learn video editing Lagos",
    "Video production company Nigeria",
    "Video editing mentorship",
    "Go Pro Program Nigeria",
    "Motion design training Lagos",
    "Cinematography Nigeria",
    "Creative storytelling",
    "Video internship Nigeria",
  ],
  generator: 'v0.dev',
  metadataBase: new URL("https://agba-cinema-website.vercel.app/"),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        {children}
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  )
}

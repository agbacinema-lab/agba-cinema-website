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
  description:
    "Nigeria's #1 video editing mentorship. Learn Premiere Pro & After Effects, work on real brand projects, and get internship placement in Lagos. Go Pro Program now enrolling.",
  keywords: [
    "Video editing training Nigeria",
    "Learn video editing Lagos",
    "Video production company Nigeria",
    "Video editing mentorship",
    "Go Pro Program Nigeria",
    "Motion design training Lagos",
    "Premiere Pro course Nigeria",
    "Video internship Nigeria",
    "After Effects training Lagos",
    "Cinematography Nigeria",
  ],
  generator: "v0.dev",
  metadataBase: new URL("https://agba-cinema-website.vercel.app/"),
  openGraph: {
    title: "ÀGBÀ CINEMA — Become a Professional Video Editor in 8 Weeks",
    description:
      "Structured mentorship + real brand projects + internship placement. Nigeria's most trusted video editing training.",
    url: "https://agba-cinema-website.vercel.app/",
    siteName: "ÀGBÀ CINEMA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ÀGBÀ CINEMA — Video Editing Training Nigeria",
    description: "Go from beginner to professional video editor in 8 weeks. Real projects. Real brands. Internship placement.",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-L2G73GNY3D"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-L2G73GNY3D');
            `,
          }}
        />

        {/* Facebook Pixel */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1091599552194519');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1091599552194519&ev=PageView&noscript=1"
          />
        </noscript>
      </head>
      <body className={inter.className}>
        <Header />
        <div className="relative min-h-screen">
          {children}
        </div>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  )
}

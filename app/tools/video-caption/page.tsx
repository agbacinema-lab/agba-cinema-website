"use client"

import dynamic from "next/dynamic"
import PageHero from "@/components/common/layout/PageHero"

const VideoCaptionTool = dynamic(() => import("@/components/tools/VideoCaptionTool"), {
  ssr: false,
  loading: () => <div className="h-96 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
  </div>
})

export default function VideoCaptionPage() {
  return (
    <div className="min-h-screen bg-white">
      <PageHero 
        title="Free AI Video Caption Tool"
        subtitle="Automatic captions and audio cleaning, powered by ÀGBÀ CINEMA AI. Runs entirely in your browser for 100% privacy."
        backgroundImage="/event-videography-coverage.png"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <VideoCaptionTool />
      </div>

      <section className="bg-black text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">Privacy First</h2>
          <p className="text-gray-400 text-lg mb-8">
            Your videos are processed locally on your computer. We never see your content, and it never leaves your browser.
          </p>
          <div className="text-yellow-400 font-black text-xl italic uppercase tracking-widest">
            Powered by ÀGBÀ CINEMA
          </div>
        </div>
      </section>
    </div>
  )
}

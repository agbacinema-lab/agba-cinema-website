"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { X, BookOpen, ChevronRight } from "lucide-react"

interface PDFViewerProps {
  fileUrl: string
  fileName: string
  onClose: () => void
  /** Optional: used to key the saved progress per material */
  materialId?: string
  /** Optional: used to key the saved progress per student */
  userId?: string
}

// ── Storage helpers ─────────────────────────────────────────────────────────
function storageKey(fileUrl: string, materialId?: string, userId?: string) {
  const id = materialId || btoa(fileUrl).slice(0, 20)
  return `pdf_progress_${userId || "guest"}_${id}`
}

interface Progress {
  page: number
  savedAt: number // timestamp
}

function loadProgress(key: string): Progress | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveProgress(key: string, page: number) {
  try {
    localStorage.setItem(key, JSON.stringify({ page, savedAt: Date.now() }))
  } catch {}
}

// ── URL builder ──────────────────────────────────────────────────────────────
function buildPreviewUrl(url: string, page?: number): string {
  const pageFragment = page && page > 1 ? `#page=${page}` : ""

  // Google Docs / Sheets / Slides → /preview
  const docsMatch = url.match(
    /docs\.google\.com\/(document|spreadsheets|presentation)\/d\/([a-zA-Z0-9_-]+)/
  )
  if (docsMatch) {
    return `https://docs.google.com/${docsMatch[1]}/d/${docsMatch[2]}/preview${pageFragment}`
  }

  // Google Drive file → /preview
  const driveFileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (driveFileMatch) {
    return `https://drive.google.com/file/d/${driveFileMatch[1]}/preview${pageFragment}`
  }

  // drive.google.com?id= / uc?id=
  const driveIdMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (driveIdMatch) {
    return `https://drive.google.com/file/d/${driveIdMatch[1]}/preview${pageFragment}`
  }

  // Fallback – Google Docs Viewer
  return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`
}

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000)
  if (diff < 60) return "just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// ── Component ────────────────────────────────────────────────────────────────
export default function PDFViewer({
  fileUrl,
  fileName,
  onClose,
  materialId,
  userId,
}: PDFViewerProps) {
  const key = storageKey(fileUrl, materialId, userId)
  const saved = loadProgress(key)

  const [activePage, setActivePage] = useState<number>(saved?.page ?? 1)
  const [pageInput, setPageInput] = useState<string>(String(saved?.page ?? 1))
  const [showContinueBanner, setShowContinueBanner] = useState(!!saved && (saved.page > 1))
  const [resumed, setResumed] = useState(false)

  // The URL used by the iframe — only updated when student confirms a page jump
  const [iframeSrc, setIframeSrc] = useState<string>(
    buildPreviewUrl(fileUrl, resumed ? activePage : undefined)
  )

  const handleContinue = () => {
    const newSrc = buildPreviewUrl(fileUrl, activePage)
    setIframeSrc(newSrc)
    setShowContinueBanner(false)
    setResumed(true)
  }

  const handleStartFresh = () => {
    setActivePage(1)
    setPageInput("1")
    setIframeSrc(buildPreviewUrl(fileUrl))
    setShowContinueBanner(false)
  }

  const handleMarkPage = () => {
    const p = parseInt(pageInput, 10)
    if (!isNaN(p) && p >= 1) {
      setActivePage(p)
      saveProgress(key, p)
      // Flash confirmation
      const btn = document.getElementById("mark-page-btn")
      if (btn) {
        btn.textContent = "✓ Saved!"
        setTimeout(() => { if(btn) btn.textContent = "Mark Page" }, 2000)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-2 md:p-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[97vh] flex flex-col overflow-hidden border border-gray-200">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-gray-100 bg-gray-50 shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <BookOpen className="h-5 w-5 text-yellow-500 shrink-0" />
            <h3 className="font-black text-gray-900 truncate text-sm md:text-base uppercase tracking-tighter italic">
              {fileName}
            </h3>
          </div>

          {/* ── Mark My Page ── */}
          <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2 shrink-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              I'm on page
            </span>
            <input
              type="number"
              min={1}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              className="w-14 h-8 text-center rounded-lg border border-gray-200 text-sm font-black text-gray-900 bg-white outline-none focus:border-yellow-400 focus:ring-2 ring-yellow-400/20"
            />
            <button
              id="mark-page-btn"
              onClick={handleMarkPage}
              className="h-8 px-3 bg-yellow-400 hover:bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest rounded-lg transition-all active:scale-95"
            >
              Mark Page
            </button>
          </div>

          <button
            onClick={onClose}
            className="ml-2 shrink-0 h-9 px-4 rounded-xl flex items-center gap-2 font-black uppercase tracking-widest text-[10px] bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-100"
          >
            <X className="h-4 w-4" />
            Close
          </button>
        </div>

        {/* ── Continue Banner ── */}
        {showContinueBanner && saved && (
          <div className="flex items-center justify-between gap-4 px-6 py-4 bg-yellow-50 border-b border-yellow-200 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-yellow-400 rounded-xl flex items-center justify-center shrink-0">
                <BookOpen className="h-5 w-5 text-black" />
              </div>
              <div>
                <p className="font-black text-gray-900 text-sm uppercase tracking-tighter italic">
                  You left off at <span className="text-yellow-600">page {saved.page}</span>
                </p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                  Last read {timeAgo(saved.savedAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleStartFresh}
                className="h-9 px-4 rounded-xl border border-gray-300 text-gray-600 text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all"
              >
                Start Over
              </button>
              <button
                onClick={handleContinue}
                className="h-9 px-5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-yellow-400/20"
              >
                Continue <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ── Mobile Mark Page ── */}
        <div className="flex md:hidden items-center gap-2 bg-gray-50 border-b border-gray-100 px-4 py-2 shrink-0">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Page:</span>
          <input
            type="number"
            min={1}
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            className="w-16 h-7 text-center rounded-lg border border-gray-200 text-sm font-black text-gray-900 bg-white outline-none focus:border-yellow-400"
          />
          <button
            onClick={handleMarkPage}
            className="h-7 px-3 bg-yellow-400 text-black text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
          >
            Mark
          </button>
          {activePage > 1 && (
            <span className="text-[10px] text-green-600 font-bold ml-auto">
              ✓ Saved at p.{activePage}
            </span>
          )}
        </div>

        {/* ── Document iframe ── */}
        <div className="flex-grow relative overflow-hidden bg-gray-900">
          <iframe
            key={iframeSrc}
            src={iframeSrc}
            className="w-full h-full border-0 absolute inset-0"
            title={fileName}
            sandbox="allow-scripts allow-same-origin"
            allow="autoplay"
          />
          {/* Overlay to hide Google's top-right download icon */}
          <div className="absolute top-0 right-0 w-20 h-12 z-10 bg-gray-900" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react"

interface PDFViewerProps {
  fileUrl: string
  fileName: string
  onClose: () => void
}

export default function PDFViewer({ fileUrl, fileName, onClose }: PDFViewerProps) {
  const [scale, setScale] = useState(100)
  const [pageNumber, setPageNumber] = useState(1)

  const handleZoomIn = () => setScale(prev => Math.min(prev + 10, 200))
  const handleZoomOut = () => setScale(prev => Math.max(prev - 10, 50))

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Card className="bg-white rounded-2xl shadow-premium w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div className="flex-grow">
            <h3 className="font-black text-gray-900 truncate">{fileName}</h3>
            <p className="text-xs text-gray-500 mt-1">📄 Read-Only PDF Viewer - Download Not Available</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleZoomOut}
              className="rounded-lg"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-bold text-gray-600 min-w-12 text-center">{scale}%</span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleZoomIn}
              className="rounded-lg"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="rounded-lg ml-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* PDF Viewer */}
        <CardContent className="flex-grow overflow-auto bg-gray-900 p-6">
          <div className="flex justify-center">
            <embed
              src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              type="application/pdf"
              width="100%"
              height="600"
              style={{ transform: `scale(${scale / 100})`, transformOrigin: 'top center' }}
              className="rounded-lg"
            />
          </div>
        </CardContent>

        {/* Footer */}
        <div className="bg-gray-50 border-t p-4 flex justify-between items-center">
          <p className="text-xs text-gray-500">
            💡 Tip: Use zoom controls to adjust view. This document is for reading only.
          </p>
          <Button
            onClick={onClose}
            className="bg-yellow-400 text-black font-bold rounded-lg"
          >
            Close Viewer
          </Button>
        </div>
      </Card>
    </div>
  )
}

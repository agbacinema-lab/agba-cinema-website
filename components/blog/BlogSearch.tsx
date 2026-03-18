"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function BlogSearch() {
  return (
    <div className="relative group w-full max-w-sm">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 h-4 w-4 group-focus-within:text-yellow-500 transition-colors" />
      <Input 
        type="text" 
        placeholder="Search Archives..." 
        className="pl-12 h-14 bg-transparent border-none focus-visible:ring-0 text-sm font-black uppercase italic tracking-widest placeholder:text-gray-200" 
      />
      <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gray-100 group-focus-within:bg-yellow-400 transition-all origin-left" />
    </div>
  )
}

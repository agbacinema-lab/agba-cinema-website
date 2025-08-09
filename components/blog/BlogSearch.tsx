"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function BlogSearch() {
  return (
    <div className="relative mb-12">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      <Input type="text" placeholder="Search blog posts..." className="pl-10 py-3 text-lg" />
    </div>
  )
}

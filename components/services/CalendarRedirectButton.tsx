"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"

export default function CalendarRedirectButton() {
  const handleScheduleCall = () => {
    const schedulingLink = process.env.NEXT_PUBLIC_SCHEDULING_LINK
    if (schedulingLink) {
      window.open(schedulingLink, "_blank")
    } else {
      console.error("Scheduling link not configured")
    }
  }

  return (
    <Button onClick={handleScheduleCall} variant="outline" size="lg" className="w-full bg-transparent">
      <Calendar className="mr-2 h-5 w-5" />
      Schedule a Call
    </Button>
  )
}

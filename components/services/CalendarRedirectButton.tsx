"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"

export default function CalendarRedirectButton() {
  const handleScheduleCall = () => {
    const schedulingLink = "https://calendar.app.google/zGqyBvfWy844S8Tx9"
    window.open(schedulingLink, "_blank")
  }

  return (
    <Button
      onClick={handleScheduleCall}
      variant="outline"
      size="lg"
      className="w-full bg-transparent"
    >
      <Calendar className="mr-2 h-5 w-5" />
      Schedule a Call
    </Button>
  )
}

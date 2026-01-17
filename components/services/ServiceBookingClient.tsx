"use client"

import React from "react"
import BookingForm from "@/components/services/BookingForm"
import PaymentButtons from "@/components/services/PaymentButtons"

type Props = {
  service: string
}

export default function ServiceBookingClient({ service }: Props) {
  // simple price map — adjust to your data or compute from services list
  const priceMap: Record<string, number> = {
    "corporate-videos": 100000,
    "script-writing": 50000,
    "live-event": 100000,
    "content-startegist": 100000,
    "video-editing": 70000,
    "aftereffect": 150000,
    "post-production": 200000,
  }

  const amount = priceMap[service.toLowerCase()] ?? 50000
  const email = "no-reply@agbacinema.com" // replace with real user email if you wire it up later

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Booking form (request quote) */}
      <BookingForm service={service} />

      {/* Centered payment buttons (narrow group) */}
      <div className="flex justify-center">
        <div className="w-fit">
          <PaymentButtons amount={amount} email={email} service={service} />
        </div>
      </div>

      {/* explicit vertical gap between payments and schedule */}
      <div className="h-8" />

      {/* Schedule a call below payments */}
      <div className="text-center">
        <h3 className="text-xl font-semibold">Schedule a Call</h3>
        <p className="text-sm text-gray-600 max-w-prose mx-auto mt-2">
          After completing payment, schedule a call with our team to finalize project details.
        </p>
        <div className="mt-4 flex justify-center">
          <a
            href="/schedule"
            className="px-4 py-2 bg-primary text-white rounded hover:opacity-90 inline-block"
          >
            Schedule a Call
          </a>
        </div>
      </div>
    </div>
  )
}
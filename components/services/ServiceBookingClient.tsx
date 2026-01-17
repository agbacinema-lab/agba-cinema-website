"use client"

import React from "react"
import BookingForm from "@/components/services/BookingForm"
import PaymentButtons from "@/components/services/PaymentButtons"

type Props = { service: string }

export default function ServiceBookingClient({ service }: Props) {
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
  const email = "" // will use form email later if you wire it up

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      {/* Booking form */}
      <BookingForm service={service} />

      {/* Centered payments — keep container width to avoid full-width buttons */}
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <PaymentButtons amount={amount} email={email || "no-reply@agbacinema.com"} service={service} />
        </div>
      </div>

      {/* clear gap so schedule button sits visually below payments */}
      <div className="mt-6" />

      {/* Schedule a Call — distinct and below payments */}
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Schedule a Call</h3>
        <p className="text-sm text-gray-600 max-w-prose mx-auto mb-4">
          After payment, schedule a call to finalize project details.
        </p>
        <div className="mt-4 flex justify-center">
          <a
            href="/schedule"
            className="inline-block px-6 py-2 bg-gray-800 text-white rounded shadow-sm hover:bg-gray-900"
            role="button"
          >
            Schedule a Call
          </a>
        </div>
      </div>
    </div>
  )
}
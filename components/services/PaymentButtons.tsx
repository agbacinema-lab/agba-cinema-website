"use client"

import React, { useState } from "react"

type Props = {
  amount: number
  email: string
  service?: string
}

export default function PaymentButtons({ amount, email, service }: Props) {
  const [paystackLoading, setPaystackLoading] = useState(false)


  const handlePaystack = async () => {
    try {
      setPaystackLoading(true)
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, email, service }),
      })
      const data = await res.json()
      if (res.ok && data.authorization_url) {
        window.location.href = data.authorization_url
      } else {
        alert(data.message || "Failed to initialize Paystack payment")
      }
    } catch (err) {
      console.error(err)
      alert("Error initializing Paystack payment")
    } finally {
      setPaystackLoading(false)
    }
  }

  return (
    <div className="flex justify-center">
      <div className="flex gap-4 items-center">
        <button
          type="button"
          onClick={handlePaystack}
          className="inline-block min-w-[220px] px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
          disabled={paystackLoading}
        >
          {paystackLoading ? "Processing..." : "Pay with Card (Paystack)"}
        </button>

      </div>
    </div>
  )
}
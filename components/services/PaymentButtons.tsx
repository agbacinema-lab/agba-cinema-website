"use client"

import React, { useState } from "react"

type Props = {
  amount: number
  email: string
  service?: string
}

export default function PaymentButtons({ amount, email, service }: Props) {
  const [paystackLoading, setPaystackLoading] = useState(false)
  const [kudaLoading, setKudaLoading] = useState(false)

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

  const handleKuda = async () => {
    try {
      setKudaLoading(true)
      const res = await fetch("/api/kuda/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, email, service }),
      })
      const data = await res.json()
      if (res.ok) {
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl
          return
        }
        alert(
          `Transfer ${amount} NGN to:\nBank: ${data.bankName}\nAccount: ${data.accountNumber}\nName: ${data.accountName}\nReference: ${data.reference}`
        )
      } else {
        alert(data.message || "Kuda payment not available")
      }
    } catch (err) {
      console.error(err)
      alert("Error initiating Kuda payment")
    } finally {
      setKudaLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center mt-6">
      <div className="flex gap-4">
        <button
          type="button"
          onClick={handlePaystack}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
          disabled={paystackLoading}
        >
          {paystackLoading ? "Processing..." : "Pay with Card (Paystack)"}
        </button>

        <button
          type="button"
          onClick={handleKuda}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
          disabled={kudaLoading}
        >
          {kudaLoading ? "Processing..." : "Pay via Kuda / Bank Transfer"}
        </button>
      </div>
    </div>
  )
}
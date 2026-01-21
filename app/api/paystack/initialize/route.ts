import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { amount, email, service, fullName, phone } = await request.json()
    if (!amount || !email) {
      return NextResponse.json({ message: "Missing amount or email" }, { status: 400 })
    }

    const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY
    if (!PAYSTACK_SECRET) {
      return NextResponse.json({ message: "Paystack secret not configured" }, { status: 500 })
    }

    const body = {
      email,
      amount: Math.round(Number(amount) * 100), // kobo
      metadata: { service, fullName, phone },
      callback_url: process.env.PAYSTACK_CALLBACK_URL || `${request.headers.get("origin") || "http://localhost:3000"}/payment/success`,
    }

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    if (!res.ok) {
      console.error("Paystack init error", data)
      return NextResponse.json({ message: data.message || "Paystack init failed" }, { status: res.status })
    }

    return NextResponse.json({ authorization_url: data.data.authorization_url, reference: data.data.reference })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
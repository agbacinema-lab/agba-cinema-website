import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { reference: string } }) {
  const reference = params.reference
  const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY
  if (!PAYSTACK_SECRET) {
    return NextResponse.json({ message: "Paystack secret not configured" }, { status: 500 })
  }

  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
  })
  const data = await res.json()
  if (!res.ok) {
    return NextResponse.json({ message: data.message || "Verification failed" }, { status: res.status })
  }

  return NextResponse.json({ success: true, data: data.data })
}
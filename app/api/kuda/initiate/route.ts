import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { amount, email, service } = await request.json()

    // If you integrate with Kuda's API, call it here and return payment URL or virtual account details.
    // For now return bank details from env as fallback.
    const bankName = process.env.KUDA_BANK_NAME || "Kuda Bank"
    const accountNumber = process.env.KUDA_ACCOUNT_NUMBER || "0000000000"
    const accountName = process.env.KUDA_ACCOUNT_NAME || "ÀGBÀ CINEMA"
    const reference = `KUDA-${Date.now()}`

    return NextResponse.json({
      bankName,
      accountNumber,
      accountName,
      reference,
      message: "Use these bank details to make a transfer. Implement Kuda server-side integration for hosted payments.",
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
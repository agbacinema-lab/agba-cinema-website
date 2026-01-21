
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { reference: string } }) {
  const reference = params.reference
  const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY
  if (!PAYSTACK_SECRET) {
    return NextResponse.json({ message: "Paystack secret not configured" }, { status: 500 })
  }

  try {
    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    })
    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ message: data.message || "Verification failed" }, { status: res.status })
    }

    const tx = data.data

    // If payment successful, we might want to log it or save to sheet
    let sheetResult: boolean = false;

    if (tx.status === "success") {
      const toEmail = tx.customer?.email || ""
      const amountNGN = (tx.amount / 100).toLocaleString("en-NG", { style: "currency", currency: "NGN" })
      const service = tx.metadata?.service || "Your booking"
      const fullName = tx.metadata?.fullName || "Valued Customer"

      // Append to Google Sheet
      try {
        const { appendBookingToSheet } = await import("@/lib/googleSheets");
        sheetResult = await appendBookingToSheet({
          reference: tx.reference,
          fullName: fullName,
          email: toEmail,
          phone: tx.metadata?.phone || "",
          service: service,
          amount: amountNGN,
          date: new Date().toISOString(),
          category: tx.metadata?.category || "general",
          status: tx.status
        });
      } catch (sheetError) {
        console.error("Failed to append to sheet", sheetError);
      }
    }

    return NextResponse.json({ success: true, data: tx, sheetResult })
  } catch (error) {
    return NextResponse.json({ message: "An unexpected error occurred" }, { status: 500 })
  }
}
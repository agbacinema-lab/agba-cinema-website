import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY || "")

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

    // If payment successful, send receipt email
    let emailResult: any = null
    try {
      if (tx.status === "success" && tx.customer && tx.customer.email) {
        const toEmail = tx.customer.email
        const amountNGN = (tx.amount / 100).toLocaleString("en-NG", { style: "currency", currency: "NGN" })
        const service = tx.metadata?.service || "Your booking"
        const html = `
          <div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#111;">
            <h1 style="color:#0f766e;">Congratulations!</h1>
            <p>We have received your payment for <strong>${service}</strong>.</p>
            <p><strong>Reference:</strong> ${tx.reference}</p>
            <p><strong>Amount:</strong> ${amountNGN}</p>
            <p>Thank you for choosing our service!</p>
          </div>
        `
        emailResult = await resend.emails.send({
          from: "no-reply@yourdomain.com",
          to: toEmail,
          subject: "Payment Receipt",
          html,
        })
      }
    } catch (emailError) {
      console.error("Error sending email:", emailError)
    }

    return NextResponse.json({ success: true, data: tx, emailResult })
  } catch (error) {
    return NextResponse.json({ message: "An unexpected error occurred" }, { status: 500 })
  }
}
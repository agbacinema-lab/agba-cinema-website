import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY || "re_123")

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
    let sheetResult: boolean = false;

    try {
      if (tx.status === "success" && tx.customer && tx.customer.email) {
        const toEmail = tx.customer.email
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

        const html = `
          <div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#111; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h1 style="color:#0f766e; margin-bottom: 24px;">Payment Successful!</h1>
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 16px;">Hello <strong>${fullName}</strong>,</p>
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 16px;">We have received your payment for <strong>${service}</strong>.</p>
            
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
              <p style="margin: 0 0 8px;"><strong>Reference:</strong> ${tx.reference}</p>
              <p style="margin: 0;"><strong>Amount:</strong> ${amountNGN}</p>
            </div>

            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 16px;">We will contact you shortly via <strong>${tx.metadata?.phone || "phone"}</strong> or email to proceed with your booking.</p>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 32px;">Thank you for choosing Agba Cinema!</p>
          </div>
        `
        emailResult = await resend.emails.send({
          from: "Agba Cinema <onboarding@resend.dev>", // Update this to your verified domain in production
          to: toEmail,
          subject: `Payment Receipt for ${service}`,
          html,
        })
      }
    } catch (emailError) {
      console.error("Error sending email:", emailError)
    }

    return NextResponse.json({ success: true, data: tx, emailResult, sheetResult })
  } catch (error) {
    return NextResponse.json({ message: "An unexpected error occurred" }, { status: 500 })
  }
}
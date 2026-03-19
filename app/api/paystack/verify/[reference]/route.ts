import { NextRequest, NextResponse } from "next/server"
import { adminService } from "@/lib/services"
import sgMail from "@sendgrid/mail"

export async function GET(request: NextRequest, { params }: { params: { reference: string } }) {
  const reference = params.reference
  const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
  const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "agbacinema@gmail.com"

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
    let emailSent: boolean = false;

    if (tx.status === "success") {
      const toEmail = tx.customer?.email || ""
      const amountNGN = (tx.amount / 100).toLocaleString("en-NG", { style: "currency", currency: "NGN" })
      const service = tx.metadata?.service || "Your booking"
      const fullName = tx.metadata?.fullName || "Valued Customer"

      // 1. Send Email via SendGrid
      if (SENDGRID_API_KEY) {
        sgMail.setApiKey(SENDGRID_API_KEY)
        try {
          const html = `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
              <div style="background-color: #000; color: #fbbf24; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-style: italic; letter-spacing: -1px; text-transform: uppercase;">ÀGBÀ CINEMA</h1>
              </div>
              <div style="padding: 30px;">
                <h2 style="color: #000; border-bottom: 2px solid #fbbf24; padding-bottom: 10px; text-transform: uppercase;">Payment Verified</h2>
                <p>Hello ${fullName},</p>
                <p>Your payment of <strong>${amountNGN}</strong> for <strong>${service}</strong> has been successfully verified.</p>
                
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #000;">
                  <p style="font-weight: bold; margin-bottom: 15px; color: #000; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Transaction Details:</p>
                  <p style="margin: 5px 0;"><strong style="text-transform: uppercase; font-size: 10px; color: #666;">Reference:</strong> <span style="font-weight: bold;">${tx.reference}</span></p>
                </div>
                
                <p style="margin-top: 20px;">We are processing your request and will be in touch shortly.</p>
              </div>
              <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #888;">
                <p style="margin: 0;">&copy; ${new Date().getFullYear()} ÀGBÀ CINEMA HQ. ALL RIGHTS RESERVED.</p>
              </div>
            </div>
          `

          await sgMail.send({
            to: toEmail,
            from: {
              email: FROM_EMAIL,
              name: "ÀGBÀ CINEMA",
            },
            subject: `PAYMENT VERIFIED: ${service}`,
            text: `Thank you for your payment of ${amountNGN} for ${service}. Your reference is ${tx.reference}.`,
            html: html,
          })
          
          emailSent = true
        } catch (emailError) {
          console.error("Failed to send verification email (SendGrid):", emailError)
        }
      }


      // 2. Append to Google Sheet
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

      // 3. Log to Firestore for Analytics
      try {
        await adminService.logPayment({
           reference: tx.reference,
           fullName: fullName,
           email: toEmail,
           amount: tx.amount / 100, // Normalized to NGN
           service: service,
           category: tx.metadata?.category || "general",
           status: tx.status,
           customerEmail: toEmail,
           isNewStudent: tx.metadata?.type === "academy_enrollment"
        });
      } catch (logError) {
        console.error("Failed to log payment to firestore", logError);
      }
    }

    return NextResponse.json({ success: true, data: tx, sheetResult, emailSent })
  } catch (error) {
    console.error("Verification API Error:", error);
    return NextResponse.json({ message: "An unexpected error occurred" }, { status: 500 })
  }
}
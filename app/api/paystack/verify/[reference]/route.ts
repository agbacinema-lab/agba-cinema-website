
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
    let emailSent: boolean = false;

    if (tx.status === "success") {
      const toEmail = tx.customer?.email || ""
      const amountNGN = (tx.amount / 100).toLocaleString("en-NG", { style: "currency", currency: "NGN" })
      const service = tx.metadata?.service || "Your booking"
      const fullName = tx.metadata?.fullName || "Valued Customer"

      // 1. Send Email via EmailJS REST API (Server-side)
      try {
        const emailResponse = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service_id: process.env.EMAILJS_SERVICE_ID,
            template_id: process.env.EMAILJS_TEMPLATE_ID,
            user_id: process.env.EMAILJS_PUBLIC_KEY,
            accessToken: process.env.EMAILJS_PRIVATE_KEY,
            template_params: {
              to_name: fullName,
              to_email: toEmail,
              amount: amountNGN,
              reference: tx.reference,
              service: service,
              date: new Date(tx.transaction_date || Date.now()).toLocaleDateString(),
              message: "Thank you for your payment! Your booking is confirmed.",
            },
          }),
        });

        if (emailResponse.ok) {
          console.log("Email sent successfully from server");
          emailSent = true;
        } else {
          const errorText = await emailResponse.text();
          console.error("EmailJS Server Error:", errorText);
        }
      } catch (emailError) {
        console.error("Failed to send email from server:", emailError);
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
    }

    return NextResponse.json({ success: true, data: tx, sheetResult, emailSent })
  } catch (error) {
    console.error("Verification API Error:", error);
    return NextResponse.json({ message: "An unexpected error occurred" }, { status: 500 })
  }
}
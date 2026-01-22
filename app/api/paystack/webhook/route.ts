import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
    try {
        const body = await request.text()
        const signature = request.headers.get("x-paystack-signature")

        const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY

        if (!PAYSTACK_SECRET || !signature) {
            return NextResponse.json({ message: "Configuration error" }, { status: 500 })
        }

        const hash = crypto.createHmac("sha512", PAYSTACK_SECRET).update(body).digest("hex")

        if (hash !== signature) {
            return NextResponse.json({ message: "Invalid signature" }, { status: 400 })
        }

        const event = JSON.parse(body)

        // Handle the event
        if (event.event === "charge.success") {
            const data = event.data
            console.log("Payment successful via webhook:", data.reference)

            const toEmail = data.customer?.email || ""
            const amountNGN = (data.amount / 100).toLocaleString("en-NG", { style: "currency", currency: "NGN" })
            const service = data.metadata?.service || "Your booking"
            const fullName = data.metadata?.fullName || "Valued Customer"

            // Send Email via EmailJS REST API
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
                            reference: data.reference,
                            service: service,
                            date: new Date(data.transaction_date || Date.now()).toLocaleDateString(),
                            message: "Thank you for your payment! Your booking is confirmed. Next step 👇Join the class WhatsApp group here:https://chat.whatsapp.com/Hu8ZRryOCkg96G90oELK6J",
                        },
                    }),
                })

                if (emailResponse.ok) {
                    console.log("Email sent successfully via webhook")
                } else {
                    const errorText = await emailResponse.text()
                    console.error("Webhook EmailJS Error:", errorText)
                }
            } catch (emailError) {
                console.error("Failed to send email via webhook:", emailError)
            }

            // Note: DB/Sheet updates should ideally be handled here too if not already done by verify
        }

        return NextResponse.json({ received: true }, { status: 200 })
    } catch (error) {
        console.error("Webhook error:", error)
        return NextResponse.json({ message: "Webhook handler failed" }, { status: 500 })
    }
}

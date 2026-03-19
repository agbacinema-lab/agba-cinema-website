import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import sgMail from "@sendgrid/mail"

export async function POST(request: NextRequest) {
    try {
        const body = await request.text()
        const signature = request.headers.get("x-paystack-signature")

        const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY
        const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
        const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "agbacinema@gmail.com"

        if (!PAYSTACK_SECRET || !signature || !SENDGRID_API_KEY) {
            return NextResponse.json({ message: "Configuration error" }, { status: 500 })
        }

        sgMail.setApiKey(SENDGRID_API_KEY)

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

            // Send Email via SendGrid
            try {
                const html = `
                    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
                        <div style="background-color: #000; color: #fbbf24; padding: 20px; text-align: center;">
                            <h1 style="margin: 0; font-style: italic; letter-spacing: -1px; text-transform: uppercase;">ÀGBÀ CINEMA</h1>
                        </div>
                        <div style="padding: 30px;">
                            <h2 style="color: #000; border-bottom: 2px solid #fbbf24; padding-bottom: 10px; text-transform: uppercase;">Payment Confirmed</h2>
                            <p>Hello ${fullName},</p>
                            <p>Your payment of <strong>${amountNGN}</strong> for <strong>${service}</strong> has been successfully processed.</p>
                            
                            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #000;">
                                <p style="font-weight: bold; margin-bottom: 15px; color: #000; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Transaction Details:</p>
                                <p style="margin: 5px 0;"><strong style="text-transform: uppercase; font-size: 10px; color: #666;">Reference:</strong> <span style="font-weight: bold;">${data.reference}</span></p>
                                <p style="margin: 5px 0;"><strong style="text-transform: uppercase; font-size: 10px; color: #666;">Date:</strong> <span style="font-weight: bold;">${new Date(data.transaction_date || Date.now()).toLocaleDateString()}</span></p>
                            </div>

                            <div style="margin-top: 30px; padding: 20px; background-color: #fffbeb; border: 1px dashed #fbbf24; border-radius: 8px; text-align: center;">
                                <p style="font-weight: bold; color: #92400e; margin-bottom: 10px;">IMPORTANT NEXT STEP</p>
                                <p style="margin-bottom: 15px;">Join the official WhatsApp group for your session to receive updates and materials:</p>
                                <a href="https://chat.whatsapp.com/Hu8ZRryOCkg96G90oELK6J" style="display: inline-block; background-color: #25d366; color: white; padding: 12px 25px; border-radius: 50px; text-decoration: none; font-weight: bold; text-transform: uppercase; font-size: 14px;">Join WhatsApp Group</a>
                            </div>
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
                    subject: `PAYMENT CONFIRMED: ${service}`,
                    text: `Thank you for your payment of ${amountNGN} for ${service}. Your reference is ${data.reference}.`,
                    html: html,
                })

                console.log("Email sent successfully via webhook (SendGrid)")
            } catch (emailError) {
                console.error("Failed to send email via webhook (SendGrid):", emailError)
            }


            // Note: DB/Sheet updates should ideally be handled here too if not already done by verify
        }

        return NextResponse.json({ received: true }, { status: 200 })
    } catch (error) {
        console.error("Webhook error:", error)
        return NextResponse.json({ message: "Webhook handler failed" }, { status: 500 })
    }
}

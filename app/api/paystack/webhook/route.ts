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

            // Here you would typically update your database
            // await db.bookings.update({ where: { reference: data.reference }, data: { status: 'paid' } })

            // Note: We are already sending email in the verify endpoint (client-side trigger).
            // Ideally, email sending should be moved here to be robust against client-side failures,
            // but for now we'll keep it simple and just log.
        }

        return NextResponse.json({ received: true }, { status: 200 })
    } catch (error) {
        console.error("Webhook error:", error)
        return NextResponse.json({ message: "Webhook handler failed" }, { status: 500 })
    }
}

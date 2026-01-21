import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY || "re_123")

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fullName, email, phone, service, projectLocation, projectBrief, idealDates, preferredCommunication } = body

    // Admin notification email
    const adminEmailData = {
      from: process.env.FROM_EMAIL || "noreply@agbacinema.com",
      to: process.env.ADMIN_EMAIL || "admin@agbacinema.com",
      subject: `New Booking Request: ${service}`,
      html: `
        <h2>New Booking Request</h2>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Client:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Location:</strong> ${projectLocation}</p>
        <p><strong>Ideal Dates:</strong> ${idealDates || "Not specified"}</p>
        <p><strong>Preferred Communication:</strong> ${preferredCommunication}</p>
        <p><strong>Project Brief:</strong></p>
        <p>${projectBrief}</p>
      `,
    }

    // Client confirmation email
    const clientEmailData = {
      from: process.env.FROM_EMAIL || "noreply@agbacinema.com",
      to: email,
      subject: "Booking Request Received - ÀGBÀ CINEMA",
      html: `
        <h2>Thank you for your booking request!</h2>
        <p>Hi ${fullName},</p>
        <p>We've received your booking request for <strong>${service}</strong> and will get back to you within 24 hours.</p>
        <p><strong>Your Request Details:</strong></p>
        <ul>
          <li>Service: ${service}</li>
          <li>Location: ${projectLocation}</li>
          <li>Ideal Dates: ${idealDates || "Not specified"}</li>
          <li>Preferred Communication: ${preferredCommunication}</li>
        </ul>
        <p>We're excited to work with you!</p>
        <p>Best regards,<br>The ÀGBÀ CINEMA Team</p>
      `,
    }

    // Send both emails
    await Promise.all([resend.emails.send(adminEmailData), resend.emails.send(clientEmailData)])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Booking API error:", error)
    return NextResponse.json({ error: "Failed to process booking request" }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { to_email, to_name, subject, message, template_params, template_id } = await request.json()

  const SERVICE_ID = process.env.EMAILJS_SERVICE_ID
  const TEMPLATE_ID = template_id || process.env.EMAILJS_TEMPLATE_ID
  const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY
  const PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY

  if (!SERVICE_ID || !PUBLIC_KEY || !PRIVATE_KEY) {
    return NextResponse.json({ message: "Email service not configured" }, { status: 500 })
  }

  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: SERVICE_ID,
        template_id: TEMPLATE_ID,
        user_id: PUBLIC_KEY,
        accessToken: PRIVATE_KEY,
        template_params: {
          to_name,
          to_email,
          subject: subject || "Notification from ÀGBÀ CINEMA",
          message,
          ...template_params
        },
      }),
    })

    if (res.ok) {
      return NextResponse.json({ success: true })
    } else {
      const error = await res.text()
      return NextResponse.json({ success: false, error }, { status: res.status })
    }
  } catch (error) {
    console.error("Notification API Error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

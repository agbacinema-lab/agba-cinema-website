import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { to_email, to_name, subject, message, template_params } = await request.json()
    
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
    const FROM_EMAIL = "agbacinema@gmail.com"

    if (!SENDGRID_API_KEY) {
      console.error("[EMAIL SYSTEM] SENDGRID_API_KEY is missing")
      return NextResponse.json({ success: false, error: "Configuration failed" }, { status: 500 })
    }

    const sgMail = require("@sendgrid/mail")
    sgMail.setApiKey(SENDGRID_API_KEY)

    const html = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #000; color: #fbbf24; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-style: italic; letter-spacing: -1px; text-transform: uppercase;">ÀGBÀ CINEMA</h1>
          </div>
          <div style="padding: 30px;">
              <h2 style="color: #000; border-bottom: 2px solid #fbbf24; padding-bottom: 10px; text-transform: uppercase;">Incoming Signal</h2>
              <p>Hello ${to_name || "Operational Liaison"},</p>
              <div style="white-space: pre-wrap; font-size: 16px; color: #333; line-height: 1.6;">${message}</div>
              
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #000;">
                  <p style="font-weight: bold; margin-bottom: 15px; color: #000; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Transmission Details:</p>
                  ${template_params ? Object.entries(template_params).map(([key, value]) => `
                    <p style="margin: 5px 0;"><strong style="text-transform: uppercase; font-size: 10px; color: #666;">${key}:</strong> <span style="font-weight: bold;">${value}</span></p>
                  `).join('') : '<p style="margin:0; font-style: italic; color: #999;">Direct Command Signal Delivery</p>'}
              </div>
          </div>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #888;">
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} ÀGBÀ CINEMA HQ. ALL RIGHTS RESERVED.</p>
          </div>
      </div>
    `

    await sgMail.send({
      to: to_email,
      from: {
        email: FROM_EMAIL,
        name: "ÀGBÀ CINEMA COMMAND",
      },
      subject: subject,
      text: message,
      html: html,
    })

    return NextResponse.json({ success: true, message: "Email dispatched to operational queue" })
  } catch (error: any) {
    console.error("Email API Error:", error.response?.body || error)
    return NextResponse.json({ success: false, error: "Uplink failed" }, { status: 500 })
  }
}

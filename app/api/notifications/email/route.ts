import { NextRequest, NextResponse } from "next/server"
import sgMail from "@sendgrid/mail"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { to_email, to_name, subject, message, template_params, template_id } = data

    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
    const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "agbacinema@gmail.com"

    if (!SENDGRID_API_KEY) {
      console.error("SENDGRID_API_KEY is missing")
      return NextResponse.json({ success: false, message: "Email service not configured" }, { status: 500 })
    }

    sgMail.setApiKey(SENDGRID_API_KEY)

    // Construct simple HTML for the email
    let html = message || ""
    if (template_params && Object.keys(template_params).length > 0) {
      html = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #000; color: #fbbf24; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-style: italic; letter-spacing: -1px; text-transform: uppercase;">ÀGBÀ CINEMA</h1>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #000; border-bottom: 2px solid #fbbf24; padding-bottom: 10px; text-transform: uppercase;">${subject || "Transmission Received"}</h2>
            <p>Hello ${to_name || "Valued Citizen"},</p>
            <p>${message || "Our units have received your signal. Processing is underway."}</p>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #000;">
              <p style="font-weight: bold; margin-bottom: 15px; color: #000; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Transmission Details:</p>
              ${Object.entries(template_params)
                .map(([key, value]) => `<p style="margin: 5px 0;"><strong style="text-transform: uppercase; font-size: 10px; color: #666;">${key.replace(/_/g, " ")}:</strong> <span style="font-weight: bold;">${value}</span></p>`)
                .join("")}
            </div>
          </div>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #888;">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} ÀGBÀ CINEMA HQ. ALL RIGHTS RESERVED.</p>
            <p style="margin: 5px 0;">Lagos, Nigeria // Global Deployment</p>
          </div>
        </div>
      `
    } else {
      html = `<div style="font-family: Arial; padding: 20px;">${message || "No content"}</div>`
    }

    const msg = {
      to: to_email || "agbacinema@gmail.com",
      from: {
        email: FROM_EMAIL,
        name: "ÀGBÀ CINEMA",
      },
      subject: subject || "Notification from ÀGBÀ CINEMA",
      text: message || "New transmission from ÀGBÀ CINEMA",
      html: html,
    }

    // Support SendGrid templates if specifically requested with a d- prefix
    if (template_id && template_id.startsWith("d-")) {
      // @ts-ignore
      msg.templateId = template_id
      // @ts-ignore
      msg.dynamicTemplateData = {
        ...(template_params || {}),
        to_name,
        subject,
        message,
      }
    }

    await sgMail.send(msg)
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("SendGrid API Error:", error.response?.body || error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}


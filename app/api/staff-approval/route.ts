import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase-admin"
import sgMail from "@sendgrid/mail"
import { FieldValue } from "firebase-admin/firestore"

export async function POST(request: NextRequest) {
  try {
    const { action, staffUid, staffName, staffEmail, requestId, reason } = await request.json()

    if (!action || !staffUid || !staffEmail) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
    const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "agbacinema@gmail.com"

    if (!SENDGRID_API_KEY) {
      return NextResponse.json({ success: false, error: "Email config missing" }, { status: 500 })
    }

    sgMail.setApiKey(SENDGRID_API_KEY)

    if (action === "approve") {
      if (!db) throw new Error("Firebase admin database not initialized")
      // 1. Update user document — set role to staff and mark approved
      await db.collection("users").doc(staffUid).update({
        approvalStatus: "approved",
        approvedAt: FieldValue.serverTimestamp(),
      })

      // 2. Update the approval request doc
      if (requestId) {
        await db.collection("staff_approvals").doc(requestId).update({
          status: "approved",
          processedAt: FieldValue.serverTimestamp(),
        })
      }

      // 3. Send approval email to staff
      const html = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #000; color: #fbbf24; padding: 24px; text-align: center;">
            <h1 style="margin: 0; font-style: italic; letter-spacing: -1px; text-transform: uppercase;">ÀGBÀ CINEMA</h1>
          </div>
          <div style="padding: 36px;">
            <h2 style="color: #000; border-bottom: 2px solid #fbbf24; padding-bottom: 10px; text-transform: uppercase;">
              ✅ Account Approved!
            </h2>
            <p>Hello <strong>${staffName}</strong>,</p>
            <p>Great news! Your staff account has been <strong style="color: #16a34a;">approved</strong> by the ÀGBÀ CINEMA admin team.</p>
            <p>You can now log in to your dashboard and start your journey with us.</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://agba-cinema-website.vercel.app"}/login"
                style="background-color: #fbbf24; color: #000; padding: 14px 36px; border-radius: 30px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">
                Log In to Dashboard →
              </a>
            </div>
            <p style="color: #888; font-size: 13px;">If you have any questions, reach us at agbacinema@gmail.com</p>
          </div>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #888;">
            <p style="margin: 0;">© ${new Date().getFullYear()} ÀGBÀ CINEMA HQ. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      `

      await sgMail.send({
        to: staffEmail,
        from: { email: FROM_EMAIL, name: "ÀGBÀ CINEMA" },
        subject: "✅ Your ÀGBÀ CINEMA Staff Account Has Been Approved!",
        text: `Hello ${staffName}, your staff account has been approved. You can now log in at ${process.env.NEXT_PUBLIC_BASE_URL || "https://agba-cinema-website.vercel.app"}/login`,
        html,
      })

      return NextResponse.json({ success: true, message: "Staff approved and email sent" })
    }

    if (action === "reject") {
      if (!db) throw new Error("Firebase admin database not initialized")
      // 1. Update user document
      await db.collection("users").doc(staffUid).update({
        approvalStatus: "rejected",
        rejectedAt: FieldValue.serverTimestamp(),
        rejectionReason: reason || "No reason provided",
      })

      // 2. Update the approval request doc
      if (requestId) {
        await db.collection("staff_approvals").doc(requestId).update({
          status: "rejected",
          reason: reason || "No reason provided",
          processedAt: FieldValue.serverTimestamp(),
        })
      }

      // 3. Send rejection email
      const html = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #000; color: #fbbf24; padding: 24px; text-align: center;">
            <h1 style="margin: 0; font-style: italic; letter-spacing: -1px; text-transform: uppercase;">ÀGBÀ CINEMA</h1>
          </div>
          <div style="padding: 36px;">
            <h2 style="color: #000; border-bottom: 2px solid #fbbf24; padding-bottom: 10px; text-transform: uppercase;">
              Account Application Update
            </h2>
            <p>Hello <strong>${staffName}</strong>,</p>
            <p>We have reviewed your staff account application and unfortunately, it has not been approved at this time.</p>
            ${reason ? `<div style="background: #f9f9f9; border-left: 4px solid #000; padding: 16px; border-radius: 6px; margin: 20px 0;">
              <p style="margin:0; font-size: 13px; color: #555;"><strong>Reason:</strong> ${reason}</p>
            </div>` : ""}
            <p>If you believe this is an error or would like to discuss further, please contact us at <a href="mailto:agbacinema@gmail.com" style="color: #b45309;">agbacinema@gmail.com</a>.</p>
          </div>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #888;">
            <p style="margin: 0;">© ${new Date().getFullYear()} ÀGBÀ CINEMA HQ. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      `

      await sgMail.send({
        to: staffEmail,
        from: { email: FROM_EMAIL, name: "ÀGBÀ CINEMA" },
        subject: "Update on Your ÀGBÀ CINEMA Staff Application",
        text: `Hello ${staffName}, your staff account application was not approved. Reason: ${reason || "Not specified."}`,
        html,
      })

      return NextResponse.json({ success: true, message: "Staff rejected and email sent" })
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
  } catch (error: any) {
    console.error("Staff Approval API Error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

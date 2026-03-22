import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { targetAudience, subject, message, cohort } = data;

    if (!targetAudience || !subject || !message) {
      return NextResponse.json({ error: "Missing transmission parameters" }, { status: 400 });
    }

    if (!db) {
        return NextResponse.json({ error: "Database signal offline. Check Admin Credentials." }, { status: 503 });
    }

    let emails: string[] = [];

    // 1. Fetch target emails
    if (targetAudience === 'everyone') {
      const snap = await db.collection("users").get();
      emails = snap.docs.map(doc => doc.data().email).filter(Boolean);
    } 
    else if (targetAudience === 'all_students') {
      const snap = await db.collection("users").where("role", "==", "student").get();
      emails = snap.docs.map(doc => doc.data().email).filter(Boolean);
    }
    else if (targetAudience === 'all_staff') {
      const snap = await db.collection("users").where("role", "==", "staff").get();
      emails = snap.docs.map(doc => doc.data().email).filter(Boolean);
    }
    else if (targetAudience === 'all_brand') {
      const snap = await db.collection("users").where("role", "==", "brand").get();
      emails = snap.docs.map(doc => doc.data().email).filter(Boolean);
    }
    else if (targetAudience === 'all_tutor') {
      const snap = await db.collection("users").where("role", "==", "tutor").get();
      emails = snap.docs.map(doc => doc.data().email).filter(Boolean);
    }
    else if (targetAudience === 'all_director') {
      const snap = await db.collection("users").where("role", "==", "director").get();
      emails = snap.docs.map(doc => doc.data().email).filter(Boolean);
    }
    else if (targetAudience === 'all_gopro') {
      let query: any = db.collection("users").where("role", "==", "student").where("programType", "==", "gopro");
      if (cohort && cohort !== 'all') {
        query = query.where("cohort", "==", cohort);
      }
      const snap = await query.get();
      emails = snap.docs.map((doc: any) => doc.data().email).filter(Boolean);
    }
    else if (targetAudience === 'all_mentorship') {
      const snap = await db.collection("users").where("role", "==", "student").where("programType", "==", "mentorship").get();
      emails = snap.docs.map(doc => doc.data().email).filter(Boolean);
    }

    if (emails.length === 0) {
      return NextResponse.json({ error: "No recipients found for this transmission target." }, { status: 404 });
    }

    // 2. Broadcast via internal signal node
    const sgMail = require("@sendgrid/mail");
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: emails,
      from: {
        email: "agbacinema@gmail.com",
        name: "ÀGBÀ CINEMA COMMAND"
      },
      subject: subject,
      text: message,
      html: `
        <div style="font-family: sans-serif; padding: 40px; background: #000; color: #fff;">
          <div style="max-width: 600px; margin: 0 auto; background: #111; padding: 40px; border: 1px solid #333; border-radius: 20px;">
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <div style="width: 10px; height: 10px; background: #fbbf24; border-radius: 2px; margin-right: 10px;"></div>
                <h4 style="color: #fbbf24; margin: 0; text-transform: uppercase;">Official Transmission</h4>
            </div>
            <h1 style="font-size: 24px; font-weight: 900; color: #fff; margin-bottom: 20px; text-transform: uppercase;">${subject}</h1>
            <p style="font-size: 16px; color: #ccc; line-height: 1.6; margin-bottom: 30px; white-space: pre-wrap;">${message}</p>
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #333; font-size: 12px; color: #666; font-weight: bold;">
              SOURCE: ÀGBÀ CINEMA HQ COMMAND CENTER<br/>
              RECIPIENTS: ${emails.length} UNIT(S)<br/>
              BROADCAST ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}
            </div>
          </div>
        </div>
      `,
    };

    await sgMail.sendMultiple(msg);

    return NextResponse.json({ 
      success: true, 
      recipientCount: emails.length,
      message: `Transmission deployed successfully to ${emails.length} units.` 
    });

  } catch (error: any) {
    console.error("Bulk Transmission Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

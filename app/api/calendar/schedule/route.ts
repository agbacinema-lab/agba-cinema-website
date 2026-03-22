import { NextResponse } from "next/server"
import { google } from "googleapis"
import { adminAuth } from "@/lib/firebase-admin"
import { classSchedulerService } from "@/lib/services"

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const { topic, durationMinutes, startDateTime, tutorId, studentEmail, cohortEmails } = data
    
    // We expect the FIREBASE_SERVICE_ACCOUNT to be base64 parsed or accessible
    const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT
    if (!serviceAccountStr) {
      return NextResponse.json({ error: "Missing Google Credentials" }, { status: 500 })
    }

    let serviceAccount;
    try {
      if (serviceAccountStr.trim().startsWith('{')) {
        serviceAccount = JSON.parse(serviceAccountStr);
      } else {
        serviceAccount = JSON.parse(Buffer.from(serviceAccountStr, 'base64').toString('utf8'));
      }
    } catch (e) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT in calendar API:", e);
      return NextResponse.json({ error: "Invalid Google Credentials Format" }, { status: 500 });
    }

    // Auth client
    const auth = new google.auth.JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ['https://www.googleapis.com/auth/calendar']
    })

    const calendar = google.calendar({ version: 'v3', auth })

    // Attendees list
    const attendees = []
    if (studentEmail) attendees.push({ email: studentEmail })
    if (cohortEmails && Array.isArray(cohortEmails)) {
      cohortEmails.forEach(email => attendees.push({ email }))
    }

    // Calculate end time
    const startObj = new Date(startDateTime)
    const endObj = new Date(startObj.getTime() + durationMinutes * 60000)

    // Event object
    const event = {
      summary: `Live Class: ${topic}`,
      description: `Àgbà Cinema Academy Live Class Session via Google Meet.`,
      start: {
        dateTime: startObj.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: endObj.toISOString(),
        timeZone: 'UTC',
      },
      attendees,
      conferenceData: {
        createRequest: {
          requestId: `agba-meet-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" }
        }
      },
      // Ensure guests can modify? Optional.
      guestsCanModify: false,
    }

    console.log("Creating Google Calendar event...")
    
    // NOTE: To create events, you need a calendar ID. Often, you can share a generic 
    // user's calendar with the service account email, and use that calendar ID here.
    // For now, we attempt to use the 'primary' calendar of the service account or a specific one
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary'

    const response = await calendar.events.insert({
      calendarId,
      requestBody: event,
      conferenceDataVersion: 1, // Required to generate Meet Link
      sendUpdates: 'all' // Sends email to attendees
    })

    const eventData = response.data
    const meetLink = eventData.hangoutLink

    return NextResponse.json({ 
      success: true, 
      eventId: eventData.id, 
      meetLink, 
      htmlLink: eventData.htmlLink 
    })

  } catch (error: any) {
    console.error("Google Calendar Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { google } from "googleapis"
import { db as adminDb } from "@/lib/firebase-admin"

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

    // ── 1. Meet Link Pool Logic (Intelligent Assignment) ──
    let poolLink: string | null = null;
    const startObj = new Date(startDateTime)
    const endObj = new Date(startObj.getTime() + durationMinutes * 60000)

    try {
      if (adminDb) {
        // Fetch all classes that might overlap (buffer of 4 hours)
        const overlappingClasses = await adminDb.collection("scheduled_classes")
          .where("scheduledAt", ">=", new Date(startObj.getTime() - 4 * 3600000))
          .get()

        const busyLinks = new Set<string>()
        overlappingClasses.docs.forEach(doc => {
          const classData = doc.data()
          const classStart = classData.scheduledAt.toDate()
          const classEnd = new Date(classStart.getTime() + (classData.duration || 60) * 60000)
          
          // Check for actual time overlap
          const overlaps = (startObj < classEnd && endObj > classStart)
          if (overlaps && classData.meetLink) {
             busyLinks.add(classData.meetLink.trim())
          }
        })

        // Fetch the pool of permanent links
        const poolDocs = await adminDb.collection("meet_link_pool").get()
        const availableLinks = poolDocs.docs
          .map(d => d.data().url?.trim())
          .filter(url => url && !busyLinks.has(url))

        if (availableLinks.length > 0) {
          poolLink = availableLinks[0]
          console.log(`[POOL ASSIGNMENT] Link allocated: ${poolLink}`)
        }
      }
    } catch (e) {
      console.error("[POOL ERROR] Falling back to dynamic creation:", e)
    }

    // ── 2. Google Calendar Integration ──
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

    // Base Event object
    const event: any = {
      summary: `Live Class: ${topic}`,
      description: `Àgbà Cinema Academy Live Class Session. ${poolLink ? `\n\nDirect Join Link: ${poolLink}` : ''}`,
      location: poolLink || "",
      start: {
        dateTime: startObj.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: endObj.toISOString(),
        timeZone: 'UTC',
      },
      attendees,
      guestsCanModify: false,
    }

    // Only ask for conference generation if no pool link was found
    if (!poolLink) {
       event.conferenceData = {
          createRequest: {
             requestId: `agba-meet-${Date.now()}`,
             conferenceSolutionKey: { type: "hangoutsMeet" }
          }
       }
    }

    console.log("Creating Google Calendar event...")
    
    const calendarIds = [
      process.env.GOOGLE_CALENDAR_ID,
      process.env.GOOGLE_CALENDAR_ID_BACKUP,
      'primary'
    ].filter(Boolean) as string[]

    let lastError: any = null
    let eventData: any = null

    for (const calendarId of calendarIds) {
      // ── Refresh requestId/event details for each attempt ──
      const currentEvent = { ...event }
      if (!poolLink) {
         currentEvent.conferenceData = {
            createRequest: {
               requestId: `agba-retry-${Date.now()}-${Math.random().toString(36).substring(7)}`,
               conferenceSolutionKey: { type: "hangoutsMeet" }
            }
         }
      }

      try {
        console.log(`[CALENDAR ATTEMPT] Target: ${calendarId}`)
        const response = await calendar.events.insert({
          calendarId,
          requestBody: currentEvent,
          conferenceDataVersion: poolLink ? 0 : 1,
          sendUpdates: 'all'
        })
        eventData = response.data
        if (eventData) break
      } catch (err: any) {
        if (err.message?.includes("cannot invite attendees") || err.message?.includes("Domain-Wide Delegation")) {
          console.warn(`[CALENDAR RETRY] ID: ${calendarId} - Detected Consumer restriction. Retrying...`)
          try {
            const response = await calendar.events.insert({
              calendarId,
              requestBody: { ...currentEvent, attendees: [] },
              conferenceDataVersion: poolLink ? 0 : 1,
              sendUpdates: 'none'
            })
            eventData = response.data
            if (eventData) break
          } catch (retryErr: any) {
             if (retryErr.message?.includes("conference") && !poolLink) {
                const finalTry = await calendar.events.insert({
                  calendarId,
                  requestBody: { ...currentEvent, attendees: [], conferenceData: undefined },
                  sendUpdates: 'none'
                }).catch(() => null)
                if (finalTry?.data) {
                  eventData = finalTry.data
                  break
                }
             }
            lastError = retryErr
          }
        } else {
          lastError = err
        }
      }
    }

    if (!eventData) {
      return NextResponse.json({ 
        error: `Protocol failure on all uplinks. Last error: ${lastError?.message || 'Unknown'}` 
      }, { status: 500 })
    }

    const meetLink = poolLink || eventData.hangoutLink || process.env.GOOGLE_MEET_FALLBACK || "";
    const calendarLink = eventData.htmlLink;
    
    // ── Generate Public "Add to Calendar" Template URL ──
    const formatTime = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const calendarTemplateUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Live Class: ${topic}`)}&dates=${formatTime(startObj)}/${formatTime(endObj)}&details=${encodeURIComponent(`Àgbà Cinema Academy Session.\nJoin here: ${meetLink}`)}&location=${encodeURIComponent(meetLink)}`;
    
    const finalJoinLink = meetLink || calendarLink || "#";

    // ── Dispatch Email Notifications ──
    const dispatchEmail = async (email: string) => {
      try {
        await fetch(new URL('/api/notifications/email', req.url), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to_email: email,
            subject: `New Live Class Scheduled: ${topic}`,
            message: `A new live learning session has been scheduled for you.\n\nTopic: ${topic}\nDate: ${new Date(startDateTime).toLocaleString()}\nDuration: ${durationMinutes} mins\n\nLink to join: ${finalJoinLink}\n\nYou can also add this to your personal calendar here: ${calendarTemplateUrl}`,
            template_params: {
              Topic: topic,
              Time: new Date(startDateTime).toLocaleString(),
              "Meet Link": finalJoinLink,
              "Add to Calendar": calendarTemplateUrl
            }
          })
        })
      } catch (e) {
        console.error(`[NOTIFICATION ERROR] Failed to notify ${email}:`, e)
      }
    }

    if (studentEmail) await dispatchEmail(studentEmail)
    if (cohortEmails && Array.isArray(cohortEmails)) {
      await Promise.all(cohortEmails.map(email => dispatchEmail(email)))
    }

    return NextResponse.json({ 
      success: true, 
      eventId: eventData.id, 
      meetLink: finalJoinLink, 
      htmlLink: calendarLink 
    })

  } catch (error: any) {
    console.error("Google Calendar Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

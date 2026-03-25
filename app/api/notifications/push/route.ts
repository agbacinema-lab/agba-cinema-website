import { NextResponse } from "next/server"
import { adminMessaging, db } from "@/lib/firebase-admin"

export async function POST(req: Request) {
  try {
    const { userIds, title, body, metadata } = await req.json()

    if (!userIds || !adminMessaging || !db) {
      return NextResponse.json({ error: "Infrastructure offline" }, { status: 503 })
    }

    // 1. Fetch all tokens for these users
    const allTokens: string[] = []
    
    await Promise.all(userIds.map(async (uid: string) => {
      const tokensSnap = await db!.collection("users").doc(uid).collection("fcm_tokens").get()
      tokensSnap.forEach(doc => {
        const token = doc.data().token
        if (token && !allTokens.includes(token)) {
          allTokens.push(token)
        }
      })
    }))

    if (allTokens.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: "No active device tokens found" })
    }

    // 2. Send Multicast
    const response = await adminMessaging.sendEachForMulticast({
      tokens: allTokens,
      notification: {
        title,
        body,
      },
      data: {
        ...metadata,
        click_action: metadata?.link || "/admin?tab=communications"
      },
      webpush: {
        headers: {
          Urgency: "high"
        },
        notification: {
          icon: "https://agba-cinema-website.vercel.app/icon.png",
          badge: "https://agba-cinema-website.vercel.app/icon.png",
          requireInteraction: true
        },
        fcmOptions: {
          link: metadata?.link || "https://agba-cinema-website.vercel.app/admin?tab=communications"
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      sent: response.successCount, 
      failed: response.failureCount 
    })

  } catch (error: any) {
    console.error("[FCM API] Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

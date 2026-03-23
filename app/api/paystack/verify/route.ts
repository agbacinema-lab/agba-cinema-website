import { NextRequest, NextResponse } from "next/server"
import { adminService, studentService, notificationService, brandService } from "@/lib/services"
import { db as adminDb } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const reference = searchParams.get('reference')

  if (!reference) {
    console.error("[VERIFICATION ERROR] No reference provided in callback.")
    return NextResponse.redirect(new URL('/payment/failed?error=no_ref', request.url))
  }

  try {
    console.log(`[VERIFICATION ATTEMPT] Reference: ${reference}`)
    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    })

    const data = await res.json()

    if (data.status && data.data.status === 'success') {
      const { amount, customer, metadata } = data.data
      console.log(`[VERIFICATION PROTOCOL] Transaction ${reference} confirmed. Metadata:`, metadata)
      
      // Log to Firestore for audit trail
      try {
        await adminService.logPayment({
          reference,
          amount: amount / 100,
          email: customer.email,
          fullName: metadata?.fullName || "Valued Customer",
          service: metadata?.service || "General Support",
          status: 'success',
          userId: metadata?.userId || metadata?.brandId,
          processedAt: new Date().toISOString()
        })
      } catch (logErr) {
        console.error("[VERIFICATION ERROR] Audit log failed (non-critical):", logErr)
      }

      // ─── Tactical Enrollment Execution ───
      if (metadata?.type === 'academy_enrollment' && metadata?.userId) {
        console.log(`[ENROLLMENT PROTOCOL] Activating track ${metadata.service} for user ${metadata.userId}`)
        
        try {
          // Get existing user data to handle array append accurately
          const userProfile = await adminService.getUserById(metadata.userId);
          const currentEnrolled = userProfile?.enrolledSpecializations || [];
          
          // Verify if already enrolled to avoid duplicates
          const alreadyEnrolled = currentEnrolled.some((e: any) => 
            e.title === metadata.service || 
            e.value === metadata.service.toLowerCase().replace(/\s+/g, '-')
          );
          
          if (!alreadyEnrolled) {
            const newEntry = { 
              id: `${metadata.userId}_${Date.now()}`, 
              title: metadata.service, 
              value: metadata.service.toLowerCase().replace(/\s+/g, '-'), 
              programType: metadata.programType || 'mentorship', 
              enrolledAt: new Date().toISOString() 
            };

            await studentService.updateFullProfile(metadata.userId, {
              specialization: metadata.service,
              programType: metadata.programType || 'mentorship',
              enrollmentDate: new Date().toISOString(),
              status: 'student',
              enrolledSpecializations: [...currentEnrolled, newEntry]
            })

            await notificationService.sendNotification({
              recipientId: metadata.userId,
              title: "Specialization Activated",
              message: `Clearance granted for ${metadata.service}. System feed is now live.`,
              type: "system"
            })
            console.log(`[ENROLLMENT SUCCESS] User ${metadata.userId} now has access to ${metadata.service}`)
          } else {
            console.log(`[ENROLLMENT PROTOCOL] User already has clearance for ${metadata.service}. Skipping duplicate activation.`)
          }
        } catch (enrollErr) {
          console.error("[ENROLLMENT ERROR] Failed to activate track:", enrollErr)
        }
      }

      // ─── Direct Intern Recruitment Execution ───
      if (metadata?.type === 'intern_recruitment' && metadata?.brandId && metadata?.studentId) {
        console.log(`[INTERN RECRUITMENT] Processing direct hire. Brand: ${metadata.brandId}, Intern: ${metadata.studentId}`)
        try {
          if (!adminDb) throw new Error("Firebase Admin DB not initialized");
          
          const reqRef = await adminDb.collection("internship_requests").add({
            brandId: metadata.brandId,
            studentId: metadata.studentId,
            studentName: metadata.fullName || "Intern", // Here fullName from metadata might be the Brand's, so we'll fetch student in notification later if needed
            skills: [], // Can be populated if needed
            termsAccepted: true,
            status: 'approved', // Automatically approved because they paid!
            isDirectHire: true, 
            paymentPlan: metadata.plan || "subscription",
            amountPaid: amount / 100, // actual amount
            requestedAt: new Date()
          })

          // ── Create Group Chat for Brand, Intern, Tutor and Admins ──
          const studentDoc = await adminDb.collection("users").doc(metadata.studentId).get()
          const studentData = studentDoc.data()
          const tutorId = studentData?.tutorId
          const studentName = studentData?.name || "Intern"
          const brandName = metadata.fullName || "Brand"

          const participants = [metadata.brandId, metadata.studentId]
          if (tutorId) participants.push(tutorId)

          const participantDetails: any = {
            [metadata.brandId]: { name: brandName, role: 'brand' },
            [metadata.studentId]: { name: studentName, role: 'student' }
          }
          if (tutorId) {
             const tutorDoc = await adminDb.collection("users").doc(tutorId).get()
             participantDetails[tutorId] = { name: tutorDoc.data()?.name || "Tutor", role: 'tutor' }
          }

          const adminsSnap = await adminDb.collection("users").where("role", "==", "super_admin").get()
          adminsSnap.docs.forEach(d => {
            if (!participants.includes(d.id)) participants.push(d.id)
            participantDetails[d.id] = { name: d.data().name || "System Admin", role: 'super_admin' }
          })

          const chatRef = await adminDb.collection("chat_rooms").add({
            participants,
            participantDetails,
            metadata: {
              brandId: metadata.brandId,
              studentId: metadata.studentId,
              requestId: reqRef.id,
              type: 'intern_recruitment',
              plan: metadata.plan || 'subscription'
            },
            createdAt: FieldValue.serverTimestamp(),
            lastMessage: "Recruitment deployment initialized. Official channel opened.",
            lastMessageAt: FieldValue.serverTimestamp()
          })

          await adminDb.collection("chat_rooms").doc(chatRef.id).collection("messages").add({
            text: "Recruitment deployment initialized. Official channel opened.",
            senderId: "system",
            senderName: "SYSTEM_DISPATCH",
            timestamp: FieldValue.serverTimestamp()
          })

          await notificationService.sendNotification({
            recipientId: metadata.studentId,
            title: "Direct Internship Deployment",
            message: `You have been directly recruited! Check your portal for deployment details.`,
            type: "system"
          })
          
          await notificationService.sendNotification({
            recipientId: metadata.brandId,
            title: "Recruitment Successful",
            message: `Payment successful. The specialist has been deployed to your active roster.`,
            type: "system"
          })
          
        } catch (recruitErr) {
          console.error("[RECRUITMENT ERROR] Failed to finalize intern hire:", recruitErr)
        }
      }

      // Notify Admin based on settings
      try {
        const settings = await adminService.getSettings()
        if (settings?.notifications?.payments) {
          await fetch(new URL('/api/notifications/email', request.url).toString(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to_email: "agbacinema@gmail.com",
              to_name: "Admin",
              subject: `PAYMENT RECEIVED: #${(amount/100).toLocaleString()}`,
              message: `A new transaction has been successfully processed for ${metadata?.service || "General Support"}.`,
              template_params: {
                customer_name: metadata?.fullName || "Valued Customer",
                customer_email: customer.email,
                amount: `#${(amount/100).toLocaleString()}`,
                reference: reference,
                service: metadata?.service || "N/A"
              }
            })
          }).catch(e => console.error("[NOTIFY ERROR] Admin notification failed:", e))
        }
      } catch (settingErr) {
        console.error("[NOTIFY ERROR] Failed to fetch settings:", settingErr)
      }

      const successUrl = new URL('/payment/success', request.url)
      successUrl.searchParams.set('reference', reference)
      if (metadata?.type === 'intern_recruitment') {
        successUrl.searchParams.set('type', 'brand')
      }
      return NextResponse.redirect(successUrl)
    } else {
      console.warn(`[VERIFICATION FAILED] Transaction ${reference} status: ${data.data?.status || 'Unknown'}`)
      const failedUrl = new URL('/payment/failed', request.url)
      failedUrl.searchParams.set('reference', reference)
      failedUrl.searchParams.set('reason', data.data?.status || 'failed')
      return NextResponse.redirect(failedUrl)
    }
  } catch (error) {
    console.error("[VERIFICATION FATAL ERROR]:", error)
    const fatalUrl = new URL('/payment/failed', request.url)
    fatalUrl.searchParams.set('reference', reference || 'FATAL')
    return NextResponse.redirect(fatalUrl)
  }
}

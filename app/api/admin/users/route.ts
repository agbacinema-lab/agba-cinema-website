import { NextRequest, NextResponse } from "next/server"
import { adminAuth, db } from "@/lib/firebase-admin"

export async function DELETE(request: NextRequest) {
  try {
    const { userId, requesterRole } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    if (!adminAuth || !db) {
       console.error("[API_ERROR] Firebase Admin SDK not initialized.")
       return NextResponse.json({ error: "Administration service currently offline. Verify backend credentials." }, { status: 503 })
    }

    if (requesterRole !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized: Only super admins can delete accounts" }, { status: 403 })
    }

    // 1. Delete from Firebase Auth
    try {
      await adminAuth.deleteUser(userId)
    } catch (authError: any) {
      if (authError.code !== "auth/user-not-found") {
        throw authError // Rethrow if it's not simply a missing user
      }
      console.warn(`User ${userId} not found in Auth, but proceeding with Firestore cleanup`)
    }

    // 2. Delete from Firestore (users collection)
    await db.collection("users").doc(userId).delete()

    // 3. Delete from students collection if they exist there
    const studentsRef = db.collection("students")
    const studentSnapshot = await studentsRef.where("studentUID", "==", userId).get()
    const batch = db.batch()

    studentSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })

    // 4. Delete pending staff approvals
    const approvalsRef = db.collection("staff_approvals")
    const approvalSnapshot = await approvalsRef.where("staffUid", "==", userId).get()

    approvalSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })

    await batch.commit()

    return NextResponse.json({ success: true, message: "User account and all traces successfully erased." })

  } catch (error: any) {
    console.error("Delete user API error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

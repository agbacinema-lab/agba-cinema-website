import { initializeApp, getApps, cert, App } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

function getAdminApp(): App | null {
  if (getApps().length > 0) {
    return getApps()[0]
  }

  // Support for combined service account JSON (base64)
  const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT
  if (serviceAccountStr) {
    try {
      const serviceAccount = JSON.parse(Buffer.from(serviceAccountStr, 'base64').toString('utf8'))
      return initializeApp({
        credential: cert(serviceAccount),
      })
    } catch (e) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT:", e)
    }
  }

  // Support for individual variables
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n")

  if (!projectId || !clientEmail || !privateKey) {
    console.warn("Missing Firebase Admin SDK environment variables. Admin features will be disabled.")
    return null
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  })
}

export const adminApp = getAdminApp()
export const adminAuth = adminApp ? getAuth(adminApp) : null
export const db = adminApp ? getFirestore(adminApp) : null

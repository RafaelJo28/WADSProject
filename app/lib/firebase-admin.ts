import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

const hasServiceAccount = Boolean(
  process.env.FIREBASE_ADMIN_PROJECT_ID &&
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
    process.env.FIREBASE_ADMIN_PRIVATE_KEY
)

let adminAuth: ReturnType<typeof getAuth> | { verifyIdToken: (token: string) => Promise<any> }

if (hasServiceAccount) {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID as string,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL as string,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      }),
    })
  }
  adminAuth = getAuth()
} else {
  // During image build the service account may be intentionally omitted.
  // Export a minimal stub so importing modules won't throw; runtime calls will get a clear error.
  adminAuth = {
    async verifyIdToken() {
      throw new Error(
        "FIREBASE_ADMIN_PROJECT_ID / FIREBASE_ADMIN_CLIENT_EMAIL / FIREBASE_ADMIN_PRIVATE_KEY are not set. Initialize Firebase Admin in runtime environment."
      )
    },
  }
}

export { adminAuth }
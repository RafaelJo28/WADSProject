// Google auth route: verifies Firebase ID tokens, creates or finds a matching user,
// then issues the same JWT cookie used by normal email/password login.
import { NextRequest, NextResponse } from "next/server"
import { adminAuth } from "@/app/lib/firebase-admin"
import { db } from "@/app/lib/db"
import jwt from "jsonwebtoken"

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json()

    if (!idToken) {
      return NextResponse.json({ error: "ID token required" }, { status: 400 })
    }

    // Verify the Firebase ID token
    const decoded = await adminAuth.verifyIdToken(idToken) as {
      uid: string
      email?: string
      name?: string
    }
    const { uid, email, name } = decoded

    if (!email) {
      return NextResponse.json({ error: "No email found" }, { status: 400 })
    }

    // Find or create user in database
    let user = await db.user.findUnique({ where: { email } })

    if (!user) {
      user = await db.user.create({
        data: {
          name: name || "Google User",
          email,
          password: `firebase_${uid}`, // placeholder password for Google users
          role: "student",
        },
      })
    }

    // Issue our JWT cookie (same as normal login)
    const token = jwt.sign(
      { userId: user.id },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: "7d" }
    )

    const response = NextResponse.json({
      message: "Login successful!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error: unknown) {
    console.error("Google auth error:", error)
    const message = error instanceof Error ? error.message : "Authentication failed"
    return NextResponse.json({ error: message }, { status: 401 })
  }
}
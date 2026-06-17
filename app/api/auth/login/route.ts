import { NextRequest, NextResponse } from "next/server"
import { db } from "@/app/lib/db"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { rateLimit } from "@/app/lib/rateLimit"

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown"
  const limit = rateLimit(ip, { maxRequests: 5, windowMs: 60 * 1000 })

  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many login attempts. Please wait a minute and try again." },
      { status: 429 }
    )
  }

  try {
    const { email, password } = await req.json()

    const trimmedEmail = email?.trim()

    if (!trimmedEmail || trimmedEmail.length < 5 || trimmedEmail.length > 254) {
      return NextResponse.json(
        { error: "Email is required and must be between 5 and 254 characters" },
        { status: 400 }
      )
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Password is required and must be at least 8 characters" },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({ where: { email: trimmedEmail } })
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: "7d" }
    )

    const response = NextResponse.json({
      message: "Login successful!",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    })

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return response
  } catch (err) {
    console.error("Login error:", err)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
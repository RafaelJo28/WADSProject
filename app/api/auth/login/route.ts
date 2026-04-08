import { NextRequest, NextResponse } from "next/server"
import { db } from "@/app/lib/db"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"


export async function POST(req: NextRequest) {
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
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

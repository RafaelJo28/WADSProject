import { NextRequest, NextResponse } from "next/server"
import { db } from "@/app/lib/db"
import bcrypt from "bcryptjs"


export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()


    const trimmedName = name?.trim()
    const trimmedEmail = email?.trim()


    if (!trimmedName || trimmedName.length < 1 || trimmedName.length > 100) {
      return NextResponse.json(
        { error: "Name is required and must be between 1 and 100 characters" },
        { status: 400 }
      )
    }


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


    const existing = await db.user.findUnique({ where: { email: trimmedEmail } })
    if (existing) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      )
    }


    const hashed = await bcrypt.hash(password, 12)


    const user = await db.user.create({
      data: { name: trimmedName, email: trimmedEmail, password: hashed },
    })


    return NextResponse.json(
      { message: "Account created!", userId: user.id },
      { status: 201 }
    )
  } catch (err) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

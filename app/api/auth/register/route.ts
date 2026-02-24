import { NextRequest, NextResponse } from "next/server"
import { db } from "@/app/lib/db"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      )
    }

    const hashed = await bcrypt.hash(password, 12)

    const user = await db.user.create({
      data: { name, email, password: hashed },
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
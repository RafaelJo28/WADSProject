import { NextRequest, NextResponse } from "next/server"
import { db } from "@/app/lib/db"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

function getUserFromToken(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  if (!token) return null
  try {
    return jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { userId: string }
  } catch {
    return null
  }
}

export async function PUT(req: NextRequest) {
  const tokenUser = getUserFromToken(req)
  if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name, currentPassword, newPassword } = await req.json()

  const user = await db.user.findUnique({ where: { id: tokenUser.userId } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const valid = await bcrypt.compare(currentPassword, user.password)
  if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })

  const updateData: any = { name }
  if (newPassword) {
    updateData.password = await bcrypt.hash(newPassword, 12)
  }

  await db.user.update({ where: { id: user.id }, data: updateData })

  return NextResponse.json({ message: "Profile updated!" })
}
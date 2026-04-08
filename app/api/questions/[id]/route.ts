import { NextRequest, NextResponse } from "next/server"
import { db } from "@/app/lib/db"
import jwt from "jsonwebtoken"


function getUserFromToken(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  if (!token) return null
  try {
    return jwt.verify(token, process.env.NEXTAUTH_SECRET!) as {
      userId: string
    }
  } catch {
    return null
  }
}


export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromToken(req)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })


  const { id } = await params
  const trimmedId = id?.trim()


  if (!trimmedId || trimmedId.length < 1 || trimmedId.length > 100) {
    return NextResponse.json({ error: "Invalid question ID" }, { status: 400 })
  }


  try {
    const question = await db.question.findFirst({
      where: { id: trimmedId, userId: user.userId },
      include: { answer: true },
    })


    if (!question) return NextResponse.json({ error: "Question not found" }, { status: 404 })


    return NextResponse.json(question)
  } catch {
    return NextResponse.json({ error: "Question not found" }, { status: 404 })
  }
}


export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromToken(req)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })


  const { id } = await params
  const trimmedId = id?.trim()


  if (!trimmedId || trimmedId.length < 1 || trimmedId.length > 100) {
    return NextResponse.json({ error: "Invalid question ID" }, { status: 400 })
  }


  try {
    await db.followUp.deleteMany({ where: { questionId: trimmedId } })
    await db.answer.deleteMany({ where: { questionId: trimmedId } })
    await db.question.delete({ where: { id: trimmedId, userId: user.userId } })
    return NextResponse.json({ message: "Question deleted successfully" })
  } catch {
    return NextResponse.json({ error: "Question not found" }, { status: 404 })
  }
}


export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromToken(req)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })


  const { id } = await params


  try {
    const { content } = await req.json()


    await db.question.update({
      where: { id, userId: user.userId },
      data: { content },
    })


    return NextResponse.json({ message: "Question updated successfully" })
  } catch {
    return NextResponse.json({ error: "Question not found" }, { status: 404 })
  }
}

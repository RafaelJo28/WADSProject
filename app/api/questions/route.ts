import { NextRequest, NextResponse } from "next/server"
import { db } from "@/app/lib/db"
import jwt from "jsonwebtoken"
import Groq from "groq-sdk"

function getUserFromToken(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  if (!token) return null
  try {
    return jwt.verify(token, process.env.NEXTAUTH_SECRET!) as {
      userId: string
      email: string
      role: string
    }
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const user = getUserFromToken(req)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const questions = await db.question.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: "desc" },
    include: { answer: true },
  })

  return NextResponse.json(questions)
}

export async function POST(req: NextRequest) {
  const user = getUserFromToken(req)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { content, subject } = await req.json()

    if (!content || !subject) {
      return NextResponse.json({ error: "Content and subject are required" }, { status: 400 })
    }

    const question = await db.question.create({
      data: { content, subject, userId: user.userId, status: "pending" },
    })

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `You are a helpful homework tutor. A student has asked the following ${subject} question:

"${content}"

Please provide a clear, step-by-step explanation to help the student understand the solution.
Format your response with numbered steps. Be encouraging and educational.`,
      }],
    })

    const aiAnswer = completion.choices[0].message.content ?? ""

    await db.answer.create({ data: { content: aiAnswer, questionId: question.id } })
    await db.question.update({ where: { id: question.id }, data: { status: "answered" } })

    return NextResponse.json({ id: question.id }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
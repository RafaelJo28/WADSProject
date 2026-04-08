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


    const trimmedContent = content?.trim()
    const trimmedSubject = subject?.trim()


    if (!trimmedContent || trimmedContent.length < 1 || trimmedContent.length > 10000) {
      return NextResponse.json({ error: "Content is required and must be between 1 and 10000 characters" }, { status: 400 })
    }


    if (!trimmedSubject || trimmedSubject.length < 1 || trimmedSubject.length > 100) {
      return NextResponse.json({ error: "Subject is required and must be between 1 and 100 characters" }, { status: 400 })
    }


    const question = await db.question.create({
      data: { content: trimmedContent, subject: trimmedSubject, userId: user.userId, status: "pending" },
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
    const errorMessage = err instanceof Error ? err.message : String(err)
    const errorStack = err instanceof Error ? err.stack : ""
    console.error("❌ Error in POST /api/questions:", errorMessage)
    console.error("Stack:", errorStack)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

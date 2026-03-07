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
    }
  } catch {
    return null
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromToken(req)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  try {
    const followUps = await db.followUp.findMany({
      where: { questionId: id },
      orderBy: { createdAt: "asc" },
    })
    return NextResponse.json(followUps)
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromToken(req)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  try {
    const body = await req.json()
    const { question } = body

    if (!question || question.trim() === "") {
      return NextResponse.json({ error: "Missing required field: question" }, { status: 400 })
    }

    const parent = await db.question.findFirst({
      where: { id, userId: user.userId },
      include: { answer: true },
    })

    if (!parent) return NextResponse.json({ error: "Question not found" }, { status: 404 })

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `A student was studying this question: "${parent.content}"
          
The AI gave this explanation: "${parent.answer?.content}"

The student now asks: "${question}"

Please answer this follow-up clearly and helpfully.`,
        },
      ],
    })

    const answer = completion.choices[0].message.content ?? ""

    const followUp = await db.followUp.create({
      data: { question, answer, questionId: id },
    })

    return NextResponse.json(followUp, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
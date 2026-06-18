// Follow-up route supports thread-style follow-up questions for a specific question.
// It validates the user, rate-limits follow-up submissions, and uses the AI completion service.
import { NextRequest, NextResponse } from "next/server"
import { followUpLimiter, applyRateLimit } from "@/app/lib/rateLimiter"
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

  const rateLimitResponse = await applyRateLimit(followUpLimiter, user.userId, req)
  if (rateLimitResponse) return rateLimitResponse

  const { id } = await params
  const trimmedId = id?.trim()

  if (!trimmedId || trimmedId.length < 1 || trimmedId.length > 100) {
    return NextResponse.json({ error: "Invalid question ID" }, { status: 400 })
  }

  try {
    const body = await req.json()
    const { question } = body

    const trimmedQuestion = question?.trim()

    if (!trimmedQuestion || trimmedQuestion.length < 1 || trimmedQuestion.length > 10000) {
      return NextResponse.json({ error: "Question is required and must be between 1 and 10000 characters" }, { status: 400 })
    }

    const parent = await db.question.findFirst({
      where: { id: trimmedId, userId: user.userId },
      include: { answer: true },
    })

    if (!parent) return NextResponse.json({ error: "Question not found" }, { status: 404 })

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `A student was studying this question in the subject "${parent.subject}": "${parent.content}"
         
The AI gave this explanation: "${parent.answer?.content}"

The student now asks a follow-up: "${trimmedQuestion}"

IMPORTANT: First, check if this follow-up question is related to the subject "${parent.subject}".
- If the follow-up question does NOT fall under "${parent.subject}", start your response with: "This question doesn't fall under ${parent.subject}."
- If the follow-up question DOES relate to the subject, proceed normally.

After the subject check, please answer this follow-up clearly and helpfully.`,
        },
      ],
    })

    const answer = completion.choices[0].message.content ?? ""

    const followUp = await db.followUp.create({
      data: { question: trimmedQuestion, answer, questionId: trimmedId },
    })

    return NextResponse.json(followUp, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from "next/server"
import { ocrLimiter, applyRateLimit } from "@/app/lib/rateLimiter"
import { createWorker } from "tesseract.js"
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


export async function POST(req: NextRequest) {

  const user = getUserFromToken(req)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const rateLimitResponse = await applyRateLimit(ocrLimiter, user.userId, req)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const formData = await req.formData()
    const file = formData.get("image") as File

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const worker = await createWorker("eng")
    const { data: { text } } = await worker.recognize(buffer)
    await worker.terminate()

    return NextResponse.json({ text: text.trim() })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "OCR failed" }, { status: 500 })
  }
}
// OCR route: validates the authenticated user, applies per-user rate limiting,
// verifies uploaded image metadata, and performs text extraction with Tesseract.
import { NextRequest, NextResponse } from "next/server"
import { ocrLimiter, applyRateLimit } from "@/app/lib/rateLimiter"
import { createWorker } from "tesseract.js"
import jwt from "jsonwebtoken"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

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

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      )
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
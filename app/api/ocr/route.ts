import { NextRequest, NextResponse } from "next/server"
import { createWorker } from "tesseract.js"
import { rateLimit } from "@/app/lib/rateLimit"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown"
  const limit = rateLimit(ip, { maxRequests: 20, windowMs: 60 * 1000 })

  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many uploads. Please wait a moment before trying again." },
      { status: 429 }
    )
  }

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
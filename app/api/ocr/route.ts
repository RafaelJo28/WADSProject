import { NextRequest, NextResponse } from "next/server"
import { createWorker } from "tesseract.js"

export async function POST(req: NextRequest) {
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
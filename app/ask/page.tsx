"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Navbar from "../components/Navbar"
import Stars from "../components/Stars"

const SUBJECTS = ["Math", "Science", "Physics", "Chemistry", "Biology", "History", "English", "Computer Science", "Other"]

export default function AskPage() {
  const router = useRouter()
  const [form, setForm] = useState({ content: "", subject: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [ocrDone, setOcrDone] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
    setOcrLoading(true)
    setOcrDone(false)
    try {
      const Tesseract = (await import("tesseract.js")).default
      const { data: { text } } = await Tesseract.recognize(file, "eng")
      setForm(f => ({ ...f, content: text.trim() }))
      setOcrDone(true)
    } catch (err) {
      console.error(err)
      setError("OCR failed. Please type your question manually.")
    } finally {
      setOcrLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const text = await res.text()
    const data = text ? JSON.parse(text) : {}
    setLoading(false)
    if (!res.ok) {
      setError(data.error || "Something went wrong")
    } else {
      router.push(`/question/${data.id}`)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 0%, #0d0520 0%, #060010 60%, #000000 100%)" }}>

      <Stars count={60} />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, #ec4899, transparent)" }} />
      </div>

      <Navbar active="Ask" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-purple-400 text-xs tracking-widest uppercase mb-2">New Question</p>
          <h1 className="text-4xl font-black text-white" style={{ fontFamily: "var(--font-orbitron)" }}>
            Ask Orbot
          </h1>
          <p className="text-gray-500 mt-2">Type your question or upload a photo of your homework</p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-2xl border border-purple-900/30 backdrop-blur-sm p-8 space-y-6"
          style={{ background: "rgba(15, 5, 40, 0.7)" }}>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-3">Subject</label>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map(s => (
                <button key={s} type="button" onClick={() => setForm({ ...form, subject: s })}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105"
                  style={form.subject === s ? {
                    background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                    color: "white",
                    boxShadow: "0 0 15px rgba(124, 58, 237, 0.4)",
                  } : {
                    background: "rgba(255,255,255,0.05)",
                    color: "#a78bfa",
                    border: "1px solid rgba(124, 58, 237, 0.3)",
                  }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-3">
              📷 Upload Homework Photo <span className="text-gray-600">(optional)</span>
            </label>
            <div onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-purple-900/50 rounded-xl p-6 text-center cursor-pointer transition-all hover:border-purple-500/50 hover:bg-purple-900/10">
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="max-h-48 mx-auto rounded-lg object-contain" />
              ) : (
                <div>
                  <p className="text-4xl mb-2">📸</p>
                  <p className="text-sm text-gray-500">Click to upload a photo of your homework</p>
                  <p className="text-xs text-gray-600 mt-1">JPG, PNG supported</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

            {ocrLoading && (
              <div className="mt-3 flex items-center gap-2 text-sm text-purple-400">
                <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                Reading text from image...
              </div>
            )}
            {ocrDone && (
              <p className="mt-3 text-sm text-green-400 font-medium">
                ✅ Text extracted! Edit below if needed.
              </p>
            )}
          </div>

          {/* Question */}
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-3">Your Question</label>
            <textarea rows={6}
              placeholder="Type your homework question here..."
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-900/40 resize-none"
              style={{ background: "rgba(255,255,255,0.05)" }}
              required />
          </div>

          <button type="submit" disabled={loading || !form.subject}
            className="w-full py-4 rounded-xl font-bold text-white text-base transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50"
            style={{
              fontFamily: "var(--font-orbitron)",
              background: "linear-gradient(135deg, #7c3aed, #ec4899)",
              boxShadow: loading ? "none" : "0 0 30px rgba(124, 58, 237, 0.4)",
            }}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Orbot is thinking...
              </span>
            ) : "✨ Get Explanation"}
          </button>
        </form>
      </div>
    </div>
  )
}
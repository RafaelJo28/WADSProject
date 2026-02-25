"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import OrbotLogo from "../components/OrbotLogo"
import Stars from "../components/Stars"

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data.error)
    } else {
      router.push("/login")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 50%, #0d0520 0%, #060010 60%, #000000 100%)" }}>

      <Stars count={60} />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, #ec4899, transparent)" }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="flex flex-col items-center mb-8">
          <OrbotLogo size={72} />
          <h1 className="text-white font-black text-3xl mt-3 tracking-wide"
            style={{ fontFamily: "var(--font-orbitron)" }}>
            Orbot
          </h1>
          <p className="text-purple-300 text-sm mt-1 tracking-widest uppercase">Create Account</p>
        </div>

        <div className="rounded-2xl p-8 border border-purple-900/40 backdrop-blur-md"
          style={{ background: "rgba(15, 5, 40, 0.85)" }}>

          {error && (
            <div className="bg-red-900/30 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">Full Name</label>
              <input type="text" placeholder="John Doe" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-900/40"
                style={{ background: "rgba(255,255,255,0.05)" }} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">Email</label>
              <input type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-900/40"
                style={{ background: "rgba(255,255,255,0.05)" }} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">Password</label>
              <input type="password" placeholder="Enter your password here" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-900/40"
                style={{ background: "rgba(255,255,255,0.05)" }} required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 mt-2"
              style={{
                fontFamily: "var(--font-orbitron)",
                background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                boxShadow: "0 0 30px rgba(124, 58, 237, 0.4)",
              }}>
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
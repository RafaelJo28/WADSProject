"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "../components/Navbar"
import Stars from "../components/Stars"
import OrbotLogo from "../components/OrbotLogo"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null)
  const [form, setForm] = useState({ name: "", currentPassword: "", newPassword: "" })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [questionCount, setQuestionCount] = useState(0)

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (!stored) { router.push("/login"); return }
    const u = JSON.parse(stored)
    setUser(u)
    setForm(f => ({ ...f, name: u.name }))
    fetchStats()
  }, [])

  const fetchStats = async () => {
    const res = await fetch("/api/questions")
    if (res.ok) setQuestionCount((await res.json()).length)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    const res = await fetch("/api/users/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data.error)
    } else {
      setSuccess("Profile updated successfully!")
      const updated = { ...user, name: form.name }
      localStorage.setItem("user", JSON.stringify(updated))
      setUser(updated as any)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 0%, #0d0520 0%, #060010 60%, #000000 100%)" }}>

      <Stars count={60} />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/3 w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, #ec4899, transparent)" }} />
      </div>

      <Navbar active="Profile" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-10 space-y-6">
        <div>
          <p className="text-purple-400 text-xs tracking-widest uppercase mb-2">Account</p>
          <h1 className="text-4xl font-black text-white" style={{ fontFamily: "var(--font-orbitron)" }}>
            Profile
          </h1>
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl border border-purple-900/30 backdrop-blur-sm p-6 flex items-center gap-6"
          style={{ background: "rgba(15, 5, 40, 0.7)" }}>
          <div className="relative">
            <OrbotLogo size={72} clickable={false} />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <p className="text-purple-400 text-sm mt-1 font-medium">{questionCount} questions asked</p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="rounded-2xl border border-purple-900/30 backdrop-blur-sm p-8"
          style={{ background: "rgba(15, 5, 40, 0.7)" }}>
          <h3 className="text-lg font-bold text-white mb-6" style={{ fontFamily: "var(--font-orbitron)" }}>
            Edit Profile
          </h3>

          {success && (
            <div className="bg-green-900/30 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl mb-6 text-sm">
              {success}
            </div>
          )}
          {error && (
            <div className="bg-red-900/30 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">Display Name</label>
              <input type="text" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-900/40"
                style={{ background: "rgba(255,255,255,0.05)" }} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">Current Password</label>
              <input type="password" placeholder="Enter current password to make changes"
                value={form.currentPassword}
                onChange={e => setForm({ ...form, currentPassword: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-900/40"
                style={{ background: "rgba(255,255,255,0.05)" }} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">
                New Password <span className="text-gray-600">(leave blank to keep current)</span>
              </label>
              <input type="password" placeholder="Enter new password here"
                value={form.newPassword}
                onChange={e => setForm({ ...form, newPassword: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-900/40"
                style={{ background: "rgba(255,255,255,0.05)" }} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50"
              style={{
                fontFamily: "var(--font-orbitron)",
                background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                boxShadow: "0 0 30px rgba(124, 58, 237, 0.4)",
              }}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
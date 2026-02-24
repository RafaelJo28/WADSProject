"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "../components/Navbar"
import Stars from "../components/Stars"

interface Question {
  id: string
  content: string
  subject: string
  status: string
  createdAt: string
}

export default function HistoryPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [saving, setSaving] = useState(false)
  const [bookmarks, setBookmarks] = useState<string[]>([])
  const [showBookmarked, setShowBookmarked] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (!stored) { router.push("/login"); return }
    fetchQuestions()
    const savedBookmarks = localStorage.getItem("bookmarks")
    if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks))
  }, [])

  const fetchQuestions = async () => {
    const res = await fetch("/api/questions")
    if (res.ok) setQuestions(await res.json())
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return
    setDeleting(id)
    const res = await fetch(`/api/questions/${id}`, { method: "DELETE" })
    if (res.ok) {
      setQuestions(prev => prev.filter(q => q.id !== id))
      const newBookmarks = bookmarks.filter(b => b !== id)
      setBookmarks(newBookmarks)
      localStorage.setItem("bookmarks", JSON.stringify(newBookmarks))
    }
    setDeleting(null)
  }

  const toggleBookmark = (id: string) => {
    const newBookmarks = bookmarks.includes(id)
      ? bookmarks.filter(b => b !== id)
      : [...bookmarks, id]
    setBookmarks(newBookmarks)
    localStorage.setItem("bookmarks", JSON.stringify(newBookmarks))
  }

  const startEdit = (q: Question) => { setEditing(q.id); setEditValue(q.content) }
  const cancelEdit = () => { setEditing(null); setEditValue("") }

  const saveEdit = async (id: string) => {
    if (!editValue.trim()) return
    setSaving(true)
    const res = await fetch(`/api/questions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editValue }),
    })
    if (res.ok) {
      setQuestions(prev => prev.map(q => q.id === id ? { ...q, content: editValue } : q))
      setEditing(null)
    }
    setSaving(false)
  }

  const filtered = questions.filter(q => {
    const matchesSearch = q.content.toLowerCase().includes(search.toLowerCase()) ||
      q.subject.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === "all" || q.status === filter
    const matchesBookmark = showBookmarked ? bookmarks.includes(q.id) : true
    return matchesSearch && matchesFilter && matchesBookmark
  })

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 0%, #0d0520 0%, #060010 60%, #000000 100%)" }}>

      <Stars count={60} />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
      </div>

      <Navbar active="History" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-purple-400 text-xs tracking-widest uppercase mb-2">Archive</p>
            <h1 className="text-4xl font-black text-white" style={{ fontFamily: "var(--font-orbitron)" }}>
              History
            </h1>
          </div>
          <button onClick={() => setShowBookmarked(!showBookmarked)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
            style={showBookmarked ? {
              background: "linear-gradient(135deg, #eab308, #f59e0b)",
              color: "white",
            } : {
              background: "rgba(255,255,255,0.05)",
              color: "#a78bfa",
              border: "1px solid rgba(124, 58, 237, 0.3)",
            }}>
            {showBookmarked ? "⭐ Bookmarked" : "☆ Bookmarks"}
            {bookmarks.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-purple-900/50 text-purple-300">
                {bookmarks.length}
              </span>
            )}
          </button>
        </div>
        <p className="text-gray-500 mb-8">All your submitted questions</p>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <input type="text" placeholder="Search questions..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-900/40"
            style={{ background: "rgba(255,255,255,0.05)" }} />
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-900/40"
            style={{ background: "rgba(15, 5, 40, 0.9)" }}>
            <option value="all">All</option>
            <option value="answered">Answered</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-purple-900/30 backdrop-blur-sm overflow-hidden"
          style={{ background: "rgba(15, 5, 40, 0.7)" }}>
          {loading ? (
            <p className="text-gray-500 text-sm p-6">Loading...</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">{showBookmarked ? "⭐" : "🔍"}</p>
              <p className="text-gray-500">{showBookmarked ? "No bookmarked questions yet." : "No questions found."}</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-purple-900/20">
                  <th className="px-4 py-4 text-gray-500 font-medium w-8"></th>
                  <th className="px-6 py-4 text-gray-500 font-medium">Question</th>
                  <th className="px-6 py-4 text-gray-500 font-medium">Subject</th>
                  <th className="px-6 py-4 text-gray-500 font-medium">Status</th>
                  <th className="px-6 py-4 text-gray-500 font-medium">Date</th>
                  <th className="px-6 py-4 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(q => (
                  <tr key={q.id} className="border-b border-purple-900/10 hover:bg-purple-900/10 transition-colors">
                    <td className="px-4 py-4">
                      <button onClick={() => toggleBookmark(q.id)}
                        className="text-xl hover:scale-110 transition-transform">
                        {bookmarks.includes(q.id) ? "⭐" : "☆"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-gray-300 max-w-xs">
                      {editing === q.id ? (
                        <input type="text" value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          className="border border-purple-500 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 text-white w-full"
                          style={{ background: "rgba(255,255,255,0.08)" }}
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === "Enter") saveEdit(q.id)
                            if (e.key === "Escape") cancelEdit()
                          }} />
                      ) : (
                        <span className="truncate block max-w-xs">{q.content}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-3 py-1 rounded-full border border-purple-700/50 text-purple-300"
                        style={{ background: "rgba(124, 58, 237, 0.15)" }}>
                        {q.subject}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        q.status === "answered"
                          ? "bg-pink-900/30 text-pink-400 border border-pink-700/30"
                          : "bg-blue-900/30 text-blue-400 border border-blue-700/30"
                      }`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-xs">
                      {new Date(q.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {editing === q.id ? (
                        <div className="flex items-center gap-3">
                          <button onClick={() => saveEdit(q.id)} disabled={saving}
                            className="text-green-400 hover:text-green-300 font-medium disabled:opacity-50">
                            {saving ? "Saving..." : "Save"}
                          </button>
                          <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-300 font-medium">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Link href={`/question/${q.id}`} className="text-purple-400 hover:text-purple-300 font-medium">
                            View
                          </Link>
                          <button onClick={() => startEdit(q)} className="text-yellow-500 hover:text-yellow-300 font-medium">
                            Rename
                          </button>
                          <button onClick={() => handleDelete(q.id)} disabled={deleting === q.id}
                            className="text-red-500 hover:text-red-300 font-medium disabled:opacity-50">
                            {deleting === q.id ? "..." : "Delete"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
"use client"

// Dashboard page: displays the current user's recent questions, lets them filter/bookmark
// questions, and provides a quick path to submit a new request.
import { useEffect, useState, useRef } from "react"
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

const SUBJECTS = ["Math", "Science", "Physics", "Chemistry", "Biology", "History", "English", "Computer Science", "Other"]

export default function DashboardPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [showBookmarked, setShowBookmarked] = useState(false)
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [user] = useState<{ name: string; email: string } | null>(() => {
    if (typeof window === "undefined") return null
    const stored = localStorage.getItem("user")
    return stored ? JSON.parse(stored) : null
  })

  const bookmarkKey = user ? `bookmarks:${user.email}` : "bookmarks"

  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    if (typeof window === "undefined") return []
    const key = (() => {
      const stored = localStorage.getItem("user")
      const u = stored ? JSON.parse(stored) : null
      return u ? `bookmarks:${u.email}` : "bookmarks"
    })()
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const loadQuestions = async () => {
      const res = await fetch("/api/questions")
      if (res.ok) setQuestions(await res.json())
      setLoading(false)
    }

    void loadQuestions()
  }, [router, user])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSubjectDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const toggleBookmark = (id: string) => {
    const newBookmarks = bookmarks.includes(id) ? bookmarks.filter(b => b !== id) : [...bookmarks, id]
    setBookmarks(newBookmarks)
    localStorage.setItem(bookmarkKey, JSON.stringify(newBookmarks))
  }

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    )
  }

  const filtered = questions
    .filter(q => !showBookmarked || bookmarks.includes(q.id))
    .filter(q => selectedSubjects.length === 0 || selectedSubjects.includes(q.subject))

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 0%, #0d0520 0%, #060010 60%, #000000 100%)" }}>

      <Stars count={60} />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/3 w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
        <div className="absolute top-1/2 right-0 w-80 h-80 rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, #ec4899, transparent)" }} />
      </div>

      <Navbar active="Dashboard" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-10 space-y-3">
          <p className="text-purple-400 text-xs tracking-widest uppercase mb-2">Welcome back</p>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight" style={{ fontFamily: "var(--font-orbitron)" }}>
            {user?.name ?? "Student"} 👋
          </h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">What would you like to learn today?</p>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-10">
          {[
            { label: "Total Questions", value: questions.length, color: "text-purple-400" },
            { label: "Answered", value: questions.filter(q => q.status === "answered").length, color: "text-pink-400" },
            { label: "Pending", value: questions.filter(q => q.status === "pending").length, color: "text-blue-400" },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl p-6 border border-purple-900/30 backdrop-blur-sm"
              style={{ background: "rgba(15, 5, 40, 0.7)" }}>
              <p className="text-sm text-gray-500 mb-2">{stat.label}</p>
              <p className={`text-4xl font-black ${stat.color}`} style={{ fontFamily: "var(--font-orbitron)" }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-purple-900/30 backdrop-blur-sm overflow-hidden"
          style={{ background: "rgba(15, 5, 40, 0.7)" }}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-5 border-b border-purple-900/30">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-orbitron)" }}>
                Recent Questions
              </h2>
              <button onClick={() => setShowBookmarked(!showBookmarked)}
                className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all hover:scale-105"
                style={showBookmarked ? {
                  background: "linear-gradient(135deg, #eab308, #f59e0b)",
                  color: "white",
                } : {
                  background: "rgba(255,255,255,0.02)",
                  color: "#a78bfa",
                  border: "1px solid rgba(124, 58, 237, 0.15)",
                }}>
                {showBookmarked ? "⭐ Bookmarked" : "☆ Bookmarks"}
                {bookmarks.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-purple-900/50 text-purple-300">
                    {bookmarks.length}
                  </span>
                )}
              </button>
            </div>

            <Link href="/ask"
              className="w-full sm:w-auto px-4 py-2 rounded-xl text-sm font-bold text-white text-center transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                boxShadow: "0 0 20px rgba(124, 58, 237, 0.3)",
              }}>
              + Ask New
            </Link>
          </div>

          {loading ? (
            <p className="text-gray-500 text-sm p-6">Loading...</p>
          ) : questions.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">🤔</p>
              <p className="text-gray-500 mb-6">No questions yet. Ask your first one!</p>
              <Link href="/ask"
                className="px-6 py-3 rounded-xl text-sm font-bold text-white inline-block transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                Ask a Question
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-purple-900/20">
                  <th className="px-4 py-4 text-gray-500 font-medium w-8"></th>
                  <th className="px-6 py-4 text-gray-500 font-medium">Question</th>
                  <th className="px-6 py-4 text-gray-500 font-medium">
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setSubjectDropdownOpen(!subjectDropdownOpen)}
                        className="flex items-center gap-1 hover:text-purple-300 transition-colors"
                        style={selectedSubjects.length > 0 ? { color: "#a78bfa" } : {}}>
                        Subject
                        {selectedSubjects.length > 0 && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full font-bold bg-purple-900/60 text-purple-300 ml-1">
                            {selectedSubjects.length}
                          </span>
                        )}
                        <span className="text-xs ml-0.5">{subjectDropdownOpen ? "▲" : "▼"}</span>
                      </button>

                      {subjectDropdownOpen && (
                        <div className="absolute top-full left-0 mt-2 w-52 rounded-xl border border-purple-900/50 shadow-xl z-50 overflow-hidden"
                          style={{ background: "rgba(15, 5, 40, 0.97)" }}>
                          <div className="p-2">
                            {selectedSubjects.length > 0 && (
                              <button
                                onClick={() => setSelectedSubjects([])}
                                className="w-full text-left px-3 py-1.5 text-xs text-pink-400 hover:text-pink-300 transition-colors mb-1">
                                ✕ Clear filter
                              </button>
                            )}
                            {SUBJECTS.map(subject => (
                              <button
                                key={subject}
                                onClick={() => toggleSubject(subject)}
                                className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
                                style={selectedSubjects.includes(subject) ? {
                                  background: "rgba(124, 58, 237, 0.25)",
                                  color: "#c4b5fd",
                                } : {
                                  color: "#9ca3af",
                                }}
                                onMouseEnter={e => {
                                  if (!selectedSubjects.includes(subject))
                                    (e.currentTarget as HTMLElement).style.background = "rgba(124, 58, 237, 0.1)"
                                }}
                                onMouseLeave={e => {
                                  if (!selectedSubjects.includes(subject))
                                    (e.currentTarget as HTMLElement).style.background = "transparent"
                                }}>
                                <span className="text-xs w-4">{selectedSubjects.includes(subject) ? "✓" : ""}</span>
                                {subject}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-gray-500 font-medium">Status</th>
                  <th className="px-6 py-4 text-gray-500 font-medium">Date</th>
                  <th className="px-6 py-4 text-gray-500 font-medium"></th>
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
                    <td className="px-6 py-4 text-gray-300 max-w-xs truncate">{q.content}</td>
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
                      <Link href={`/question/${q.id}`}
                        className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                        View →
                      </Link>
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
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import ReactMarkdown from "react-markdown"
import Navbar from "../../components/Navbar"
import Stars from "../../components/Stars"

const MarkdownContent = ({ content }: { content: string }) => (
  <div className="text-gray-300 text-sm leading-7 max-w-none">
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="mb-4">{children}</p>,
        strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
        ol: ({ children }) => <ol className="list-decimal pl-6 space-y-2 mb-4">{children}</ol>,
        ul: ({ children }) => <ul className="list-disc pl-6 space-y-2 mb-4">{children}</ul>,
        li: ({ children }) => <li className="mb-1">{children}</li>,
        pre: ({ children }) => (
          <pre className="rounded-xl p-4 my-4 overflow-x-auto text-left font-mono text-sm leading-6 border border-purple-700/30"
            style={{ background: "rgba(30, 10, 60, 0.8)", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {children}
          </pre>
        ),
        code: ({ inline, children, ...props }: any) =>
          inline ? (
            <code className="px-2 py-0.5 rounded font-mono text-xs text-purple-300"
              style={{ background: "rgba(124, 58, 237, 0.2)" }}>
              {children}
            </code>
          ) : (
            <code className="block font-mono text-sm text-purple-200" style={{ whiteSpace: "pre-wrap" }}>
              {children}
            </code>
          ),
        h1: ({ children }) => <h1 className="text-xl font-bold text-white mb-3 mt-4">{children}</h1>,
        h2: ({ children }) => <h2 className="text-lg font-bold text-white mb-3 mt-4">{children}</h2>,
        h3: ({ children }) => <h3 className="text-md font-bold text-purple-300 mb-2 mt-3">{children}</h3>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-purple-500 pl-4 my-3 text-gray-400 italic">
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
)

export default function QuestionPage() {
  const { id } = useParams()
  const router = useRouter()
  const [question, setQuestion] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [followUp, setFollowUp] = useState("")
  const [replyingTo, setReplyingTo] = useState<{ label: string; content: string } | null>(null)
  const [followUps, setFollowUps] = useState<any[]>([])
  const [fuLoading, setFuLoading] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  useEffect(() => { fetchQuestion(); fetchFollowUps() }, [])

  const fetchQuestion = async () => {
    const res = await fetch(`/api/questions/${id}`)
    if (res.ok) setQuestion(await res.json())
    setLoading(false)
  }

  const fetchFollowUps = async () => {
    const res = await fetch(`/api/questions/${id}/followup`)
    if (res.ok) setFollowUps(await res.json())
  }

  const handleReply = (label: string, content: string) => {
    setReplyingTo({ label, content })
    setFollowUp("")
    setTimeout(() => {
      document.getElementById("followup-input")?.focus()
      document.getElementById("followup-section")?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  const handleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!followUp.trim()) return
    setFuLoading(true)
    const fullQuestion = replyingTo
      ? `[Replying to ${replyingTo.label}]: "${replyingTo.content.slice(0, 200)}"\n\n${followUp}`
      : followUp
    const res = await fetch(`/api/questions/${id}/followup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: fullQuestion }),
    })
    if (res.ok) { setFollowUp(""); setReplyingTo(null); fetchFollowUps() }
    setFuLoading(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: "#060010" }}>
      <div className="flex items-center gap-3 text-purple-400">
        <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
        Loading...
      </div>
    </div>
  )

  if (!question) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#060010" }}>
      <p className="text-gray-500">Question not found.</p>
    </div>
  )

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 0%, #0d0520 0%, #060010 60%, #000000 100%)" }}>

      <Stars count={40} />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
      </div>

      <Navbar />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-10 space-y-6">
        <button onClick={() => router.push("/dashboard")}
          className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
          ← Back to Dashboard
        </button>

        {/* Question Card */}
        <div className="rounded-2xl border border-purple-900/30 backdrop-blur-sm p-6"
          style={{ background: "rgba(15, 5, 40, 0.7)" }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs px-3 py-1 rounded-full border border-purple-700/50 text-purple-300"
              style={{ background: "rgba(124, 58, 237, 0.15)" }}>
              {question.subject}
            </span>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-pink-900/30 text-pink-400 border border-pink-700/30">
              {question.status}
            </span>
          </div>
          <h2 className="text-lg font-semibold text-white">{question.content}</h2>
          <p className="text-xs text-gray-600 mt-2">
            Asked on {new Date(question.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* AI Answer */}
        {question.answer && (
          <div className="rounded-2xl border border-purple-900/30 backdrop-blur-sm p-6 relative"
            style={{ background: "rgba(15, 5, 40, 0.7)" }}
            onMouseEnter={() => setHoveredId("ai-answer")}
            onMouseLeave={() => setHoveredId(null)}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md font-bold text-purple-400">✨ Orbot's Explanation</h3>
              {hoveredId === "ai-answer" && (
                <button onClick={() => handleReply("AI Explanation", question.answer.content)}
                  className="text-xs px-3 py-1 rounded-full font-medium transition-all hover:scale-105"
                  style={{ background: "rgba(124, 58, 237, 0.2)", color: "#a78bfa", border: "1px solid rgba(124, 58, 237, 0.3)" }}>
                  ↩ Reply
                </button>
              )}
            </div>
            <MarkdownContent content={question.answer.content} />
          </div>
        )}

        {/* Follow-up Thread */}
        {followUps.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-md font-bold text-gray-400">💬 Follow-up Thread</h3>
            {followUps.map((fu: any, index: number) => (
              <div key={fu.id} className="space-y-2">
                <div className="rounded-xl p-4 border border-purple-700/20"
                  style={{ background: "rgba(124, 58, 237, 0.1)" }}>
                  {fu.question.startsWith("[Replying to") && (
                    <div className="border-l-4 border-purple-500/50 pl-3 mb-2 text-xs text-purple-500 italic">
                      {fu.question.split("\n\n")[0]}
                    </div>
                  )}
                  <p className="text-sm font-medium text-purple-300">
                    You: {fu.question.includes("\n\n") ? fu.question.split("\n\n")[1] : fu.question}
                  </p>
                </div>
                <div className="rounded-xl border border-purple-900/30 p-4 relative"
                  style={{ background: "rgba(15, 5, 40, 0.7)" }}
                  onMouseEnter={() => setHoveredId(fu.id)}
                  onMouseLeave={() => setHoveredId(null)}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600 font-medium">Orbot #{index + 1}</span>
                    {hoveredId === fu.id && (
                      <button onClick={() => handleReply(`Orbot #${index + 1}`, fu.answer)}
                        className="text-xs px-3 py-1 rounded-full font-medium transition-all hover:scale-105"
                        style={{ background: "rgba(124, 58, 237, 0.2)", color: "#a78bfa", border: "1px solid rgba(124, 58, 237, 0.3)" }}>
                        ↩ Reply
                      </button>
                    )}
                  </div>
                  <MarkdownContent content={fu.answer} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Follow-up Input */}
        <div id="followup-section" className="rounded-2xl border border-purple-900/30 backdrop-blur-sm p-6"
          style={{ background: "rgba(15, 5, 40, 0.7)" }}>
          <h3 className="text-md font-bold text-white mb-4">🤔 Ask a follow-up</h3>

          {replyingTo && (
            <div className="mb-4 border-l-4 border-purple-500 pl-4 rounded-r-xl py-3 pr-3"
              style={{ background: "rgba(124, 58, 237, 0.1)" }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-purple-400">↩ Replying to: {replyingTo.label}</span>
                <button onClick={() => setReplyingTo(null)} className="text-xs text-gray-600 hover:text-gray-400">✕</button>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2">{replyingTo.content.slice(0, 150)}...</p>
            </div>
          )}

          <form onSubmit={handleFollowUp} className="space-y-3">
            <textarea id="followup-input" rows={3}
              placeholder={replyingTo ? `Ask about "${replyingTo.label}"...` : "Ask a follow-up question..."}
              value={followUp}
              onChange={e => setFollowUp(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-900/40 resize-none"
              style={{ background: "rgba(255,255,255,0.05)" }} />
            <button type="submit" disabled={fuLoading}
              className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all duration-300 hover:scale-105 disabled:opacity-50"
              style={{
                fontFamily: "var(--font-orbitron)",
                background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                boxShadow: "0 0 20px rgba(124, 58, 237, 0.3)",
              }}>
              {fuLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Orbot is thinking...
                </span>
              ) : replyingTo ? "↩ Send Reply" : "Send Follow-up"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
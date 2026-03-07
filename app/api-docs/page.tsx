"use client"

import { useEffect, useState } from "react"
import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"

export default function ApiDocsPage() {
  const [spec, setSpec] = useState(null)

  useEffect(() => {
    fetch("/api/swagger")
      .then(res => res.json())
      .then(data => setSpec(data))
  }, [])

  if (!spec) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: "#060010" }}>
      <p className="text-purple-400">Loading API docs...</p>
    </div>
  )

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh" }}>
      {/* Header */}
      <div className="px-6 py-4 flex items-center gap-3"
        style={{ background: "#0d0520", borderBottom: "1px solid rgba(124, 58, 237, 0.3)" }}>
        <h1 className="text-white font-black text-xl"
          style={{ fontFamily: "var(--font-orbitron)" }}>
          🔮 Orbot API Documentation
        </h1>
        <span className="text-xs px-3 py-1 rounded-full text-purple-300"
          style={{ background: "rgba(124, 58, 237, 0.15)", border: "1px solid rgba(124, 58, 237, 0.5)" }}>
          v1.0.0
        </span>
      </div>

      {/* Swagger UI on white background */}
      <div style={{ background: "#ffffff" }}>
        <SwaggerUI spec={spec} />
      </div>

      <style>{`
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info { margin: 30px 0; }
        .swagger-ui .info .title { color: #1a1a2e; }
        .swagger-ui .scheme-container { background: #f8f8f8; padding: 15px; }
      `}</style>
    </div>
  )
}
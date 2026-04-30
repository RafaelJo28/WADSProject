"use client"

import { useEffect, useState } from "react"

export default function Stars({ count = 60 }: { count?: number }) {
  const [stars, setStars] = useState<any[]>([])

  useEffect(() => {
    setStars(Array.from({ length: count }, (_, i) => ({
      width: Math.random() * 2 + 1,
      height: Math.random() * 2 + 1,
      top: Math.random() * 100,
      left: Math.random() * 100,
      opacity: Math.random() * 0.5 + 0.1,
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 3,
    })))
  }, [count])

  if (stars.length === 0) return null

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {stars.map((s, i) => (
        <div key={i} className="absolute rounded-full bg-white" style={{
          width: s.width + "px",
          height: s.height + "px",
          top: s.top + "%",
          left: s.left + "%",
          opacity: s.opacity,
          animation: `twinkle ${s.duration}s ease-in-out infinite`,
          animationDelay: s.delay + "s",
        }} />
      ))}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  )
}
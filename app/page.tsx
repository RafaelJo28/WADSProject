"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import Stars from "./components/Stars"

export default function LandingPage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const auroraRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = auroraRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    window.addEventListener("resize", resize)
    let t = 0
    let animId: number
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const W = canvas.width, H = canvas.height
      const waves = [
        { y: H * 0.25, color1: "rgba(88, 28, 220, 0.35)", color2: "rgba(139, 92, 246, 0.15)", speed: 0.3, amp: 80 },
        { y: H * 0.35, color1: "rgba(168, 85, 247, 0.25)", color2: "rgba(236, 72, 153, 0.12)", speed: 0.2, amp: 60 },
        { y: H * 0.6, color1: "rgba(109, 40, 217, 0.3)", color2: "rgba(59, 130, 246, 0.1)", speed: 0.15, amp: 90 },
        { y: H * 0.7, color1: "rgba(196, 130, 255, 0.2)", color2: "rgba(167, 139, 250, 0.08)", speed: 0.25, amp: 70 },
      ]
      waves.forEach(wave => {
        ctx.beginPath()
        ctx.moveTo(0, H)
        for (let x = 0; x <= W; x += 4) {
          const y = wave.y + Math.sin(x * 0.005 + t * wave.speed) * wave.amp + Math.sin(x * 0.01 + t * wave.speed * 1.5) * (wave.amp * 0.4) + Math.sin(x * 0.002 + t * wave.speed * 0.7) * (wave.amp * 0.6)
          ctx.lineTo(x, y)
        }
        ctx.lineTo(W, H)
        ctx.closePath()
        const grad = ctx.createLinearGradient(0, wave.y - wave.amp, 0, wave.y + wave.amp * 2)
        grad.addColorStop(0, wave.color1)
        grad.addColorStop(0.5, wave.color2)
        grad.addColorStop(1, "rgba(0,0,0,0)")
        ctx.fillStyle = grad
        ctx.fill()
      })
      t += 0.008
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize) }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    window.addEventListener("resize", resize)
    let t = 0
    let animId: number

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const cx = canvas.width / 2
      const cy = canvas.height / 2
      const R = 155

      const glow = ctx.createRadialGradient(cx, cy, R * 0.5, cx, cy, R * 2.2)
      glow.addColorStop(0, "rgba(180, 80, 255, 0.08)")
      glow.addColorStop(0.4, "rgba(236, 72, 153, 0.05)")
      glow.addColorStop(1, "rgba(0,0,0,0)")
      ctx.beginPath()
      ctx.arc(cx, cy, R * 2.2, 0, Math.PI * 2)
      ctx.fillStyle = glow
      ctx.fill()

      const sphereGrad = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.05, cx, cy, R)
      sphereGrad.addColorStop(0, "rgba(100, 110, 140, 0.95)")
      sphereGrad.addColorStop(0.2, "rgba(40, 42, 60, 0.98)")
      sphereGrad.addColorStop(0.5, "rgba(15, 15, 25, 1)")
      sphereGrad.addColorStop(0.8, "rgba(8, 8, 18, 1)")
      sphereGrad.addColorStop(1, "rgba(20, 10, 40, 1)")
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.fillStyle = sphereGrad
      ctx.fill()

      const innerGlow = ctx.createRadialGradient(cx, cy - 20, 0, cx, cy, R * 0.7)
      innerGlow.addColorStop(0, "rgba(80, 160, 255, 0.25)")
      innerGlow.addColorStop(0.5, "rgba(120, 80, 255, 0.1)")
      innerGlow.addColorStop(1, "rgba(0,0,0,0)")
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.fillStyle = innerGlow
      ctx.fill()

      const highlight = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.35, 0, cx - R * 0.2, cy - R * 0.2, R * 0.55)
      highlight.addColorStop(0, "rgba(255, 255, 255, 0.18)")
      highlight.addColorStop(0.4, "rgba(180, 200, 255, 0.06)")
      highlight.addColorStop(1, "rgba(0,0,0,0)")
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.fillStyle = highlight
      ctx.fill()

      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, R - 2, 0, Math.PI * 2)
      ctx.clip()

      const hexR = R * 0.52
      const hexPulse = Math.sin(t * 2) * 0.15 + 0.85
      for (let seg = 0; seg < 6; seg++) {
        const a1 = (seg / 6) * Math.PI * 2 + t * 0.5
        const a2 = ((seg + 1) / 6) * Math.PI * 2 + t * 0.5
        const x1 = cx + Math.cos(a1) * hexR
        const y1 = cy + Math.sin(a1) * hexR
        const x2 = cx + Math.cos(a2) * hexR
        const y2 = cy + Math.sin(a2) * hexR
        const segGrad = ctx.createLinearGradient(x1, y1, x2, y2)
        if (seg % 2 === 0) {
          segGrad.addColorStop(0, `rgba(236, 72, 153, ${0.9 * hexPulse})`)
          segGrad.addColorStop(0.5, `rgba(255, 150, 220, ${hexPulse})`)
          segGrad.addColorStop(1, `rgba(236, 72, 153, ${0.9 * hexPulse})`)
        } else {
          segGrad.addColorStop(0, `rgba(96, 200, 255, ${0.9 * hexPulse})`)
          segGrad.addColorStop(0.5, `rgba(180, 240, 255, ${hexPulse})`)
          segGrad.addColorStop(1, `rgba(96, 200, 255, ${0.9 * hexPulse})`)
        }
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = segGrad
        ctx.lineWidth = 4 * hexPulse
        ctx.shadowColor = seg % 2 === 0 ? "rgba(236, 72, 153, 0.9)" : "rgba(96, 200, 255, 0.9)"
        ctx.shadowBlur = 18
        ctx.stroke()
        ctx.shadowBlur = 0

        const hexR2 = hexR * 0.72
        const x3 = cx + Math.cos(a1) * hexR2
        const y3 = cy + Math.sin(a1) * hexR2
        const x4 = cx + Math.cos(a2) * hexR2
        const y4 = cy + Math.sin(a2) * hexR2
        ctx.beginPath()
        ctx.moveTo(x3, y3)
        ctx.lineTo(x4, y4)
        ctx.strokeStyle = seg % 2 === 0 ? `rgba(255, 100, 180, ${0.5 * hexPulse})` : `rgba(100, 220, 255, ${0.5 * hexPulse})`
        ctx.lineWidth = 2
        ctx.shadowColor = seg % 2 === 0 ? "rgba(236, 72, 153, 0.6)" : "rgba(96, 200, 255, 0.6)"
        ctx.shadowBlur = 10
        ctx.stroke()
        ctx.shadowBlur = 0
      }
      ctx.restore()

      ctx.save()
      ctx.translate(cx, cy)
      const cageR = R + 18
      const cagePoints: [number, number][] = []
      const rows = 5
      for (let row = 0; row <= rows; row++) {
        const phi = (row / rows) * Math.PI
        const pointsInRow = row === 0 || row === rows ? 1 : Math.round(6 + row * 1.5)
        for (let p = 0; p < pointsInRow; p++) {
          const theta = (p / pointsInRow) * Math.PI * 2 + t * 0.2 + row * 0.3
          const x = cageR * Math.sin(phi) * Math.cos(theta)
          const y = cageR * Math.cos(phi)
          cagePoints.push([x, y])
        }
      }
      ctx.strokeStyle = "rgba(80, 70, 110, 0.55)"
      ctx.lineWidth = 0.8
      for (let i = 0; i < cagePoints.length; i++) {
        for (let j = i + 1; j < cagePoints.length; j++) {
          const dx = cagePoints[i][0] - cagePoints[j][0]
          const dy = cagePoints[i][1] - cagePoints[j][1]
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < cageR * 0.75) {
            ctx.beginPath()
            ctx.moveTo(cagePoints[i][0], cagePoints[i][1])
            ctx.lineTo(cagePoints[j][0], cagePoints[j][1])
            ctx.stroke()
          }
        }
      }
      ctx.restore()

      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(t * 0.3)
      ctx.scale(1, 0.28)
      const ringR = R + 35
      const ringGrad = ctx.createLinearGradient(-ringR, 0, ringR, 0)
      ringGrad.addColorStop(0, "rgba(220, 50, 150, 0)")
      ringGrad.addColorStop(0.25, "rgba(220, 50, 150, 0.85)")
      ringGrad.addColorStop(0.5, "rgba(255, 100, 200, 1)")
      ringGrad.addColorStop(0.75, "rgba(220, 50, 150, 0.85)")
      ringGrad.addColorStop(1, "rgba(220, 50, 150, 0)")
      ctx.beginPath()
      ctx.ellipse(0, 0, ringR, ringR, 0, 0, Math.PI * 2)
      ctx.strokeStyle = ringGrad
      ctx.lineWidth = 3.5
      ctx.shadowColor = "rgba(236, 72, 153, 0.8)"
      ctx.shadowBlur = 15
      ctx.stroke()
      ctx.restore()

      const crystals = [
        { angle: 0.3, dist: R * 1.85, size: 18, speed: 0.15 },
        { angle: 1.8, dist: R * 1.95, size: 14, speed: 0.12 },
        { angle: 3.5, dist: R * 1.8, size: 20, speed: 0.18 },
        { angle: 4.8, dist: R * 2.0, size: 12, speed: 0.14 },
        { angle: 5.8, dist: R * 1.75, size: 16, speed: 0.11 },
        { angle: 2.5, dist: R * 2.1, size: 10, speed: 0.16 },
      ]

      crystals.forEach((c, i) => {
        const angle = c.angle + t * c.speed
        const px = cx + Math.cos(angle) * c.dist
        const py = cy + Math.sin(angle) * c.dist * 0.5
        const s = c.size + Math.sin(t + i) * 2
        ctx.save()
        ctx.translate(px, py)
        ctx.rotate(angle + t * 0.3)
        const crystalGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 2)
        crystalGlow.addColorStop(0, "rgba(168, 85, 247, 0.3)")
        crystalGlow.addColorStop(1, "rgba(0,0,0,0)")
        ctx.beginPath()
        ctx.arc(0, 0, s * 2, 0, Math.PI * 2)
        ctx.fillStyle = crystalGlow
        ctx.fill()
        ctx.beginPath()
        ctx.moveTo(0, -s)
        ctx.lineTo(s * 0.6, -s * 0.3)
        ctx.lineTo(s * 0.6, s * 0.5)
        ctx.lineTo(0, s)
        ctx.lineTo(-s * 0.6, s * 0.5)
        ctx.lineTo(-s * 0.6, -s * 0.3)
        ctx.closePath()
        const crystalGrad = ctx.createLinearGradient(-s, -s, s, s)
        crystalGrad.addColorStop(0, "rgba(120, 80, 180, 0.9)")
        crystalGrad.addColorStop(0.5, "rgba(60, 30, 100, 0.95)")
        crystalGrad.addColorStop(1, "rgba(30, 10, 60, 0.9)")
        ctx.fillStyle = crystalGrad
        ctx.fill()
        ctx.strokeStyle = "rgba(180, 120, 255, 0.6)"
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0, -s)
        ctx.lineTo(0, s)
        ctx.strokeStyle = "rgba(200, 150, 255, 0.3)"
        ctx.lineWidth = 0.5
        ctx.stroke()
        ctx.restore()
      })

      t += 0.018
      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize) }
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 50%, #0d0520 0%, #060010 60%, #000000 100%)" }}>

      <canvas ref={auroraRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      <Stars count={80} />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 gap-0">
        <p className="text-purple-300 text-xs font-semibold tracking-[0.3em] uppercase mb-4">
          AI-Powered Learning
        </p>
        <h1 className="font-black text-white leading-none mb-2"
          style={{ fontFamily: "var(--font-orbitron)", fontSize: "clamp(2.5rem, 7vw, 5.5rem)" }}>
          Homework
        </h1>
        <h1 className="font-black leading-none"
          style={{
            fontFamily: "var(--font-orbitron)",
            fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
            background: "linear-gradient(90deg, #c084fc, #f472b6, #818cf8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
          Assistant
        </h1>

        <div style={{ height: "440px" }} />

        <p className="text-gray-400 text-base max-w-sm leading-relaxed mb-6">
          Get instant step-by-step explanations for any homework question
        </p>

        <button
          onClick={() => router.push("/login")}
          className="group px-12 py-4 rounded-full font-bold text-white text-lg transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            fontFamily: "var(--font-orbitron)",
            background: "linear-gradient(135deg, #7c3aed, #ec4899, #3b82f6)",
            boxShadow: "0 0 40px rgba(168, 85, 247, 0.6), 0 0 80px rgba(168, 85, 247, 0.2)",
          }}
        >
          Get Started →
        </button>
      </div>
    </div>
  )
}
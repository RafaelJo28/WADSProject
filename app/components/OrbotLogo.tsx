"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

export default function OrbotLogo({ size = 40, clickable = true }: { size?: number, clickable?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    canvas.width = size
    canvas.height = size
    let t = 0
    let animId: number

    const draw = () => {
      ctx.clearRect(0, 0, size, size)
      const cx = size / 2
      const cy = size / 2
      const R = size * 0.38

      // Glow
      const glow = ctx.createRadialGradient(cx, cy, R * 0.3, cx, cy, R * 1.8)
      glow.addColorStop(0, "rgba(168, 85, 247, 0.2)")
      glow.addColorStop(1, "rgba(0,0,0,0)")
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.8, 0, Math.PI * 2)
      ctx.fillStyle = glow
      ctx.fill()

      // Dark sphere
      const sphereGrad = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.05, cx, cy, R)
      sphereGrad.addColorStop(0, "rgba(100, 110, 140, 0.95)")
      sphereGrad.addColorStop(0.2, "rgba(40, 42, 60, 0.98)")
      sphereGrad.addColorStop(0.6, "rgba(15, 15, 25, 1)")
      sphereGrad.addColorStop(1, "rgba(20, 10, 40, 1)")
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.fillStyle = sphereGrad
      ctx.fill()

      // Inner blue glow
      const innerGlow = ctx.createRadialGradient(cx, cy - 4, 0, cx, cy, R * 0.8)
      innerGlow.addColorStop(0, "rgba(80, 160, 255, 0.2)")
      innerGlow.addColorStop(1, "rgba(0,0,0,0)")
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.fillStyle = innerGlow
      ctx.fill()

      // Clip for hex ring
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, R - 1, 0, Math.PI * 2)
      ctx.clip()

      const hexR = R * 0.55
      const hexPulse = Math.sin(t * 2) * 0.15 + 0.85
      for (let seg = 0; seg < 6; seg++) {
        const a1 = (seg / 6) * Math.PI * 2 + t * 0.5
        const a2 = ((seg + 1) / 6) * Math.PI * 2 + t * 0.5
        const x1 = cx + Math.cos(a1) * hexR
        const y1 = cy + Math.sin(a1) * hexR
        const x2 = cx + Math.cos(a2) * hexR
        const y2 = cy + Math.sin(a2) * hexR
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = seg % 2 === 0
          ? `rgba(236, 72, 153, ${0.9 * hexPulse})`
          : `rgba(96, 200, 255, ${0.9 * hexPulse})`
        ctx.lineWidth = size * 0.04
        ctx.shadowColor = seg % 2 === 0 ? "rgba(236, 72, 153, 0.9)" : "rgba(96, 200, 255, 0.9)"
        ctx.shadowBlur = 6
        ctx.stroke()
        ctx.shadowBlur = 0
      }
      ctx.restore()

      // Orbital ring
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(t * 0.4)
      ctx.scale(1, 0.28)
      const ringGrad = ctx.createLinearGradient(-R - 10, 0, R + 10, 0)
      ringGrad.addColorStop(0, "rgba(220, 50, 150, 0)")
      ringGrad.addColorStop(0.5, "rgba(255, 100, 200, 0.9)")
      ringGrad.addColorStop(1, "rgba(220, 50, 150, 0)")
      ctx.beginPath()
      ctx.ellipse(0, 0, R + size * 0.1, R + size * 0.1, 0, 0, Math.PI * 2)
      ctx.strokeStyle = ringGrad
      ctx.lineWidth = size * 0.025
      ctx.shadowColor = "rgba(236, 72, 153, 0.8)"
      ctx.shadowBlur = 8
      ctx.stroke()
      ctx.restore()

      t += 0.02
      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animId)
  }, [size])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      onClick={() => clickable && router.push("/")}
      className={clickable ? "cursor-pointer" : ""}
    />
  )
}
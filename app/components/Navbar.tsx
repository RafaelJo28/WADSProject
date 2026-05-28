"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import OrbotLogo from "./OrbotLogo"

export default function Navbar({ active }: { active?: string }) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    localStorage.removeItem("user")
    router.push("/login")
  }

  return (
    <nav className="border-b border-purple-900/30 backdrop-blur-md"
      style={{ background: "rgba(6, 0, 16, 0.85)" }}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col items-center gap-1 cursor-pointer sm:flex-row sm:items-center" onClick={() => router.push("/")}>
          <OrbotLogo size={36} />
          <span className="text-white font-black text-lg sm:text-xl tracking-wide text-center sm:text-left"
            style={{ fontFamily: "var(--font-orbitron)" }}>
            Orbot
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-4">
          {[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Ask", href: "/ask" },
            { label: "History", href: "/history" },
            { label: "Profile", href: "/profile" },
          ].map(({ label, href }) => (
            <Link key={href} href={href}
              className={`text-sm font-medium transition-colors ${
                active === label
                  ? "text-purple-400"
                  : "text-gray-400 hover:text-purple-300"
              }`}>
              {label}
            </Link>
          ))}
          <button onClick={handleLogout}
            className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors">
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
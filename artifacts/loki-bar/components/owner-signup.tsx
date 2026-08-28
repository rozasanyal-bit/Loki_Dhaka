"use client"

// components/owner-signup.tsx — hidden route for owner bootstrap
// Accessible only at /owner-signup (not linked from public UI)
// Use this once to create the owner account, then disable or protect this route.

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { createUser } from "@/lib/firebase-service"
import { LokiMark } from "@/components/loki-wordmark"

export function OwnerSignup() {
  const router = useRouter()
  const [name, setName]         = useState("")
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  async function handleSignup() {
    setError(null)
    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await createUser(cred.user.uid, {
        name,
        email,
        favoriteDrink: "",
        notes: [],
        role: "owner",
        qrCode: cred.user.uid,
        status: "Standard",
      })
      router.replace("/owner")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-black px-6 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,#e2b34a0.10),transparent_32%)]" />
      <div className="relative w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <LokiMark className="h-14 w-14" priority />
          <p className="text-[11px] uppercase tracking-[0.34em] text-white/35">Owner setup</p>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#e2b34a]/50 transition-colors"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#e2b34a]/50 transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSignup()}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#e2b34a]/50 transition-colors"
          />

          {error && (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-300">{error}</p>
          )}

          <button
            type="button"
            onClick={handleSignup}
            disabled={loading || !name || !email || !password}
            className="loki-button w-full rounded-full bg-[#e2b34a] py-3.5 text-sm font-semibold text-black disabled:opacity-40"
          >
            {loading ? "Creating account…" : "Create owner account"}
          </button>
        </div>
      </div>
    </div>
  )
}

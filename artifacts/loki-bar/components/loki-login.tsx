"use client"

// components/loki-login.tsx — entry + login screen with real Loki logo

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import type { PublicUserDoc } from "@/lib/firebase-types"
import { LokiMark } from "@/components/loki-wordmark"
import { ROLE_ROUTES, isRole } from "@/lib/roles"

export function LokiLogin() {
  const router = useRouter()
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  async function handleLogin() {
    setError(null)
    setLoading(true)
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const snap = await getDoc(doc(db, "publicProfiles", cred.user.uid))
      const profile = snap.exists() ? (snap.data() as PublicUserDoc) : null
      const route = profile?.role && isRole(profile.role) ? ROLE_ROUTES[profile.role] : "/customer"
      router.push(route)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed."
      setError(msg.includes("invalid-credential") ? "Wrong email or password." : msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="loki-view flex min-h-dvh items-center justify-center overflow-hidden bg-black px-6 text-white">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,#e2b34a0.13),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent)]" />

      <div className="relative flex w-full max-w-sm flex-col items-center gap-8">

        {/* Full logo mark — helmet + LOKI text */}
        <div className="loki-float rounded-full border border-white/10 bg-white/[0.03] p-7 shadow-[0_0_90px_#e2b34a0.14)] backdrop-blur-sm">
          <LokiMark className="h-28 w-28" priority />
        </div>

        <div className="space-y-1 text-center">
          <p className="text-[11px] uppercase tracking-[0.42em] text-white/38">Loki Restaurant & Bar, Dhaka</p>
          <p className="text-sm text-white/50">Sign in to continue</p>
        </div>

        {/* Login form */}
        <div className="w-full space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#e2b34a]/50 focus:bg-white/[0.06] transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#e2b34a]/50 focus:bg-white/[0.06] transition-colors"
          />

          {error && (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-300">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading || !email || !password}
            className="loki-button w-full rounded-full bg-[#e2b34a] py-3.5 text-sm font-semibold text-black disabled:opacity-40 motion-safe:transform-gpu"
          >
            {loading ? "Signing in…" : "Enter Loki"}
          </button>
        </div>

        <div className="flex flex-col gap-4 text-center text-sm text-[#f3deaf]"><a href="/signup/">New guest? Create an account</a><a href="/install/">Install on your phone</a><button onClick={async()=>{try{if(!email){setError("Enter your email above first.");return}await sendPasswordResetEmail(auth,email);setError("If this address has an account, password reset instructions have been sent.")}catch{setError("Unable to request reset. Check your email and connection.")}}}>Forgot password?</button></div>
        <p className="text-[11px] uppercase tracking-[0.34em] text-white/24">
          A private table-side experience
        </p>
      </div>
    </div>
  )
}

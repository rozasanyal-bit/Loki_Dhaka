"use client"

// components/role-guard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Wraps a portal page. Shows a loading screen while auth resolves,
// redirects to /login if not signed in, and blocks access if the role
// doesn't match. Usage:
//
//   export default function OwnerPage() {
//     return (
//       <RoleGuard required="owner">
//         <OwnerPortal />
//       </RoleGuard>
//     )
//   }
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/lib/auth-context"
import type { Role } from "@/lib/roles"

interface Props {
  required: Role
  children: ReactNode
}

export function RoleGuard({ required, children }: Props) {
  const { user, profile, loading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) { router.replace("/login"); return }
    if (profile?.role !== required) { router.replace("/login") }
  }, [loading, user, profile, required, router])

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-black">
        <p className="text-[11px] uppercase tracking-[0.38em] text-white/30 animate-pulse">
          Authenticating…
        </p>
      </div>
    )
  }

  if (!user || profile?.role !== required) return null
  if (profile.disabled || profile.approved !== true) return <div className="grid min-h-dvh place-content-center bg-black p-8 text-white text-center"><h1 className="text-2xl">{profile.disabled ? "Access suspended" : "Awaiting approval"}</h1><p className="mt-4">Loki must approve your invitation before you can use this portal.</p><a className="mt-6 underline" href="/login/">Return to sign in</a></div>

  return <>{children}</>
}

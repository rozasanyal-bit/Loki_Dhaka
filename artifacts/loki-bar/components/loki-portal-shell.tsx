"use client"

// components/loki-portal-shell.tsx — portal wrapper with real Loki logo

import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { signOut } from "firebase/auth"

import { LokiWordmark } from "@/components/loki-wordmark"
import { auth } from "@/lib/firebase"

type LokiPortalShellProps = {
  accentClassName: string
  badge: string
  title: string
  asideEyebrow: string
  asideTitle: string
  asideBody: string
  children: ReactNode
}

export function LokiPortalShell({
  accentClassName,
  badge,
  title,
  asideEyebrow,
  asideTitle,
  asideBody,
  children,
}: LokiPortalShellProps) {
  const router = useRouter()

  async function handleSignOut() {
    await signOut(auth)
    router.replace("/login")
  }

  return (
    <div className="loki-view min-h-dvh bg-[radial-gradient(circle_at_top_left,rgba(214,180,99,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_28%),linear-gradient(180deg,#050505_0%,#090808_100%)] px-4 py-5 text-foreground sm:px-6 sm:py-7 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">

        <header className="loki-card relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] backdrop-blur-xl">
          <div className={`h-1.5 w-full ${accentClassName}`} />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06)_0%,transparent_34%,transparent_70%,rgba(255,255,255,0.04)_100%)]" />

          <div className="relative grid gap-5 p-5 sm:p-6 lg:grid-cols-[1.35fr_0.65fr] lg:p-8">
            <div className="space-y-5">

              {/* Logo row */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-xl border border-white/10 bg-black/30 p-1.5">
                  <LokiWordmark className="h-10 w-10 rounded-lg" priority />
                </div>
                <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] uppercase tracking-[0.32em] text-white/60">
                  {badge}
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="loki-button ml-auto inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-white/50 hover:text-white/80"
                >
                  <LogOut className="h-3 w-3" />
                  Sign out
                </button>
              </div>

              <h1 className="font-serif text-3xl font-semibold leading-tight tracking-wide text-white sm:text-4xl">
                {title}
              </h1>
            </div>

            <aside className="grid gap-4 content-start">
              <div className="loki-card rounded-[1.75rem] border border-white/10 bg-black/25 p-5">
                <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">{asideEyebrow}</p>
                <p className="mt-3 text-2xl font-semibold text-white">{asideTitle}</p>
                <p className="mt-2 text-sm leading-6 text-white/68">{asideBody}</p>
              </div>
            </aside>
          </div>
        </header>

        {children}

        <footer className="loki-card rounded-[1.5rem] border border-white/8 bg-black/20 px-5 py-3 text-center text-xs tracking-[0.26em] text-white/48">
          Developed by ARZO
        </footer>
      </div>
    </div>
  )
}

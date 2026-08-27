"use client"

// components/loki-entry.tsx — first screen of the app.
// Black background, centered logo fades in, "tap to enter" fades in after,
// then the whole screen fades out into the login portal. No dashboard feel —
// just quiet, dark, and focused, per the Loki brand brief.

import { useState } from "react"
import { LokiMark } from "@/components/loki-wordmark"

export function LokiEntry({ onEnter }: { onEnter: () => void }) {
  const [leaving, setLeaving] = useState(false)

  function handleEnter() {
    if (leaving) return
    setLeaving(true)
    // Let the fade-out play before handing off to the login screen.
    window.setTimeout(onEnter, 420)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleEnter}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleEnter()}
      className={[
        "fixed inset-0 z-50 flex min-h-dvh cursor-pointer flex-col items-center justify-center bg-black px-6 text-white transition-opacity duration-[420ms] ease-out",
        leaving ? "pointer-events-none opacity-0" : "opacity-100",
      ].join(" ")}
    >
      <div className="loki-entry-fade-in flex flex-col items-center gap-7 text-center">
        <LokiMark className="h-28 w-28 drop-shadow-[0_0_60px_rgba(201,164,94,0.25)]" priority />
        <p className="text-[11px] uppercase tracking-[0.42em] text-white/40">Loki Restaurant &amp; Bar, Dhaka</p>
      </div>

      <p className="loki-entry-fade-in-delayed absolute bottom-16 text-[11px] uppercase tracking-[0.36em] text-white/35">
        Tap to enter
      </p>

      <style jsx>{`
        @keyframes loki-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .loki-entry-fade-in {
          animation: loki-fade-in 900ms ease-out both;
        }
        .loki-entry-fade-in-delayed {
          animation: loki-fade-in 900ms ease-out 500ms both;
        }
      `}</style>
    </div>
  )
}

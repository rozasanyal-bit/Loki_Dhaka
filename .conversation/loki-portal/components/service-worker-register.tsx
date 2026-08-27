"use client"

// components/service-worker-register.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Registers /sw.js (see public/sw.js) so the app installs as a PWA and the
// manifest icons/splash actually take effect on mobile home screens.
// Safe no-op on unsupported browsers and during Capacitor native builds.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from "react"

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return
    if (!("serviceWorker" in navigator)) return

    // Capacitor native shells serve from a local file scheme — skip there.
    if (window.location.protocol === "capacitor:" || window.location.protocol === "file:") return

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration failures (e.g. dev mode over plain http on some hosts)
      // should never break the app.
    })
  }, [])

  return null
}

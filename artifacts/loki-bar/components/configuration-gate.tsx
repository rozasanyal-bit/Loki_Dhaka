'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

const firebaseConfigPresent = [
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
].every((value) => typeof value === 'string' && value.trim().length > 0)

export function ConfigurationGate({ children }: { children: ReactNode }) {
  const path = usePathname()
  const isInstallGuide = path === '/install/' || path === '/install'
  const isEmulatorSession = process.env.NEXT_PUBLIC_USE_EMULATORS === 'true'
  const ready = isInstallGuide || isEmulatorSession || firebaseConfigPresent

  if (!ready) {
    return (
      <main className="auth-screen">
        <h1>Loki is being connected</h1>
        <p>This copy is waiting for Loki's final service configuration. Please contact the app administrator before signing in.</p>
        <p>No customer information is stored until the connection is ready.</p>
        <a href="/install/">Phone installation guide</a>
      </main>
    )
  }

  return children
}

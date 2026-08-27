"use client"

import { useEffect, useState } from "react"
import { LokiEntry } from "@/components/loki-entry"
import { LokiLogin } from "@/components/loki-login"

const ENTRY_SEEN_KEY = "loki-entry-seen"

export default function Page() {
  // Default to true so server-rendered/first-paint markup doesn't flash the
  // entry screen before we've checked sessionStorage on the client.
  const [showEntry, setShowEntry] = useState(true)

  useEffect(() => {
    setShowEntry(window.sessionStorage.getItem(ENTRY_SEEN_KEY) !== "1")
  }, [])

  function handleEnter() {
    window.sessionStorage.setItem(ENTRY_SEEN_KEY, "1")
    setShowEntry(false)
  }

  if (showEntry) return <LokiEntry onEnter={handleEnter} />
  return <LokiLogin />
}

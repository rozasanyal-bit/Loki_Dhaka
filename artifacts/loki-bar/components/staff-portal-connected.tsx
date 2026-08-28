"use client"

// components/staff-portal-connected.tsx
// Staff portal: scan customer QR → lookup → log visit → update status → add note.

import { useState } from "react"
import { NotebookPen, QrCode } from "lucide-react"

import { LokiPortalShell } from "@/components/loki-portal-shell"
import { useAuthContext } from "@/lib/auth-context"
import { getUserByQrCode, logVisit, addNoteToUser, updateCustomerStatus, getVisitsByStaff, formatVisitDate } from "@/lib/firebase-service"
import type { UserDoc, VisitDoc, CustomerStatus } from "@/lib/firebase-types"
import { CUSTOMER_STATUSES, DEFAULT_CUSTOMER_STATUS } from "@/lib/firebase-types"

type Status = "idle" | "loading" | "done" | "error"

export function StaffPortalConnected() {
  const { user: staffUser, loading } = useAuthContext()

  const [qrInput, setQrInput]           = useState("")
  const [foundUser, setFoundUser]       = useState<{ id: string; data: UserDoc } | null>(null)
  const [lookupError, setLookupError]   = useState<string | null>(null)
  const [lookupStatus, setLookupStatus] = useState<Status>("idle")

  const [visitStatus, setVisitStatus] = useState<Status>("idle")
  const [lastVisitId, setLastVisitId] = useState<string | null>(null)

  const [noteText, setNoteText]     = useState("")
  const [noteStatus, setNoteStatus] = useState<Status>("idle")

  const [statusSaving, setStatusSaving] = useState(false)

  const [recentVisits, setRecentVisits] = useState<Array<{ id: string; data: VisitDoc }>>([])
  const [visitsLoaded, setVisitsLoaded] = useState(false)

  if (staffUser && !visitsLoaded) {
    setVisitsLoaded(true)
    getVisitsByStaff(staffUser.uid, 8).then(setRecentVisits)
  }

  async function handleCameraScan() {
    try {
      const { CapacitorBarcodeScanner, CapacitorBarcodeScannerTypeHint, CapacitorBarcodeScannerCameraDirection } = await import("@capacitor/barcode-scanner")
      const result = await CapacitorBarcodeScanner.scanBarcode({
        hint: CapacitorBarcodeScannerTypeHint.QR_CODE,
        scanInstructions: "Align the Loki customer QR inside the frame",
        cameraDirection: CapacitorBarcodeScannerCameraDirection.BACK,
      })
      if (result.ScanResult) {
        setQrInput(result.ScanResult)
        handleLookup(result.ScanResult)
      }
    } catch {
      alert("Camera scan not available in browser — paste the QR value below.")
    }
  }

  async function handleLookup(override?: string) {
    const code = (override ?? qrInput).trim()
    if (!code) return
    setLookupStatus("loading")
    setLookupError(null)
    setFoundUser(null)
    setVisitStatus("idle")
    setNoteStatus("idle")
    try {
      const result = await getUserByQrCode(code)
      if (!result) {
        setLookupError("No customer found for that QR code.")
        setLookupStatus("error")
      } else {
        setFoundUser(result)
        setLookupStatus("done")
      }
    } catch {
      setLookupError("Connection error — check your network.")
      setLookupStatus("error")
    }
  }

  async function handleLogVisit() {
    if (!foundUser || !staffUser) return
    setVisitStatus("loading")
    try {
      const id = await logVisit(foundUser.id, staffUser.uid)
      setLastVisitId(id)
      setVisitStatus("done")
      const fresh = await getVisitsByStaff(staffUser.uid, 8)
      setRecentVisits(fresh)
    } catch {
      setVisitStatus("error")
    }
  }

  async function handleStatusChange(newStatus: CustomerStatus) {
    if (!foundUser) return
    setStatusSaving(true)
    try {
      await updateCustomerStatus(foundUser.id, newStatus)
      setFoundUser({ ...foundUser, data: { ...foundUser.data, status: newStatus } })
    } finally {
      setStatusSaving(false)
    }
  }

  async function handleAddNote() {
    if (!foundUser || !noteText.trim()) return
    setNoteStatus("loading")
    try {
      await addNoteToUser(foundUser.id, noteText.trim())
      setNoteText("")
      setNoteStatus("done")
    } catch {
      setNoteStatus("error")
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-black">
        <p className="text-sm uppercase tracking-[0.28em] text-white/40 animate-pulse">Authenticating…</p>
      </div>
    )
  }

  return (
    <LokiPortalShell
      accentClassName="bg-gradient-to-r from-[#283640] via-[#0f1820] to-[#385f66]"
      badge="Staff"
      title="Check in guests."
      asideEyebrow="Shift"
      asideTitle={`${recentVisits.length} check-ins`}
      asideBody="Visits logged this session."
    >
      <section className="grid gap-4 xl:grid-cols-2">

        {/* ── Scan panel ── */}
        <article className="loki-card rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/42">Scan guest</p>

          <button
            type="button"
            onClick={handleCameraScan}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#e2b34a]/30 bg-[#e2b34a]/10 px-4 py-3 text-sm font-semibold text-[#f3deaf]"
          >
            <QrCode className="h-4 w-4" />
            Scan customer QR
          </button>

          <p className="mt-3 text-[11px] uppercase tracking-[0.24em] text-white/30">Or paste UID</p>
          <div className="mt-2 flex gap-2">
            <input
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
              placeholder="Customer UID…"
              className="flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#e2b34a]/40"
            />
            <button
              type="button"
              onClick={() => handleLookup()}
              disabled={lookupStatus === "loading"}
              className="rounded-xl bg-[#e2b34a] px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
            >
              {lookupStatus === "loading" ? "…" : "Find"}
            </button>
          </div>

          {lookupError && (
            <p className="mt-2 text-xs text-red-400">{lookupError}</p>
          )}

          {/* Found customer */}
          {foundUser && (
            <div className="mt-4 rounded-2xl border border-[#e2b34a]/20 bg-[#e2b34a]/5 p-4 space-y-3">
              <div>
                <p className="text-base font-semibold text-white">{foundUser.data.name}</p>
                <p className="text-xs text-white/50">{foundUser.data.email}</p>

                <div className="mt-3 flex items-center gap-2">
                  <label className="text-[10px] uppercase tracking-[0.24em] text-white/35">Status</label>
                  <select
                    value={foundUser.data.status ?? DEFAULT_CUSTOMER_STATUS}
                    onChange={(e) => handleStatusChange(e.target.value as CustomerStatus)}
                    disabled={statusSaving}
                    className="rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs text-white/80 outline-none focus:border-[#e2b34a]/40 disabled:opacity-50"
                  >
                    {CUSTOMER_STATUSES.map((s) => (
                      <option key={s} value={s} className="bg-black text-white">
                        {s}
                      </option>
                    ))}
                  </select>
                  {statusSaving && <span className="text-[10px] text-white/30">Saving…</span>}
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogVisit}
                disabled={visitStatus === "loading" || visitStatus === "done"}
                className="w-full rounded-xl bg-[#e2b34a] py-2.5 text-sm font-semibold text-black disabled:opacity-50"
              >
                {visitStatus === "idle"    && "Log visit"}
                {visitStatus === "loading" && "Logging…"}
                {visitStatus === "done"    && "✓ Visit logged"}
                {visitStatus === "error"   && "Retry"}
              </button>

              {/* Add note */}
              <div className="pt-1">
                <div className="flex items-center gap-2 mb-2">
                  <NotebookPen className="h-3.5 w-3.5 text-[#e2b34a]" />
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">Note</p>
                </div>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={2}
                  placeholder="Preferences, requests…"
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#e2b34a]/40"
                />
                <button
                  type="button"
                  onClick={handleAddNote}
                  disabled={noteStatus === "loading" || !noteText.trim()}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 py-2 text-sm text-white/70 disabled:opacity-40"
                >
                  {noteStatus === "idle"    && "Save note"}
                  {noteStatus === "loading" && "Saving…"}
                  {noteStatus === "done"    && "✓ Saved"}
                  {noteStatus === "error"   && "Retry"}
                </button>
              </div>
            </div>
          )}
        </article>

        {/* ── Recent check-ins ── */}
        <article className="loki-card rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/42">Recent check-ins</p>
          <div className="mt-4 space-y-2">
            {recentVisits.length === 0 ? (
              <p className="text-sm text-white/40">No check-ins yet.</p>
            ) : (
              recentVisits.map((v) => (
                <div key={v.id} className="rounded-[1.2rem] border border-white/8 bg-black/20 px-4 py-3 flex items-center justify-between gap-2">
                  <p className="font-mono text-xs text-white/55">{v.data.userId.slice(0, 12)}…</p>
                  <p className="text-xs text-white/35">{formatVisitDate(v.data.timestamp)}</p>
                </div>
              ))
            )}
          </div>
        </article>

      </section>
    </LokiPortalShell>
  )
}

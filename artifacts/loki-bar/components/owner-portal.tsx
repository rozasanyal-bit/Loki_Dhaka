"use client"

// components/owner-portal.tsx
// Owner view: tonight's covers, all users with status filter, pending staff requests.

import { useEffect, useState } from "react"
import { CalendarDays, CheckCircle, Copy, Link2, Search, Users, XCircle } from "lucide-react"

import { LokiPortalShell } from "@/components/loki-portal-shell"
import { useAuthContext } from "@/lib/auth-context"
import {
  getVisitsToday,
  getAllUsers,
  getPendingStaffRequests,
  setStaffApproval,
  updateCustomerStatus,
  formatVisitDate,
  createStaffInvite,
} from "@/lib/firebase-service"
import type { UserDoc, VisitDoc, CustomerStatus } from "@/lib/firebase-types"
import { CUSTOMER_STATUSES, DEFAULT_CUSTOMER_STATUS } from "@/lib/firebase-types"

export function OwnerPortal() {
  const { profile } = useAuthContext()

  // Tonight's check-ins
  const [visits, setVisits]       = useState<Array<{ id: string; data: VisitDoc }>>([])
  const [visitsLoading, setVisitsLoading] = useState(true)

  // All users list
  const [allUsers, setAllUsers]         = useState<Array<{ id: string; data: UserDoc }>>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | "">("")
  const [userSearch, setUserSearch]     = useState("")

  // Pending staff requests
  const [pendingStaff, setPendingStaff]         = useState<Array<{ id: string; data: UserDoc }>>([])
  const [pendingLoading, setPendingLoading]     = useState(true)
  const [approvingId, setApprovingId]           = useState<string | null>(null)

  // Status update (inline on user list)
  const [savingStatusId, setSavingStatusId] = useState<string | null>(null)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [inviteBusy, setInviteBusy] = useState(false)

  useEffect(() => {
    getVisitsToday().then(setVisits).finally(() => setVisitsLoading(false))
    getPendingStaffRequests().then(setPendingStaff).finally(() => setPendingLoading(false))
    loadUsers()
  }, [])

  async function loadUsers(filter?: CustomerStatus | "") {
    setUsersLoading(true)
    try {
      const results = await getAllUsers(filter ? { status: filter as CustomerStatus } : undefined)
      setAllUsers(results)
    } finally {
      setUsersLoading(false)
    }
  }

  async function handleStatusFilterChange(val: CustomerStatus | "") {
    setStatusFilter(val)
    await loadUsers(val)
  }

  async function handleStatusChange(userId: string, newStatus: CustomerStatus) {
    setSavingStatusId(userId)
    try {
      await updateCustomerStatus(userId, newStatus)
      setAllUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, data: { ...u.data, status: newStatus } } : u
        )
      )
    } finally {
      setSavingStatusId(null)
    }
  }

  async function handleApprove(userId: string) {
    setApprovingId(userId)
    try {
      await setStaffApproval(userId, true)
      setPendingStaff((prev) => prev.filter((u) => u.id !== userId))
    } finally {
      setApprovingId(null)
    }
  }

  async function handleReject(userId: string) {
    setApprovingId(userId)
    try {
      await setStaffApproval(userId, false)
      setPendingStaff((prev) => prev.filter((u) => u.id !== userId))
    } finally {
      setApprovingId(null)
    }
  }

  const uniqueGuests = new Set(visits.map((v) => v.data.userId)).size

  const filteredUsers = userSearch.trim()
    ? allUsers.filter(
        (u) =>
          u.data.name.toLowerCase().includes(userSearch.toLowerCase()) ||
          u.data.email.toLowerCase().includes(userSearch.toLowerCase())
      )
    : allUsers

  return (
    <LokiPortalShell
      accentClassName="bg-gradient-to-r from-[#c9a45e] via-[#8a6a30] to-[#3a2d14]"
      badge="Owner"
      title="The whole room."
      asideEyebrow="Signed in as"
      asideTitle={profile?.name ?? "Owner"}
      asideBody={`${uniqueGuests} guest${uniqueGuests === 1 ? "" : "s"} tonight.`}
    >
      <section className="grid gap-4">

        {/* ── Tonight's covers ── */}
        <article className="loki-card rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 text-[#d8b16b]" />
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/42">Tonight's covers</p>
            <span className="ml-auto text-2xl font-semibold text-white">
              {visitsLoading ? "—" : visits.length}
            </span>
          </div>

          {!visitsLoading && visits.length > 0 && (
            <div className="mt-4 space-y-2">
              {visits.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/20 px-4 py-3"
                >
                  <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[#d8b16b]" />
                  <p className="font-mono text-xs text-white/55">{v.data.userId.slice(0, 14)}…</p>
                  <span className="ml-auto text-xs uppercase tracking-[0.22em] text-white/35">
                    {formatVisitDate(v.data.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {!visitsLoading && visits.length === 0 && (
            <p className="mt-3 text-sm text-white/40">No check-ins tonight yet.</p>
          )}
        </article>

        {/* ── Owner-only staff invitation ── */}
        <article className="loki-card rounded-[1.75rem] border border-[#d8b16b]/20 bg-[#d8b16b]/[0.04] p-5 backdrop-blur-xl">
          <div className="flex items-center gap-3"><Link2 className="h-4 w-4 text-[#d8b16b]"/><p className="text-[11px] uppercase tracking-[0.28em] text-white/42">Owner-only staff invitation</p></div>
          <p className="mt-2 text-sm text-white/55">Generate a short-lived signup link. Only Hersha can create these links.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" disabled={inviteBusy} onClick={async()=>{ if(!profile) return; setInviteBusy(true); try { const token=await createStaffInvite(profile.qrCode); setInviteLink(`${window.location.origin}/staff-signup?invite=${token}`) } finally { setInviteBusy(false) } }} className="inline-flex items-center gap-2 rounded-full bg-[#c9a45e] px-4 py-2 text-sm font-semibold text-black disabled:opacity-40">{inviteBusy?"Generating…":"Generate staff link"}</button>
            {inviteLink && <button type="button" onClick={()=>navigator.clipboard?.writeText(inviteLink)} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-white/75"><Copy className="h-4 w-4"/>Copy link</button>}
          </div>
          {inviteLink && <p className="mt-3 break-all rounded-xl border border-white/8 bg-black/25 p-3 font-mono text-[10px] text-white/45">{inviteLink}</p>}
        </article>

        {/* ── Pending staff requests ── */}
        <article className="loki-card rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/42">Pending staff requests</p>

          {pendingLoading && (
            <p className="mt-3 text-sm text-white/40 animate-pulse">Loading…</p>
          )}

          {!pendingLoading && pendingStaff.length === 0 && (
            <p className="mt-3 text-sm text-white/40">No pending requests.</p>
          )}

          {!pendingLoading && pendingStaff.length > 0 && (
            <div className="mt-4 space-y-2">
              {pendingStaff.map((u) => (
                <div
                  key={u.id}
                  className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#d8b16b]/15 bg-[#d8b16b]/5 px-4 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{u.data.name}</p>
                    <p className="text-xs text-white/45 truncate">{u.data.email}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleApprove(u.id)}
                      disabled={approvingId === u.id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-300 disabled:opacity-50"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(u.id)}
                      disabled={approvingId === u.id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-300 disabled:opacity-50"
                    >
                      <XCircle className="h-3 w-3" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        {/* ── All users ── */}
        <article className="loki-card rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/42">All users</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
              <input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Name or email…"
                className="w-full rounded-xl border border-white/10 bg-black/30 pl-8 pr-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#d8b16b]/40"
              />
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value as CustomerStatus | "")}
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/80 outline-none focus:border-[#d8b16b]/40"
            >
              <option value="" className="bg-black text-white">All statuses</option>
              {CUSTOMER_STATUSES.map((s) => (
                <option key={s} value={s} className="bg-black text-white">{s}</option>
              ))}
            </select>
          </div>

          <div className="mt-4 space-y-2">
            {usersLoading && (
              <p className="text-sm text-white/40 animate-pulse">Loading…</p>
            )}

            {!usersLoading && filteredUsers.length === 0 && (
              <p className="text-sm text-white/40">No users found.</p>
            )}

            {!usersLoading && filteredUsers.map((u) => (
              <div
                key={u.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/8 bg-black/20 px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{u.data.name}</p>
                  <p className="text-xs text-white/40 truncate">{u.data.email}</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/28 mt-0.5">{u.data.role}</p>
                </div>

                <select
                  value={u.data.status ?? DEFAULT_CUSTOMER_STATUS}
                  onChange={(e) => handleStatusChange(u.id, e.target.value as CustomerStatus)}
                  disabled={savingStatusId === u.id}
                  className="rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs text-white/80 outline-none focus:border-[#d8b16b]/40 disabled:opacity-50 shrink-0"
                >
                  {CUSTOMER_STATUSES.map((s) => (
                    <option key={s} value={s} className="bg-black text-white">{s}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </article>

      </section>
    </LokiPortalShell>
  )
}

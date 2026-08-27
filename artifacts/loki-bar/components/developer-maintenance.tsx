"use client"

import { LokiMark } from "@/components/loki-wordmark"
import { APP_BUILD, APP_ENVIRONMENT, APP_VERSION, SUPPORT_CONTACT } from "@/lib/app-meta"

type MaintenanceCard = {
  label: string
  value: string
  detail: string
}

const maintenanceCards: MaintenanceCard[] = [
  { label: "App version", value: APP_VERSION, detail: "Release identifier for the Loki portal shell." },
  { label: "Build number", value: APP_BUILD, detail: "Current deploy stamp for mobile and web sync." },
  { label: "Environment", value: APP_ENVIRONMENT, detail: "The active runtime environment shown to ARZO." },
  { label: "Database status", value: "Connected", detail: "Future hook for the live hospitality data link." },
  { label: "QR system status", value: "Healthy", detail: "Track guest QR routing and table sessions." },
  { label: "Last sync time", value: "Pending sync", detail: "Will update from the backend once connected." },
]

export function DeveloperMaintenancePortal() {
  return (
    <div className="loki-view min-h-dvh bg-[radial-gradient(circle_at_top_left,rgba(201,164,94,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_30%),linear-gradient(180deg,#050505_0%,#0a0909_100%)] px-4 py-4 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <header className="loki-card overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] backdrop-blur-xl">
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />
          <div className="grid gap-6 p-6 lg:grid-cols-[1.35fr_0.65fr] lg:p-8">
            <div>
              <div className="flex items-center gap-3"><div className="rounded-xl border border-white/10 bg-black/40 p-1.5"><LokiMark className="h-10 w-10" /></div><p className="text-lg font-semibold text-white">Loki</p></div>
              <p className="mt-5 text-[11px] uppercase tracking-[0.34em] text-white/45">ARZO internal maintenance</p>
              <h1 className="mt-3 font-serif text-4xl font-semibold tracking-wide sm:text-5xl">Developer workspace</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
                Support and release tooling for Loki. This area stays separate from the public portals and is
                reserved for app maintenance, sync checks, and operational readiness.
              </p>
            </div>

            <div className="loki-card rounded-[1.75rem] border border-white/10 bg-black/25 p-5">
              <p className="text-[11px] uppercase tracking-[0.32em] text-white/45">Role</p>
              <p className="mt-3 text-2xl font-semibold text-white">developer</p>
              <p className="mt-2 text-sm leading-6 text-white/66">This surface is only for users signed in as developer.</p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {maintenanceCards.map((card) => (
            <article
              key={card.label}
              className="loki-card rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl"
            >
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/42">{card.label}</p>
              <p className="mt-3 text-2xl font-semibold text-white">{card.value}</p>
              <p className="mt-2 text-sm leading-6 text-white/66">{card.detail}</p>
            </article>
          ))}

          <article className="loki-card rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/42">Export backup</p>
            <p className="mt-3 text-2xl font-semibold text-white">Manual backup flow</p>
            <p className="mt-2 text-sm leading-6 text-white/66">
              Future hook for database export and local archive packaging before release cuts.
            </p>
            <button
              type="button"
              className="loki-button mt-5 w-full rounded-full border border-white/12 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white motion-safe:transform-gpu"
            >
              Export backup
            </button>
          </article>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="loki-card rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/42">Maintenance mode</p>
            <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-xl">
                <p className="text-xl font-semibold text-white">Pause customer-facing actions during updates</p>
                <p className="mt-2 text-sm leading-6 text-white/66">
                  This toggle is a future hook for the live maintenance flag that can gate public ordering and QR
                  actions.
                </p>
              </div>
              <button
                type="button"
                aria-label="Toggle maintenance mode"
                className="loki-button rounded-full border border-white/12 bg-black/30 px-5 py-3 text-sm font-semibold text-white motion-safe:transform-gpu"
              >
                Off
              </button>
            </div>
          </article>

          <article className="loki-card rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/42">Support notes</p>
            <p className="mt-3 text-xl font-semibold text-white">ARZO contact</p>
            <p className="mt-2 text-sm leading-6 text-white/66">{SUPPORT_CONTACT}</p>
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-medium text-white">Notes</p>
              <p className="mt-2 text-sm leading-6 text-white/64">
                Keep release support, QR sync fixes, and venue maintenance requests here so the owner and staff
                portals stay clean.
              </p>
            </div>
          </article>
        </section>

        <footer className="loki-card rounded-[1.5rem] border border-white/8 bg-black/20 px-5 py-3 text-center text-xs tracking-[0.26em] text-white/48">
          Developed by ARZO
        </footer>
      </div>
    </div>
  )
}

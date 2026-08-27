// lib/app-meta.ts
// ─────────────────────────────────────────────────────────────────────────────
// Build/version metadata shown on the developer maintenance portal.
//
// APP_VERSION comes straight from package.json so it never drifts out of
// sync with what you actually shipped. APP_BUILD and APP_ENVIRONMENT are
// injected at build time — see next.config.mjs / your CI pipeline.
// ─────────────────────────────────────────────────────────────────────────────

import pkg from "../package.json"

export const APP_VERSION = pkg.version

export const APP_BUILD =
  process.env.NEXT_PUBLIC_BUILD_NUMBER ?? new Date().toISOString().slice(0, 10).replace(/-/g, "")

export const APP_ENVIRONMENT = process.env.NEXT_PUBLIC_APP_ENV ?? process.env.NODE_ENV ?? "development"

export const SUPPORT_CONTACT = process.env.NEXT_PUBLIC_SUPPORT_CONTACT ?? "support@loki-app.internal"

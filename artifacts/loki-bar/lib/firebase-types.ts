// lib/firebase-types.ts
// ─────────────────────────────────────────────────────────────────────────────
// Shared TypeScript types that mirror the Firestore document shapes.
// Keep these in sync with your Firestore Security Rules.
// ─────────────────────────────────────────────────────────────────────────────

import type { Timestamp } from "firebase/firestore"
import type { Role } from "@/lib/roles"

// ── customer status (tiers) ──────────────────────────────────────────────────
// Internal-only classification. Never shown in the customer portal — visible
// only to staff and owner, who can update it from a dropdown.
export const CUSTOMER_STATUSES = [
  "VIP",
  "Preferred",
  "Standard",
  "Review",
  "Probationary",
  "Blacklisted",
] as const

export type CustomerStatus = (typeof CUSTOMER_STATUSES)[number]

export const DEFAULT_CUSTOMER_STATUS: CustomerStatus = "Standard"

// ── users/{userId} ────────────────────────────────────────────────────────────
// Created when a new customer/owner account is set up.
// The owner document uses userId = "abc123" (or the actual Firebase Auth UID).
export interface PublicUserDoc {
  name: string
  email: string
  createdAt: Timestamp
  role: Role
  qrCode: string
}

export interface UserDoc {
  name:          string          // e.g. "Hersha"
  email:         string          // e.g. "your-email@gmail.com"
  createdAt:     Timestamp       // serverTimestamp() at account creation
  favoriteDrink: string          // e.g. "Smoked Old Fashioned"  (empty = "")
  notes:         string[]        // array of freeform staff notes
  role:          Role            // "owner" | "staff" | "customer" | "developer"
  qrCode:        string          // equals the userId — used for QR scanning
  status?:       CustomerStatus  // internal tier — staff/owner only, defaults to "Standard"
  approved?:     boolean         // staff approval state
}

// ── visits/{visitId} ─────────────────────────────────────────────────────────
// Written by staff when they scan a customer QR code.
export interface VisitDoc {
  userId:    string     // the customer's Firebase Auth UID
  date:      string     // "YYYY-MM-DD"  (ISO date, local time)
  timestamp: Timestamp  // serverTimestamp() — exact server time of the visit
  staffId:   string     // the staff member's Firebase Auth UID
}

export interface StaffInviteDoc {
  createdAt: Timestamp
  expiresAt: Timestamp
  createdBy: string
  active: boolean
  uses: number
  maxUses: number
}

// lib/roles.ts
// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for the four portal roles.
//
// Role is ALWAYS derived from the signed-in user's Firestore document
// (users/{uid}.role), which is itself protected by firestore.rules — a
// client can never grant themselves a role by typing it into a text box.
// There is intentionally no client-side "developer code" or cookie/
// sessionStorage based unlock anywhere in this app. See RoleGuard.
// ─────────────────────────────────────────────────────────────────────────────

export const ROLES = ["owner", "staff", "customer", "developer"] as const

export type Role = (typeof ROLES)[number]

export const ROLE_ROUTES: Record<Role, string> = {
  owner: "/owner",
  staff: "/staff",
  customer: "/customer",
  developer: "/developer",
}

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value)
}

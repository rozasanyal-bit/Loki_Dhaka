export const ROLES = ["owner", "staff", "customer", "management", "developer"] as const
export type Role = (typeof ROLES)[number]
export const ROLE_ROUTES: Record<Role, string> = {owner:"/owner",staff:"/staff",customer:"/customer",management:"/management",developer:"/developer"}
export function isRole(value: unknown): value is Role { return typeof value === "string" && (ROLES as readonly string[]).includes(value) }

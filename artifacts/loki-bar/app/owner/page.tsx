"use client"
import { RoleGuard } from "@/components/role-guard"
import { OwnerPortal } from "@/components/owner-portal"

export default function OwnerPage() {
  return (
    <RoleGuard required="owner">
      <OwnerPortal />
    </RoleGuard>
  )
}

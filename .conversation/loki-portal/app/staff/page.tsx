"use client"
import { RoleGuard } from "@/components/role-guard"
import { StaffPortalConnected } from "@/components/staff-portal-connected"

export default function StaffPage() {
  return (
    <RoleGuard required="staff">
      <StaffPortalConnected />
    </RoleGuard>
  )
}

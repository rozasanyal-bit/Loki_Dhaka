"use client"
import { RoleGuard } from "@/components/role-guard"
import { DeveloperMaintenancePortal } from "@/components/developer-maintenance"

export default function DeveloperPage() {
  return (
    <RoleGuard required="developer">
      <DeveloperMaintenancePortal />
    </RoleGuard>
  )
}

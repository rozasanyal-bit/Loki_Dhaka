"use client"
import { RoleGuard } from "@/components/role-guard"
import { CustomerPortalConnected } from "@/components/customer-portal-connected"

export default function CustomerPage() {
  return (
    <RoleGuard required="customer">
      <CustomerPortalConnected />
    </RoleGuard>
  )
}

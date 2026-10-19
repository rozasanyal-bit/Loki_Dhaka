'use client'
import {RoleGuard} from '@/components/role-guard'
import {OperationsPortal} from '@/components/operations-portal'
export default function Page(){return <RoleGuard required="management"><OperationsPortal role="management"/></RoleGuard>}

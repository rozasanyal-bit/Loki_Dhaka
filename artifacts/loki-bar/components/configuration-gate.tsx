'use client'
import type {ReactNode} from 'react'
import {usePathname} from 'next/navigation'
export function ConfigurationGate({children}:{children:ReactNode}){
 const path=usePathname()
 const ready=
 path==='/install/'||path==='/install'||process.env.NEXT_PUBLIC_USE_EMULATORS==='true'||process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.includes(':web:')
 if(!ready)return <main className="auth-screen"><h1>Loki is being connected</h1><p>This copy is waiting for Loki’s final service configuration. Please contact the app administrator before signing in.</p><p>No customer information is stored until the connection is ready.</p><a href="/install/">Phone installation guide</a></main>
 return children
}

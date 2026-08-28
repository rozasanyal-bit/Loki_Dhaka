"use client"
import { useRouter } from "next/navigation"
import { LogOut, Bell, MapPin, QrCode, Utensils } from "lucide-react"
import { signOut } from "firebase/auth"
import { QRCodeSVG } from "qrcode.react"
import { LokiMark } from "@/components/loki-wordmark"
import { auth } from "@/lib/firebase"
import { useAuthContext } from "@/lib/auth-context"
export function CustomerPortalConnected(){
 const router=useRouter(); const {user,profile,loading}=useAuthContext()
 async function handleSignOut(){await signOut(auth);router.replace("/login")}
 function openMenu(){window.open("/menu/loki-menu.pdf","_blank","noopener,noreferrer")}
 if(loading)return <div className="flex min-h-dvh items-center justify-center bg-black"><p className="text-sm uppercase tracking-[0.28em] text-white/40 animate-pulse">Loading…</p></div>
 return <div className="loki-view min-h-dvh bg-[radial-gradient(circle_at_center,#e2b34a0.10),transparent_38%),linear-gradient(180deg,#050505_0%,#0a0908_100%)] px-5 py-8 text-white">
  <button type="button" onClick={handleSignOut} className="loki-button absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[11px] uppercase tracking-[0.28em] text-white/45"><LogOut className="h-3 w-3"/>Sign out</button>
  <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 pt-8"><LokiMark className="h-20 w-20" priority/><div className="text-center"><p className="text-[11px] uppercase tracking-[0.34em] text-white/35">Customer portal</p><p className="mt-2 text-xl font-semibold">Welcome{profile?.name?`, ${profile.name}`:""}</p></div>
   <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl"><div className="rounded-2xl bg-white p-4"><QRCodeSVG value={user?.uid??""} size={220} bgColor="#fff" fgColor="#0a0a0a" level="M"/></div><div className="mt-4 text-center"><p className="text-[10px] uppercase tracking-[0.34em] text-white/35">My QR</p><p className="mt-1 text-sm text-white/55">Show this to staff to identify your account.</p></div></div>
   <div className="grid w-full gap-3 sm:grid-cols-3"><button onClick={openMenu} className="loki-button rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left"><Utensils className="h-5 w-5 text-[#e2b34a]"/><p className="mt-3 text-sm font-semibold">Menu</p><p className="mt-1 text-xs text-white/40">Browse Loki</p></button><button onClick={()=>alert("Offers will appear here when Loki publishes them.")} className="loki-button rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left"><Bell className="h-5 w-5 text-[#e2b34a]"/><p className="mt-3 text-sm font-semibold">Offers</p><p className="mt-1 text-xs text-white/40">Current promotions</p></button><button onClick={()=>alert("Loki Bar · Banani, Dhaka")} className="loki-button rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left"><MapPin className="h-5 w-5 text-[#e2b34a]"/><p className="mt-3 text-sm font-semibold">Contact</p><p className="mt-1 text-xs text-white/40">Find Loki</p></button></div>
   <div className="w-full rounded-2xl border border-[#e2b34a]/15 bg-[#e2b34a]/5 p-4 text-center"><QrCode className="mx-auto h-5 w-5 text-[#e2b34a]"/><p className="mt-2 text-sm font-semibold">Private by design</p><p className="mt-1 text-xs leading-5 text-white/45">Spending, visit history, internal status, rankings and staff notes are not available in the customer portal.</p></div>
  </div></div>
}

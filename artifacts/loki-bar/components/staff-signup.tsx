"use client"
import { useEffect, useState } from "react"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { consumeStaffInvite, createUser, getStaffInvite } from "@/lib/firebase-service"
import { LokiMark } from "@/components/loki-wordmark"

export function StaffSignup(){
 const [invite,setInvite]=useState("")
 useEffect(()=>{ setInvite(new URLSearchParams(window.location.search).get("invite")?.trim()??"") },[])
 const [name,setName]=useState(""); const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState<string|null>(null); const [loading,setLoading]=useState(false); const [done,setDone]=useState(false)
 async function handleSignup(){
  setError(null); setLoading(true)
  try{
   if(!invite) throw new Error("This staff signup link is missing its owner invitation token.")
   if(!(await getStaffInvite(invite))) throw new Error("This invitation is expired, revoked, or already full.")
   const cred=await createUserWithEmailAndPassword(auth,email,password)
   await createUser(cred.user.uid,{name,email,favoriteDrink:"",notes:[],role:"staff",qrCode:cred.user.uid,status:"Standard",approved:false})
   const consumed=await consumeStaffInvite(invite)
   if(!consumed) throw new Error("The invitation could not be consumed. Ask the owner for a new link.")
   setDone(true)
  }catch(err:unknown){setError(err instanceof Error?err.message:"Signup failed.")}finally{setLoading(false)}
 }
 if(done)return <div className="flex min-h-dvh items-center justify-center bg-black px-6 text-white"><div className="text-center space-y-3"><LokiMark className="h-14 w-14 mx-auto" priority/><p className="text-sm text-white/60">Request submitted.</p><p className="text-[11px] uppercase tracking-[0.34em] text-white/30">Awaiting owner approval</p></div></div>
 return <div className="flex min-h-dvh items-center justify-center bg-black px-6 text-white"><div className="relative w-full max-w-sm space-y-6"><div className="flex flex-col items-center gap-3"><LokiMark className="h-14 w-14" priority/><p className="text-[11px] uppercase tracking-[0.34em] text-white/35">Owner-invited staff access</p></div><div className="space-y-3"><input type="text" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"/><input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"/><input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSignup()} className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"/>{error&&<p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-300">{error}</p>}<button type="button" onClick={handleSignup} disabled={loading||!name||!email||!password||!invite} className="loki-button w-full rounded-full bg-[#e2b34a] py-3.5 text-sm font-semibold text-black disabled:opacity-40">{loading?"Submitting…":"Request access"}</button></div><p className="text-center text-[11px] uppercase tracking-[0.34em] text-white/24">Only an owner-generated invitation can open staff signup.</p></div></div>
}

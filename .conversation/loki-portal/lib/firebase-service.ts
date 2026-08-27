// lib/firebase-service.ts
// ─────────────────────────────────────────────────────────────────────────────
// All Firestore read/write helpers used by the app.
// Import these in your components instead of calling Firestore directly.
// ─────────────────────────────────────────────────────────────────────────────

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  runTransaction,
} from "firebase/firestore"

import { db } from "@/lib/firebase"
import type { UserDoc, PublicUserDoc, VisitDoc, CustomerStatus, StaffInviteDoc } from "@/lib/firebase-types"
import { DEFAULT_CUSTOMER_STATUS } from "@/lib/firebase-types"

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Return today's date as "YYYY-MM-DD" in the local timezone. */
function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

// ─── users collection ────────────────────────────────────────────────────────

/**
 * Create (or overwrite) a user document in `users/{userId}`.
 *
 * Call this once after Firebase Auth sign-up, passing the Auth UID as userId.
 *
 * Owner bootstrap example:
 *   await createUser("abc123", {
 *     name: "Hersha",
 *     email: "your-email@gmail.com",
 *     favoriteDrink: "",
 *     notes: [],
 *     role: "owner",
 *     qrCode: "abc123",
 *   })
 */
export async function createUser(
  userId: string,
  fields: Omit<UserDoc, "createdAt">,
): Promise<void> {
  const createdAt = serverTimestamp()
  await setDoc(doc(db, "users", userId), { ...fields, status: fields.status ?? DEFAULT_CUSTOMER_STATUS, createdAt } satisfies Omit<UserDoc, "createdAt"> & { createdAt: ReturnType<typeof serverTimestamp> })
  await setDoc(doc(db, "publicProfiles", userId), { name: fields.name, email: fields.email, role: fields.role, qrCode: fields.qrCode, createdAt } satisfies Omit<PublicUserDoc, "createdAt"> & { createdAt: ReturnType<typeof serverTimestamp> })
}

export async function getPublicProfile(userId: string): Promise<PublicUserDoc | null> {
  const snap = await getDoc(doc(db, "publicProfiles", userId))
  return snap.exists() ? (snap.data() as PublicUserDoc) : null
}

/** Fetch a single private user document by their Firebase Auth UID. */
export async function getUser(userId: string): Promise<UserDoc | null> {
  const snap = await getDoc(doc(db, "users", userId))
  return snap.exists() ? (snap.data() as UserDoc) : null
}

/**
 * Find a customer by their qrCode value.
 * The QR code stored on the customer's phone equals their userId.
 * Staff scan the QR → get the userId string → call this function.
 */
export async function getUserByQrCode(qrCode: string): Promise<{ id: string; data: UserDoc } | null> {
  const q = query(
    collection(db, "users"),
    where("qrCode", "==", qrCode),
    limit(1),
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  const docSnap = snap.docs[0]
  return { id: docSnap.id, data: docSnap.data() as UserDoc }
}

/** Update individual fields on a user document. */
export async function updateUser(
  userId: string,
  fields: Partial<Omit<UserDoc, "createdAt" | "email" | "role" | "qrCode">>,
): Promise<void> {
  await updateDoc(doc(db, "users", userId), fields)
}

/** Add a freeform staff note to a user's `notes` array. */
export async function addNoteToUser(userId: string, note: string): Promise<void> {
  const userRef = doc(db, "users", userId)
  const snap = await getDoc(userRef)
  if (!snap.exists()) throw new Error(`User ${userId} not found`)
  const existing: string[] = (snap.data() as UserDoc).notes ?? []
  await updateDoc(userRef, { notes: [...existing, note] })
}

/**
 * Update a customer's internal status (VIP / Preferred / Standard / Review /
 * Probationary / Blacklisted). Staff and owner only — enforced by
 * firestore.rules, which blocks customers from writing this field on their
 * own document. Never surface this call from the customer portal.
 */
export async function updateCustomerStatus(userId: string, status: CustomerStatus): Promise<void> {
  await updateDoc(doc(db, "users", userId), { status })
}

/**
 * Fetch all user documents. Owner-only — enforced by firestore.rules.
 * Optionally filter by role or status.
 */
export async function getAllUsers(filters?: {
  status?: CustomerStatus
}): Promise<Array<{ id: string; data: UserDoc }>> {
  let q = query(collection(db, "users"), orderBy("createdAt", "desc"))
  if (filters?.status) {
    q = query(collection(db, "users"), where("status", "==", filters.status), orderBy("createdAt", "desc"))
  }
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, data: d.data() as UserDoc }))
}

/**
 * Fetch users with role=staff AND approved=false.
 * Used on the owner portal "Pending Staff Requests" section.
 */
export async function getPendingStaffRequests(): Promise<Array<{ id: string; data: UserDoc }>> {
  const q = query(
    collection(db, "users"),
    where("role", "==", "staff"),
    where("approved", "==", false),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, data: d.data() as UserDoc }))
}

/**
 * Approve or reject a pending staff request.
 * Sets approved=true (approve) or deletes/downgrades the role (reject).
 */
export async function setStaffApproval(userId: string, approved: boolean): Promise<void> {
  if (approved) {
    await updateDoc(doc(db, "users", userId), { approved: true })
  } else {
    await updateDoc(doc(db, "users", userId), { role: "customer", approved: false })
  }
}

// ─── visits collection ───────────────────────────────────────────────────────

/**
 * Log a visit when a staff member scans a customer's QR code.
 *
 * @param userId   - the customer's Firebase Auth UID (decoded from QR)
 * @param staffId  - the logged-in staff member's Firebase Auth UID
 * @returns the new visit document ID
 *
 * Visit document shape:
 *   { userId, date: "YYYY-MM-DD", timestamp: serverTimestamp(), staffId }
 */
export async function logVisit(userId: string, staffId: string): Promise<string> {
  const visitData: Omit<VisitDoc, "timestamp"> & { timestamp: ReturnType<typeof serverTimestamp> } = {
    userId,
    date:      todayISO(),
    timestamp: serverTimestamp(),
    staffId,
  }
  const ref = await addDoc(collection(db, "visits"), visitData)
  return ref.id
}

/**
 * Fetch the most recent visits for a given customer, newest first.
 * Default limit = 10 (enough for the customer portal visit history card).
 */
export async function getVisitsForUser(
  userId: string,
  maxResults = 10,
): Promise<Array<{ id: string; data: VisitDoc }>> {
  const q = query(
    collection(db, "visits"),
    where("userId", "==", userId),
    orderBy("timestamp", "desc"),
    limit(maxResults),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, data: d.data() as VisitDoc }))
}

/**
 * Fetch the most recent visits logged by a specific staff member.
 * Useful for the staff portal's shift summary.
 */
export async function getVisitsByStaff(
  staffId: string,
  maxResults = 20,
): Promise<Array<{ id: string; data: VisitDoc }>> {
  const q = query(
    collection(db, "visits"),
    where("staffId", "==", staffId),
    orderBy("timestamp", "desc"),
    limit(maxResults),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, data: d.data() as VisitDoc }))
}

/**
 * Fetch all visits for today (across all customers).
 * Used on the owner portal for "Tonight's covers".
 */
export async function getVisitsToday(): Promise<Array<{ id: string; data: VisitDoc }>> {
  const today = todayISO()
  const q = query(
    collection(db, "visits"),
    where("date", "==", today),
    orderBy("timestamp", "desc"),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, data: d.data() as VisitDoc }))
}

// ─── utility: format Firestore Timestamp for display ─────────────────────────

/**
 * Convert a Firestore Timestamp to a short display string like "Thu 18 Jun".
 * Safe to call with null/undefined (returns "—").
 */
export function formatVisitDate(ts: Timestamp | null | undefined): string {
  if (!ts) return "—"
  const d = ts.toDate()
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
}


function randomInviteToken(): string {
  const bytes = new Uint8Array(24)
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) crypto.getRandomValues(bytes)
  else for (let i=0;i<bytes.length;i++) bytes[i]=Math.floor(Math.random()*256)
  return Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("")
}
export async function createStaffInvite(ownerId:string,hours=24,maxUses=5):Promise<string>{
 const token=randomInviteToken(); const expires=new Date(Date.now()+hours*60*60*1000)
 await setDoc(doc(db,"staffInvites",token),{createdAt:serverTimestamp(),expiresAt:Timestamp.fromDate(expires),createdBy:ownerId,active:true,uses:0,maxUses} satisfies Omit<StaffInviteDoc,"createdAt"|"expiresAt"> & {createdAt:ReturnType<typeof serverTimestamp>;expiresAt:Timestamp})
 return token
}
export async function getStaffInvite(token:string):Promise<StaffInviteDoc|null>{
 const snap=await getDoc(doc(db,"staffInvites",token)); if(!snap.exists()) return null; const data=snap.data() as StaffInviteDoc
 return data.active&&data.expiresAt.toDate()>new Date()&&data.uses<data.maxUses?data:null
}
export async function revokeStaffInvite(token:string):Promise<void>{await updateDoc(doc(db,"staffInvites",token),{active:false})}

export async function consumeStaffInvite(token:string):Promise<boolean>{
  const ref=doc(db,"staffInvites",token)
  return runTransaction(db,async tx=>{
    const snap=await tx.get(ref); if(!snap.exists()) return false
    const data=snap.data() as StaffInviteDoc
    if(!data.active||data.expiresAt.toDate()<=new Date()||data.uses>=data.maxUses) return false
    tx.update(ref,{uses:data.uses+1,active:data.uses+1>=data.maxUses?false:data.active})
    return true
  })
}

// scripts/seed-firestore.mjs
// ─────────────────────────────────────────────────────────────────────────────
// Creates one test user per role (owner / staff / customer / developer) plus
// a few sample visit documents, so you have real data to click through in
// each portal without hand-typing Firestore documents in the console.
//
// Setup:
//   1. Firebase console → Project Settings → Service Accounts →
//      "Generate new private key" → save as serviceAccountKey.json in the
//      project root (already gitignored — never commit this file).
//   2. npm install firebase-admin --save-dev   (or pnpm add -D firebase-admin)
//   3. node scripts/seed-firestore.mjs
//
// This creates BOTH the Firebase Auth user (so you can actually log in) AND
// the matching Firestore users/{uid} document — they must share the same uid
// per firestore.rules and lib/auth-context.tsx.
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync } from "node:fs"
import { initializeApp, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore, Timestamp } from "firebase-admin/firestore"

const serviceAccount = JSON.parse(readFileSync(new URL("../serviceAccountKey.json", import.meta.url)))

initializeApp({ credential: cert(serviceAccount) })

const auth = getAuth()
const db = getFirestore()

const TEST_PASSWORD = "loki-test-1234"

const TEST_USERS = [
  {
    role: "owner",
    email: "owner@loki-test.local",
    name: "Hersha (Owner)",
    favoriteDrink: "Smoked Old Fashioned",
  },
  {
    role: "staff",
    email: "staff@loki-test.local",
    name: "Tanvir (Staff)",
    favoriteDrink: "",
  },
  {
    role: "customer",
    email: "customer@loki-test.local",
    name: "Roza (Customer)",
    favoriteDrink: "Espresso Martini",
    status: "VIP",
  },
  {
    role: "developer",
    email: "developer@loki-test.local",
    name: "ARZO (Developer)",
    favoriteDrink: "",
  },
]

async function getOrCreateAuthUser(email) {
  try {
    return await auth.getUserByEmail(email)
  } catch {
    return await auth.createUser({ email, password: TEST_PASSWORD, emailVerified: true })
  }
}

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

async function main() {
  console.log("Seeding Firestore + Auth test users…\n")

  const createdUsers = {}

  for (const def of TEST_USERS) {
    const authUser = await getOrCreateAuthUser(def.email)
    const uid = authUser.uid

    await db.doc(`users/${uid}`).set(
      {
        name: def.name, email: def.email, role: def.role, qrCode: uid,
        favoriteDrink: def.favoriteDrink ?? "", notes: [], createdAt: Timestamp.now(),
        status: def.status ?? "Standard",
      },
      { merge: true },
    )

    await db.doc(`publicProfiles/${uid}`).set(
      { name: def.name, email: def.email, role: def.role, qrCode: uid, createdAt: Timestamp.now() },
      { merge: true },
    )

    createdUsers[def.role] = uid
    console.log(`  ✓ ${def.role.padEnd(10)} ${def.email}  (uid: ${uid})`)
  }

  // Sample visit: staff checking in the test customer today.
  const customerUid = createdUsers.customer
  const staffUid = createdUsers.staff

  if (customerUid && staffUid) {
    await db.collection("visits").add({
      userId: customerUid,
      staffId: staffUid,
      date: todayISO(),
      timestamp: Timestamp.now(),
    })
    console.log("\n  ✓ Sample visit logged for the test customer.")
  }

  console.log(`\nDone. All test accounts share the password: ${TEST_PASSWORD}`)
  console.log("Sign in with any of the emails above on the login screen to view that role's portal.")
}

main().catch((err) => {
  console.error("Seed script failed:", err)
  process.exit(1)
})

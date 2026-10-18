// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Next evaluates client modules while producing the static export. Firebase
// Auth rejects an empty API key at that point, even though no authentication
// happens during prerendering. Use a valid inert config only for that build
// environment. Browsers continue to receive the real public configuration.
const buildConfig = {
  apiKey: "build-only-api-key",
  authDomain: "build-only.firebaseapp.com",
  projectId: "build-only",
  storageBucket: "build-only.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:buildonly",
}

const config = typeof window === "undefined" ? buildConfig : firebaseConfig
const app = getApps().length === 0 ? initializeApp(config) : getApp()

export const auth = getAuth(app)
export const db   = getFirestore(app)

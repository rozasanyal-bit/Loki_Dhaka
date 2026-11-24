// Validate that mobile builds use one Firebase project across Web and Android.
// This script intentionally never prints configuration values or credentials.
import { readFileSync } from 'node:fs'

const required = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
]
const fail = (message) => {
  console.error(`::error::${message}`)
  process.exit(1)
}
const missing = required.filter((name) => !process.env[name]?.trim())
if (missing.length) fail(`Missing required GitHub Actions secret(s): ${missing.join(', ')}`)

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
const senderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID
const webApp = /^1:(\d+):web:[a-f\d]+$/i.exec(appId)
if (!webApp || webApp[1] !== senderId) {
  fail('Firebase web App ID and messaging sender ID do not belong to the same Firebase project. Check the six web configuration secrets.')
}

if (process.argv.includes('--android')) {
  let services
  try {
    services = JSON.parse(readFileSync('artifacts/loki-bar/android/app/google-services.json', 'utf8'))
  } catch {
    fail('Missing or invalid Android google-services.json. Download it from the same Firebase project as the web app.')
  }
  if (services.project_info?.project_id !== projectId ||
      String(services.project_info?.project_number) !== senderId) {
    fail('Android google-services.json and Firebase web secrets reference different Firebase projects. Use matching configurations before building.')
  }
  const capacitor = readFileSync('artifacts/loki-bar/capacitor.config.ts', 'utf8')
  const packageId = /\bappId:\s*["']([^"']+)["']/.exec(capacitor)?.[1]
  if (!packageId || !services.client?.some((client) =>
    client.client_info?.android_client_info?.package_name === packageId)) {
    fail('Android google-services.json has no client matching the Capacitor appId. Register the existing Android package in Firebase and download its configuration.')
  }
}

console.log(`Firebase ${process.argv.includes('--android') ? 'web/Android' : 'web'} configuration checks passed (values hidden).`)

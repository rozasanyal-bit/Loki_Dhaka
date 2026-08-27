# Loki Restaurant & Bar — Portal App

QR-based loyalty and visit-tracking app for Loki Restaurant & Bar (Dhaka).
Built with Next.js (static export) + Capacitor for the native shells, and
Firebase (Auth + Firestore) for data and security.

Four roles, four portals: **owner**, **staff**, **customer**, **developer**.
Role is always derived server-side from `users/{uid}.role` in Firestore —
see `firestore.rules` and `lib/roles.ts`. There is no client-side way to
self-promote to staff/owner/developer.

---

## 1. First-time setup

```bash
pnpm install
```

Then follow **`FIREBASE_SETUP.md`** end-to-end — it walks through creating
the Firebase project, enabling Email/Password auth, creating Firestore,
deploying `firestore.rules` / `firestore.indexes.json`, and filling in
`.env.local` with your real project config.

Optional: seed one test account per role (and a sample visit) so you have
real data to click through immediately:

```bash
# 1. Firebase console → Project Settings → Service Accounts →
#    "Generate new private key" → save as serviceAccountKey.json in the
#    project root (already gitignored)
# 2. Install the admin SDK (devDependency, already in package.json)
pnpm install
# 3. Run the seed script
node scripts/seed-firestore.mjs
```

This prints the four test emails and a shared password — sign in with any
of them on the login screen to land in that role's portal.

---

## 2. Local development

```bash
pnpm dev
```

Visit `http://localhost:3000`. You'll see the black entry splash first
(tap or press Enter/Space to continue), then the login screen.

---

## 3. Production web build

```bash
pnpm build
```

This runs `next build` with `output: "export"` (see `next.config.mjs`), so
the result is a fully static site in `out/` — no Node server required to
host it. Deploy `out/` to any static host (Firebase Hosting, Vercel static,
Netlify, S3, etc).

---

## 4. Mobile build (Capacitor)

```bash
pnpm build          # writes the static export to out/
npx cap sync        # copies out/ into the native projects + syncs plugins
```

### Android

```bash
npx cap add android   # first time only
npx cap open android
```

In Android Studio: **Build → Generate Signed Bundle / APK → Android App
Bundle**. Create a keystore the first time you do this (store it somewhere
safe — you'll need the *same* keystore for every future update to this app
on the Play Store). Export the signed `.aab`.

### iOS (requires a Mac)

```bash
npx cap add ios        # first time only
npx cap sync
npx cap open ios
```

In Xcode:
1. Select your project in the navigator → **Signing & Capabilities** → set
   your **Team** (requires an active Apple Developer account)
2. Resolve any signing prompts Xcode shows
3. **Product → Archive**
4. In the Organizer window, **Distribute App → Export** to get the `.ipa`

### Handy package.json scripts already wired up

```bash
pnpm cap:sync            # npx cap sync
pnpm cap:open:android    # npx cap open android
pnpm cap:open:ios        # npx cap open ios
pnpm cap:doctor          # sanity-check your Capacitor setup
pnpm build:mobile        # build + cap sync in one step
```

---

## 5. What's already implemented

- **QR system** — customers see a real scannable QR (`qrcode.react`,
  value = their Firebase Auth UID). Staff scan it with the device camera
  (`@capacitor-community/barcode-scanner`, with a manual paste-UID fallback
  for browser testing) → looks the customer up in Firestore → logs a visit.
- **Visit history** — customer portal shows only the date of each past
  visit, labeled "Your nights at Loki," reading from `visits` where
  `userId == <signed-in uid>`.
- **Role protection** — every portal route is wrapped in `<RoleGuard
  required="...">`, which redirects to `/login` if you're signed out or
  signed in as the wrong role. This is backed by `firestore.rules`, not
  just client-side checks — a user literally cannot read/write data outside
  their role's permissions even if they tampered with the client code.
- **Developer portal** — only reachable by a Firestore-confirmed
  `role: "developer"` account; not linked from anywhere public. Shows app
  version (from `package.json`), build number, environment, and the other
  status cards from the spec, plus placeholders (export backup,
  maintenance toggle) clearly marked as future hooks rather than faked data.
- **Sign-out** — every portal has a sign-out control in the header (this
  wasn't in the original brief, but a portal app with no way to sign out
  would strand staff between shifts, so it's included).
- **Entry experience** — black screen → logo fades in → "tap to enter"
  fades in → smooth fade-out into the login screen, with `prefers-reduced-
  motion` respected.
- **Icons** — `logo.png` (converted from the uploaded `logo.jpeg`) plus
  generated `icon-192.png`, `icon-512.png`, `icon-1024.png`, and a
  `favicon.png`, wired into both `app/layout.tsx` (browser/PWA) and
  `app/manifest.ts` (installable app icon).
- **Static export compatible** — no route uses `cookies()`, `headers()`,
  or any other server-only API, so `output: "export"` in
  `next.config.mjs` works cleanly for the Capacitor build.

## 6. Known gaps / things you'll still need to do

- **Promoting a user to staff/owner/developer** has no UI yet — it's a
  manual step in the Firebase console (edit their `users/{uid}` document's
  `role` field directly, or extend the owner portal with a small admin
  panel if you want this in-app).
- **Export backup** and **maintenance mode toggle** on the developer
  portal are UI placeholders with no backing logic yet (the spec listed
  them as cards to add; wiring them to an actual backup job or a
  maintenance flag read elsewhere in the app is a follow-up task).
- This project was assembled and code-reviewed in a sandboxed environment
  with **no network access**, so `pnpm install`, `next build`, and the
  Capacitor/Android/iOS steps could not actually be executed here — they
  were written and reviewed for correctness but not run end-to-end. Please
  run `pnpm install && pnpm build` first thing on your machine and let me
  know if anything errors.

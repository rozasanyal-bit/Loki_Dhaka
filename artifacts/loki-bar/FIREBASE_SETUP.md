# Firebase Setup Guide — Loki Bar System

Follow these steps exactly. Each section maps to the steps in your original brief.

---

## Step 1 — Create your Firebase project

1. Go to **https://console.firebase.google.com**
2. Click **Add project** → name it `loki-bar-system`
3. Disable Google Analytics (not needed) → **Create project**

---

## Step 2 — Enable Authentication

1. In the Firebase console sidebar: **Build → Authentication**
2. Click **Get started**
3. Under **Sign-in method**, enable **Email/Password**
4. Click **Save**

---

## Step 3 — Create Firestore database

1. Sidebar: **Build → Firestore Database**
2. Click **Create database**
3. Choose **Production mode** (rules come later)
4. Pick the closest region (e.g. `asia-south1` for Dhaka) → **Enable**

---

## Step 4 — Seed the `users` collection (owner document)

In the Firestore console, click **Start collection**:

**Collection ID:** `users`

**First document:**

| Field         | Type      | Value                        |
|---------------|-----------|------------------------------|
| (Document ID) | —         | `abc123`  ← or your real Auth UID |
| name          | string    | `Hersha`                     |
| email         | string    | `your-email@gmail.com`       |
| createdAt     | timestamp | *(click the clock icon → now)* |
| favoriteDrink | string    | *(leave empty)*              |
| notes         | array     | *(leave empty)*              |
| role          | string    | `owner`                      |
| qrCode        | string    | `abc123`  ← same as document ID |

Click **Save**.

---

## Step 5 — Create the `visits` collection (empty for now)

1. Click **Start collection**
2. **Collection ID:** `visits`
3. Create one placeholder document (you can delete it later):
   - Document ID: (auto-ID)
   - Add a dummy field: `_placeholder` → string → `true`
4. Click **Save**, then delete that document.

The collection now exists and is ready to receive visit documents from the app.

---

## Step 6 — Roles (VERY IMPORTANT)

Only three `role` values are valid in the `users` collection:

| Role       | What they can do                              |
|------------|-----------------------------------------------|
| `owner`    | Read/write everything                         |
| `staff`    | Look up customers, log visits, add notes      |
| `customer` | See only their safe public profile + personal QR |

The `qrCode` field **equals** the document ID (= the Firebase Auth UID).  
When staff scan a customer's QR code they get back the customer's UID.

To create a staff account:
1. Create a Firebase Auth user for the staff member (Authentication → Add user)
2. Create a `users/{staffAuthUID}` document with `role: "staff"`

---

## Step 7 — What happens in the app

```
Customer logs in
  └─ reads only publicProfiles/{uid}
  └─ sees their personal QR
  └─ does NOT read private users/{uid} or visits/{visitId}

Staff logs in
  └─ enters/scans the customer's QR value into the search field
  └─ app calls getUserByQrCode(qrCode) → finds the user document
  └─ staff taps "Log visit now"
  └─ app calls logVisit(customerId, staffId)
  └─ Firestore writes:
       visits/{autoId} = {
         userId:    "customer-uid",
         date:      "2026-06-20",       ← today's date YYYY-MM-DD
         timestamp: <serverTimestamp>, ← exact server time
         staffId:   "staff-uid",
       }
```

---

## Step 8 — Connect Firebase to your app

### 8a. Get your config

1. Firebase console → ⚙️ **Project Settings** → **General**
2. Scroll to **Your apps** → click **Add app** → choose **Web** (</> icon)
3. Register the app (any nickname, e.g. `loki-web`)
4. Copy the config object shown

### 8b. Paste it into `.env.local`

`lib/firebase.ts` already reads its config from environment variables — you
don't need to edit that file. Open `.env.local` in the project root and
replace the placeholder values:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...                          # ← your real key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=loki-bar-system.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=loki-bar-system
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=loki-bar-system.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

`.env.local` is already in `.gitignore` — never commit your real keys.

### 8c. Install dependencies

```bash
pnpm install
```

`firebase` is already listed in `package.json`, so this single command pulls
it in along with everything else.

---

## Step 9 — Deploy Firestore Security Rules

```bash
# Install Firebase CLI if you haven't
npm install -g firebase-tools

# Login
firebase login

# Initialise (choose Firestore when prompted, pick your project)
firebase init firestore

# Deploy rules and indexes
firebase deploy --only firestore:rules,firestore:indexes
```

---

## Step 10 — Portal routing (already wired)

`app/customer/page.tsx`, `app/staff/page.tsx`, `app/owner/page.tsx`, and
`app/developer/page.tsx` already import the connected components and wrap
them in `<RoleGuard required="...">`, so signing in routes you straight to
the correct portal with Firestore data live. There's nothing to change here
unless you're adding a new portal.

---

## File summary — what was added

| File | Purpose |
|------|---------|
| `lib/firebase.ts` | Firebase app initialisation (reads config from `.env.local`) |
| `lib/firebase-types.ts` | TypeScript types for `UserDoc` and `VisitDoc` |
| `lib/firebase-service.ts` | All Firestore read/write functions |
| `lib/auth-context.tsx` | App-wide auth context — `useAuthContext()` surfaces user + Firestore profile anywhere |
| `lib/roles.ts` | Single source of truth for the four roles and their routes |
| `components/role-guard.tsx` | Wraps each portal page, redirects unauthenticated/wrong-role visitors to `/login` |
| `components/customer-portal-connected.tsx` | Customer portal wired to Firestore |
| `components/staff-portal-connected.tsx` | Staff portal with QR lookup + visit logging |
| `components/owner-portal.tsx` | Owner portal — tonight's covers across the venue |
| `components/developer-maintenance.tsx` | Developer-only maintenance/build-info portal |
| `firestore.rules` | Security rules (deploy with Firebase CLI) |
| `firestore.indexes.json` | Composite indexes for visit queries |
| `scripts/seed-firestore.mjs` | Creates one test Auth+Firestore user per role plus a sample visit |

---

## Quick test checklist

- [ ] Owner document exists at `users/{ownerUid}` with `role: "owner"`
- [ ] `visits` collection exists (even if empty)
- [ ] `.env.local` has real Firebase config values (not `YOUR_...` placeholders)
- [ ] `pnpm install` has been run
- [ ] Firebase rules deployed (`firebase deploy --only firestore:rules,firestore:indexes`)
- [ ] Create publicProfiles/{uid} for every existing Auth user (see docs/SECURITY_MIGRATION.md)
- [ ] Sign in as a customer → only safe profile + QR appear
- [ ] Sign in as staff → paste/scan customer UID → Find → Log visit now
- [ ] Confirm customer cannot read users/{uid} or visits/{visitId} in Firestore rules
- [ ] Owner can generate a short-lived staff invitation link
- [ ] Sign-out button (top-right of every portal) returns you to `/login`

# Loki Bar System — Windows handoff (2026-10-24)

## Priorities
1. Complete iPhone recovery work first. Restoring iOS does NOT bypass Apple Activation Lock.
2. Preserve Ubuntu and external ROZA backup. Never format Ubuntu, EFI, or backup drives.
3. For Loki, use GitHub Actions cloud APK builds first; avoid installing Android Studio/emulators on the limited 128 GB SSD unless necessary.
4. Existing repository: https://github.com/rozasanyal-bit/Loki_Dhaka ; Ubuntu clone: /home/roza_desktop/Loki_Dhaka ; app: artifacts/loki-bar ; Android package: com.loki.lokidhaka.
5. A successful Android CI run exists: GitHub Actions run 39172396325 (2026-10-18); artifact Loki-Bar-debug-apk (approximately 24.9 MB compressed). A later run 39191538407 (2026-10-19) failed and needs diagnosis before relying on latest source.
6. Test APK on physical Android device; verify Firebase Auth, QR scan, customer/staff/owner/management role security and flows. Developer portal stays private, owner name hidden from customer/staff, no inventory or customer spending display.
7. Do not push code or modify disk partitions without explicit approval. Never publish secrets or private credentials.
8. When back on Ubuntu, inspect disk layout/boot state and repo status before installing dependencies; previous Ubuntu build blocked by missing Java, Android SDK, pnpm/npm registry access.

## Windows session instructions
Open ChatGPT, say: "I'm on Windows. Read Loki_Dhaka/WINDOWS_HANDOFF.md from GitHub or my computer, check the current Windows environment, then help finish Loki Android APK through GitHub Actions without disturbing iPhone recovery or Ubuntu." Connect Remote Desktop Commander on Windows if available; do not assume Ubuntu connector carries over.

## Latest verified Ubuntu progress (2026-10-24)
- Android debug APK from successful GitHub Actions run 39172396325 downloaded to /home/roza_desktop/Loki_APK/app-debug.apk (36 MB); file recognized as Android APK, SHA256 dbfe83c68987b857ee87ed38f9f959837aa6b74ecf67e818fa16900bcb3a6b67. It is NOT yet device-tested.
- Latest Android run 39191538407 failed at Install dependencies; earlier Android run succeeded.
- iOS workflow runs have failed. Existing iOS project has App.xcodeproj, but workflow incorrectly used nonexistent App.xcworkspace; corrected workflow locally to use -project App.xcodeproj. Still needs CI validation, Apple signing and distribution plan.
- Changes remain local until approved for commit/push.

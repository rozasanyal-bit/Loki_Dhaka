# Loki — least-work / no-card finish plan

1. Upload this `loki-portal` folder to a new Replit project.
2. Use pnpm only: `pnpm install` then `pnpm build`.
3. Prepare Android: `pnpm exec cap add android` then `pnpm exec cap sync android`.
4. If Replit has Android SDK/Gradle available, run `pnpm android:build`.
5. Otherwise build the APK with free Android Studio on any available computer.
6. Android APK sideloading is free. Public Google Play publication requires a paid developer account.
7. iOS can be installed as a PWA for free; App Store/TestFlight publication requires Apple Developer membership.

Never place Firebase Admin JSON, GitHub passwords, 2FA/recovery codes, or the Loki server HMAC secret in the repository.

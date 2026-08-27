# Android
App ID: `com.loki.bar.system`
App name: `Loki Bar`
Permissions: INTERNET, CAMERA for QR scanning, POST_NOTIFICATIONS for Android 13+ notifications.
Debug: `pnpm android:build`
Release AAB: `pnpm android:release`
A release build must be signed before store upload.

For push notifications, place the real Firebase Android configuration at `android/app/google-services.json` after `cap add android`. Do not commit it if your project policy forbids it.

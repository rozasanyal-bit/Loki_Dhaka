# Loki Bar — final recovered source pack

This is the latest Firebase-connected Loki portal recovered from the supplied archives, upgraded for mobile packaging and customer privacy.

Start: `pnpm install` → `pnpm build` → `pnpm exec cap add android` → `pnpm exec cap sync android` → `pnpm android:build`.
See `docs/` for the no-card path and GitHub recovery clues.

## Current mobile dependency choice

The project uses the current official `@capacitor/barcode-scanner` package rather than the older community plugin. The official package currently requires Android SDK 26+ and camera usage text on iOS. See the package documentation before changing versions. 

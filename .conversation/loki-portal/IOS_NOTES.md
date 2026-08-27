# iOS
Bundle ID: `com.loki.bar.system`
Display name: `Loki Bar`
Camera permission text: `Loki Bar uses the camera to scan customer QR codes.`
Push requires APNs + Apple Developer configuration.
Run `pnpm exec cap sync ios`, then open the generated project in Xcode on a Mac.

For Firebase push, add the real `GoogleService-Info.plist` to the iOS app target and configure APNs. The placeholder in this repository is not a production Firebase file.

# Use Loki Bar on an iPhone for free

This project is ready for Firebase Hosting. It produces a secure web address
that can be installed from Safari as a Home Screen app, without an Apple
Developer membership.

From this folder, deploy it once:

```bash
pnpm dlx firebase-tools login
pnpm run hosting:deploy
```

Sign in with the Google account that owns the Firebase project `loki-f4791`.
The command prints the live URL, normally `https://loki-f4791.web.app`.

On the iPhone, open that address in Safari, tap Share, then choose **Add to
Home Screen**. Open Loki Bar from the new icon and sign in normally.

If Firebase Authentication rejects the sign-in page, open Firebase Console →
Authentication → Settings → Authorized domains and add `loki-f4791.web.app`.

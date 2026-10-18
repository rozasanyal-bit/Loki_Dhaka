import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "com.loki.bar.system",
  appName: "Loki Bar",
  // `next build` with output: 'export' writes the static site here.
  webDir: "out",
  backgroundColor: "#060606",
  // The Android shell opens the production Loki portal. Keeping `webDir`
  // below lets Capacitor sync its native assets, while the WebView itself
  // always uses this HTTPS deployment.
  server: {
    url: "https://loki-bar-system--somayarorozasid.replit.app/",
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 600,
      backgroundColor: "#060606",
      androidSplashResourceName: "splash",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#060606",
    },
  },
  android: {
    allowMixedContent: false,
  },
}

export default config

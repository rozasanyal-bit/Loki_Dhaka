"use client"

import { useEffect } from "react"
import { Capacitor } from "@capacitor/core"

export function MobileBootstrap() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    let mounted = true
    async function setup() {
      try {
        const { SplashScreen } = await import("@capacitor/splash-screen")
        await SplashScreen.hide()
      } catch {}
      try {
        const { PushNotifications } = await import("@capacitor/push-notifications")
        const permission = await PushNotifications.checkPermissions()
        if (permission.receive === "prompt") await PushNotifications.requestPermissions()
        if (mounted && permission.receive !== "denied") await PushNotifications.register()
      } catch {}
    }
    setup()
    return () => { mounted = false }
  }, [])
  return null
}

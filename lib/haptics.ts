import { Haptics, ImpactStyle } from "@capacitor/haptics"
import { Capacitor } from "@capacitor/core"

export class HapticsManager {
  static async impact(style: "light" | "medium" | "heavy" = "light"): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      // Fallback pour le web avec l'API Vibration
      if ("vibrate" in navigator) {
        const duration = style === "light" ? 10 : style === "medium" ? 20 : 50
        navigator.vibrate(duration)
      }
      return
    }

    try {
      const impactStyle =
        style === "light" ? ImpactStyle.Light : style === "medium" ? ImpactStyle.Medium : ImpactStyle.Heavy

      await Haptics.impact({ style: impactStyle })
    } catch (error) {
      console.error("Error triggering haptic feedback:", error)
    }
  }

  static async success(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      if ("vibrate" in navigator) {
        navigator.vibrate([100, 50, 100])
      }
      return
    }

    try {
      await Haptics.notification({ type: "SUCCESS" })
    } catch (error) {
      console.error("Error triggering success haptic:", error)
    }
  }

  static async error(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      if ("vibrate" in navigator) {
        navigator.vibrate([200, 100, 200])
      }
      return
    }

    try {
      await Haptics.notification({ type: "ERROR" })
    } catch (error) {
      console.error("Error triggering error haptic:", error)
    }
  }
}

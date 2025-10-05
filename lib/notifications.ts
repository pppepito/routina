import { LocalNotifications } from "@capacitor/local-notifications"
import { Capacitor } from "@capacitor/core"

export class NotificationManager {
  static async requestPermissions(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return true // Web notifications ou pas de notifications
    }

    try {
      const permission = await LocalNotifications.requestPermissions()
      return permission.display === "granted"
    } catch (error) {
      console.error("Error requesting notification permissions:", error)
      return false
    }
  }

  static async scheduleReminder(id: number, title: string, body: string, schedule: Date): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      console.log("Notifications not available on web platform")
      return
    }

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id,
            schedule: {
              at: schedule,
              repeats: true,
              every: "day",
            },
            sound: "default",
            attachments: undefined,
            actionTypeId: "",
            extra: {
              habitId: id.toString(),
            },
          },
        ],
      })
    } catch (error) {
      console.error("Error scheduling notification:", error)
    }
  }

  static async cancelReminder(id: number): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return
    }

    try {
      await LocalNotifications.cancel({
        notifications: [{ id }],
      })
    } catch (error) {
      console.error("Error canceling notification:", error)
    }
  }

  static async cancelAllReminders(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return
    }

    try {
      const pending = await LocalNotifications.getPending()
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({
          notifications: pending.notifications,
        })
      }
    } catch (error) {
      console.error("Error canceling all notifications:", error)
    }
  }
}

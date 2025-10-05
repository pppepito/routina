import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "com.routina.app",
  appName: "Routina",
  webDir: "out",
  server: {
    androidScheme: "https",
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#8789C0",
      sound: "beep.wav",
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#F2F2F2",
      showSpinner: false,
    },
  },
}

export default config

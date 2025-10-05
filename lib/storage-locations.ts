export class StorageLocations {
  static getStorageInfo() {
    return {
      preferences: {
        ios: "/var/mobile/Containers/Data/Application/[APP-ID]/Library/Preferences/com.yourapp.plist",
        android: "/data/data/com.yourapp/shared_prefs/com.yourapp_preferences.xml",
      },
      documents: {
        ios: "/var/mobile/Containers/Data/Application/[APP-ID]/Documents/",
        android: "/storage/emulated/0/Android/data/com.yourapp/files/Documents/",
      },
      backups: {
        auto: "auto_backup_YYYY-MM-DD.json",
        habits: "backup_habits.json",
        completions: "backup_completions.json",
      },
    }
  }

  static async getActualPaths() {
    try {
      // En développement, on simule les chemins
      if (typeof window !== "undefined" && window.location.hostname === "localhost") {
        return {
          preferences: "Browser localStorage",
          documents: "Browser IndexedDB",
          currentBackups: await this.listBackupFiles(),
        }
      }

      // En production Capacitor, on peut obtenir les vrais chemins
      const { Filesystem, Directory } = await import("@capacitor/filesystem")
      const documentsUri = await Filesystem.getUri({
        directory: Directory.Documents,
        path: "",
      })

      return {
        preferences: "Native Preferences",
        documents: documentsUri.uri,
        currentBackups: await this.listBackupFiles(),
      }
    } catch (error) {
      console.error("Error getting storage paths:", error)
      return {
        preferences: "Unknown",
        documents: "Unknown",
        currentBackups: [],
      }
    }
  }

  static async listBackupFiles() {
    try {
      const { Filesystem, Directory } = await import("@capacitor/filesystem")
      const files = await Filesystem.readdir({
        directory: Directory.Documents,
        path: "",
      })

      return files.files
        .filter((file) => file.name.includes("backup") || file.name.includes("auto_backup"))
        .map((file) => ({
          name: file.name,
          type: file.type,
          size: file.size,
          modifiedTime: file.mtime,
        }))
    } catch (error) {
      console.error("Error listing backup files:", error)
      return []
    }
  }
}

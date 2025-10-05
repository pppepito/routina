import { Preferences } from "@capacitor/preferences"
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem"

export class CapacitorStorage {
  // Méthodes principales pour les données
  static async setItem(key: string, value: string): Promise<void> {
    try {
      await Preferences.set({ key, value })

      // Créer aussi une sauvegarde de sécurité
      await this.createSecurityBackup(key, value)
    } catch (error) {
      console.error(`Error setting item ${key}:`, error)
      // Fallback vers localStorage en cas d'erreur
      if (typeof window !== "undefined") {
        localStorage.setItem(key, value)
      }
    }
  }

  static async getItem(key: string): Promise<string | null> {
    try {
      const result = await Preferences.get({ key })
      return result.value
    } catch (error) {
      console.error(`Error getting item ${key}:`, error)
      // Fallback vers localStorage
      if (typeof window !== "undefined") {
        return localStorage.getItem(key)
      }
      return null
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      await Preferences.remove({ key })

      // Supprimer aussi la sauvegarde de sécurité
      await this.removeSecurityBackup(key)
    } catch (error) {
      console.error(`Error removing item ${key}:`, error)
      if (typeof window !== "undefined") {
        localStorage.removeItem(key)
      }
    }
  }

  // Sauvegardes de sécurité individuelles
  static async createSecurityBackup(key: string, value: string): Promise<void> {
    try {
      const filename = `backup_${key}.json`
      await Filesystem.writeFile({
        path: filename,
        data: JSON.stringify({
          key,
          value,
          timestamp: new Date().toISOString(),
          version: "1.0",
        }),
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      })
    } catch (error) {
      console.error(`Error creating security backup for ${key}:`, error)
    }
  }

  static async removeSecurityBackup(key: string): Promise<void> {
    try {
      const filename = `backup_${key}.json`
      await Filesystem.deleteFile({
        path: filename,
        directory: Directory.Documents,
      })
    } catch (error) {
      // Pas grave si le fichier n'existe pas
      console.log(`Security backup for ${key} not found or already deleted`)
    }
  }

  // Sauvegarde automatique complète
  static async createAutoBackup(): Promise<void> {
    try {
      const [habits, completions, notes, settings] = await Promise.all([
        this.getItem("habits"),
        this.getItem("completions"),
        this.getItem("notes"),
        this.getItem("settings"),
      ])

      const backupData = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        data: {
          habits: habits ? JSON.parse(habits) : [],
          completions: completions ? JSON.parse(completions) : [],
          notes: notes ? JSON.parse(notes) : [],
          settings: settings ? JSON.parse(settings) : {},
        },
      }

      const filename = `auto_backup_${new Date().toISOString().split("T")[0]}.json`

      await Filesystem.writeFile({
        path: filename,
        data: JSON.stringify(backupData, null, 2),
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      })

      console.log(`Auto backup created: ${filename}`)
    } catch (error) {
      console.error("Error creating auto backup:", error)
    }
  }

  // Nettoyer les anciennes sauvegardes (garder les 7 dernières)
  static async cleanOldAutoBackups(): Promise<void> {
    try {
      const files = await Filesystem.readdir({
        directory: Directory.Documents,
        path: "",
      })

      const autoBackups = files.files
        .filter((file) => file.name.startsWith("auto_backup_"))
        .sort((a, b) => b.name.localeCompare(a.name)) // Tri décroissant par date

      // Garder seulement les 7 plus récentes
      const filesToDelete = autoBackups.slice(7)

      for (const file of filesToDelete) {
        await Filesystem.deleteFile({
          path: file.name,
          directory: Directory.Documents,
        })
        console.log(`Deleted old backup: ${file.name}`)
      }
    } catch (error) {
      console.error("Error cleaning old backups:", error)
    }
  }

  // Restaurer depuis une sauvegarde automatique
  static async restoreFromAutoBackup(filename: string): Promise<boolean> {
    try {
      const fileContent = await Filesystem.readFile({
        path: filename,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      })

      const backupData = JSON.parse(fileContent.data as string)

      // Restaurer chaque type de données
      if (backupData.data.habits) {
        await this.setItem("habits", JSON.stringify(backupData.data.habits))
      }
      if (backupData.data.completions) {
        await this.setItem("completions", JSON.stringify(backupData.data.completions))
      }
      if (backupData.data.notes) {
        await this.setItem("notes", JSON.stringify(backupData.data.notes))
      }
      if (backupData.data.settings) {
        await this.setItem("settings", JSON.stringify(backupData.data.settings))
      }

      console.log(`Successfully restored from ${filename}`)
      return true
    } catch (error) {
      console.error(`Error restoring from ${filename}:`, error)
      return false
    }
  }

  // Lister les sauvegardes disponibles
  static async listAutoBackups(): Promise<Array<{ name: string; date: string; size?: number }>> {
    try {
      const files = await Filesystem.readdir({
        directory: Directory.Documents,
        path: "",
      })

      return files.files
        .filter((file) => file.name.startsWith("auto_backup_"))
        .map((file) => ({
          name: file.name,
          date: file.name.replace("auto_backup_", "").replace(".json", ""),
          size: file.size,
        }))
        .sort((a, b) => b.date.localeCompare(a.date))
    } catch (error) {
      console.error("Error listing auto backups:", error)
      return []
    }
  }

  // Export complet pour l'utilisateur
  static async exportAllData(): Promise<string> {
    try {
      const [habits, completions, notes, settings] = await Promise.all([
        this.getItem("habits"),
        this.getItem("completions"),
        this.getItem("notes"),
        this.getItem("settings"),
      ])

      const exportData = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        appName: "Habit Tracker",
        data: {
          habits: habits ? JSON.parse(habits) : [],
          completions: completions ? JSON.parse(completions) : [],
          notes: notes ? JSON.parse(notes) : [],
          settings: settings ? JSON.parse(settings) : {},
        },
      }

      return JSON.stringify(exportData, null, 2)
    } catch (error) {
      console.error("Error exporting data:", error)
      throw error
    }
  }

  // Import depuis un fichier utilisateur
  static async importAllData(jsonData: string): Promise<boolean> {
    try {
      const importData = JSON.parse(jsonData)

      // Vérifier la version et la structure
     if (!importData.version || (!importData.data && !importData.habits)) {
  throw new Error("Format de fichier invalide")
}

const data = importData.data || importData // 👈 corrige la structure


      // Créer une sauvegarde avant l'import
      await this.createAutoBackup()

      // Importer chaque type de données
      if (data.habits) {
        await this.setItem("habits", JSON.stringify(data.habits))
      }
      if (data.completions) {
        await this.setItem("completions", JSON.stringify(data.completions))
      }
      if (data.notes) {
        await this.setItem("notes", JSON.stringify(data.notes))
      }
      if (data.settings) {
        await this.setItem("settings", JSON.stringify(data.settings))
      }

      habitEventTarget.dispatchEvent(new Event("habit-storage-change"))


      console.log("Successfully imported data")
      return true
    } catch (error) {
      console.error("Error importing data:", error)
      return false
    }
  }
}

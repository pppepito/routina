"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Download,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Calendar,
  Database,
  Shield,
  RefreshCw,
} from "lucide-react"
import { useHabits } from "../hooks/use-habits"
import { useNotes } from "../hooks/use-notes"
import { useSettings } from "../hooks/use-settings"
import { CapacitorStorage } from "../lib/capacitor-storage"

interface BackupData {
  version: string
  exportDate: string
  habits: any[]
  completions: any[]
  notes: any[]
  settings: any
  metadata: {
    totalHabits: number
    totalCompletions: number
    totalNotes: number
    dateRange: {
      from: string
      to: string
    }
  }
}

export function DataBackup() {
  const habitsHook = useHabits()
  const notesHook = useNotes()
  const settingsHook = useSettings()

  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isCreatingAutoBackup, setIsCreatingAutoBackup] = useState(false)
  const [lastExport, setLastExport] = useState<string | null>(localStorage.getItem("lastExportDate"))
  const [importStatus, setImportStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })

  // Fonction d'export
  const handleExport = async () => {
    setIsExporting(true)

    try {
      // Calculer les métadonnées
      const dates = habitsHook.completions?.map((c) => c.date).sort() || []
      const metadata = {
        totalHabits: habitsHook.habits?.length || 0,
        totalCompletions: habitsHook.completions?.filter((c) => c.status === "completed").length || 0,
        totalNotes: notesHook.notes?.length || 0,
        dateRange: {
          from: dates[0] || new Date().toISOString().split("T")[0],
          to: dates[dates.length - 1] || new Date().toISOString().split("T")[0],
        },
      }

      // Créer l'objet de sauvegarde
      const backupData: BackupData = {
        version: "1.0.0",
        exportDate: new Date().toISOString(),
        habits: habitsHook.habits || [],
        completions: habitsHook.completions || [],
        notes: notesHook.notes || [],
        settings: settingsHook.settings || {},
        metadata,
      }

      // Créer et télécharger le fichier
      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `habit-tracker-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      // Sauvegarder la date d'export
      const exportDate = new Date().toISOString()
      localStorage.setItem("lastExportDate", exportDate)
      setLastExport(exportDate)

      setImportStatus({
        type: "success",
        message: "✅ Sauvegarde créée avec succès ! Fichier téléchargé.",
      })
    } catch (error) {
      console.error("Erreur lors de l'export:", error)
      setImportStatus({
        type: "error",
        message: "Erreur lors de l'export des données",
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Fonction d'import
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setImportStatus({ type: null, message: "" })

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const backupData: BackupData = JSON.parse(content)

        // Vérifier la structure du fichier
        if (!backupData.version || !backupData.habits || !backupData.completions) {
          throw new Error("Fichier de sauvegarde invalide")
        }

        // Demander confirmation à l'utilisateur
        const confirmMessage = `
Voulez-vous restaurer cette sauvegarde ?

📊 Données à restaurer :
• ${backupData.metadata.totalHabits} habitudes
• ${backupData.metadata.totalCompletions} complétions
• ${backupData.metadata.totalNotes} notes
• Période : ${backupData.metadata.dateRange.from} → ${backupData.metadata.dateRange.to}
• Sauvegarde créée le : ${new Date(backupData.exportDate).toLocaleDateString("fr-FR")}

⚠️ Cela remplacera toutes vos données actuelles !
        `

        if (window.confirm(confirmMessage)) {
          // Restaurer les données en utilisant les fonctions disponibles dans les hooks
          try {
            // Essayer différentes méthodes pour restaurer les données
            if (typeof habitsHook.setHabits === "function") {
              habitsHook.setHabits(backupData.habits)
            } else if (typeof habitsHook.importHabits === "function") {
              habitsHook.importHabits(backupData.habits)
            } else if (typeof habitsHook.restoreHabits === "function") {
              habitsHook.restoreHabits(backupData.habits)
            }

            if (typeof habitsHook.setCompletions === "function") {
              habitsHook.setCompletions(backupData.completions)
            } else if (typeof habitsHook.importCompletions === "function") {
              habitsHook.importCompletions(backupData.completions)
            } else if (typeof habitsHook.restoreCompletions === "function") {
              habitsHook.restoreCompletions(backupData.completions)
            }

            if (typeof notesHook.setNotes === "function") {
              notesHook.setNotes(backupData.notes || [])
            } else if (typeof notesHook.importNotes === "function") {
              notesHook.importNotes(backupData.notes || [])
            } else if (typeof notesHook.restoreNotes === "function") {
              notesHook.restoreNotes(backupData.notes || [])
            }

            if (backupData.settings) {
              if (typeof settingsHook.setSettings === "function") {
                settingsHook.setSettings(backupData.settings)
              } else if (typeof settingsHook.updateSettings === "function") {
                settingsHook.updateSettings(backupData.settings)
              } else if (typeof settingsHook.restoreSettings === "function") {
                settingsHook.restoreSettings(backupData.settings)
              }
            }

            setImportStatus({
              type: "success",
              message: `✅ Données restaurées avec succès ! ${backupData.metadata.totalHabits} habitudes et ${backupData.metadata.totalCompletions} complétions importées.`,
            })

            // Recharger la page après un délai pour s'assurer que les données sont bien mises à jour
            setTimeout(() => {
              window.location.reload()
            }, 2000)
          } catch (restoreError) {
            console.error("Erreur lors de la restauration:", restoreError)
            setImportStatus({
              type: "error",
              message:
                "Erreur lors de la restauration des données. Les fonctions de mise à jour ne sont pas disponibles.",
            })
          }
        }
      } catch (error) {
        console.error("Erreur lors de l'import:", error)
        setImportStatus({
          type: "error",
          message: "Fichier invalide ou corrompu. Vérifiez que c'est bien un fichier de sauvegarde Habit Tracker.",
        })
      } finally {
        setIsImporting(false)
        // Reset l'input file
        event.target.value = ""
      }
    }

    reader.readAsText(file)
  }

  // Créer une sauvegarde automatique manuelle
  const handleCreateAutoBackup = async () => {
    setIsCreatingAutoBackup(true)
    try {
      await CapacitorStorage.createAutoBackup()
      setImportStatus({
        type: "success",
        message: "✅ Sauvegarde automatique créée dans les fichiers de l'app !",
      })
    } catch (error) {
      setImportStatus({
        type: "error",
        message: "❌ Erreur lors de la création de la sauvegarde automatique.",
      })
    } finally {
      setIsCreatingAutoBackup(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Sécurité des données */}
      <Card className="bg-green-50 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800 text-xl">
            <Shield className="h-5 w-5" />🔒 Sécurité de vos données
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-green-700">
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
              <div>
                <strong>Mises à jour d'app :</strong> Vos données sont conservées
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
              <div>
                <strong>Mises à jour iOS :</strong> Vos données persistent dans l'application
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
              <div>
                <strong>Sauvegarde automatique :</strong> Créée quotidiennement (7 dernières conservées)
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
              <div>
                <strong>Recommandation :</strong> Exportez manuellement 1x/semaine pour une sécurité maximale
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sauvegarde automatique */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <RefreshCw className="h-5 w-5 text-blue-500" />
            Sauvegarde automatique
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            L'app crée automatiquement une sauvegarde quotidienne dans ses fichiers internes. Cette sauvegarde survit
            aux mises à jour.
          </p>

          <Button
            onClick={handleCreateAutoBackup}
            disabled={isCreatingAutoBackup}
            className="text-white w-full"
            style={{ backgroundColor: "#8789C0" }}
          >
            {isCreatingAutoBackup ? (
              <>
                <Database className="h-4 w-4 mr-2 animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Créer une sauvegarde
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Export */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Download className="h-5 w-5 text-blue-500" />
            Sauvegarde manuelle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Créez une sauvegarde complète que vous pouvez stocker où vous voulez (Drive, iCloud, email...). 
          </p>

          {/* Statistiques actuelles */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{habitsHook.habits?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Habitudes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {habitsHook.completions?.filter((c) => c.status === "completed").length || 0}
              </div>
              <div className="text-xs text-muted-foreground">Complétions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{notesHook.notes?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Notes</div>
            </div>
          </div>

          {lastExport && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Dernière sauvegarde : {new Date(lastExport).toLocaleDateString("fr-FR")} à{" "}
              {new Date(lastExport).toLocaleTimeString("fr-FR")}
            </div>
          )}

          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full text-white"
            style={{ backgroundColor: "#8789C0" }}
          >
            {isExporting ? (
              <>
                <Database className="h-4 w-4 mr-2 animate-spin" />
                Création de la sauvegarde...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Télécharger ma sauvegarde
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Import */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Upload className="h-5 w-5 text-green-500" />
            Restaurer mes données
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Restaurez vos données à partir d'un fichier de sauvegarde précédemment créé.
          </p>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              ⚠️ <strong>Attention :</strong> Cette action remplacera toutes vos données actuelles par celles du fichier
              de sauvegarde.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <label htmlFor="backup-file" className="block">
              <Button
                className="w-full cursor-pointer text-white"
                disabled={isImporting}
                style={{ backgroundColor: "#8789C0" }}
                asChild
              >
                <span>
                  {isImporting ? (
                    <>
                      <Database className="h-4 w-4 mr-2 animate-spin" />
                      Restauration en cours...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Choisir une sauvegarde
                    </>
                  )}
                </span>
              </Button>
            </label>
            <input
              id="backup-file"
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={isImporting}
              className="hidden"
            />
          </div>

          {/* Status de l'import */}
          {importStatus.type && (
            <Alert
              className={importStatus.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
            >
              {importStatus.type === "success" ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={importStatus.type === "success" ? "text-green-800" : "text-red-800"}>
                {importStatus.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

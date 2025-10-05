"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StorageLocations } from "../lib/storage-locations"
import { CapacitorStorage } from "../lib/capacitor-storage"
import { Database, FileText, HardDrive, RefreshCw } from "lucide-react"

export function StorageDebug() {
  const [storageInfo, setStorageInfo] = useState<any>(null)
  const [backups, setBackups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadStorageInfo = async () => {
    setIsLoading(true)
    try {
      const [paths, backupList] = await Promise.all([
        StorageLocations.getActualPaths(),
        CapacitorStorage.listAutoBackups(),
      ])

      setStorageInfo(paths)
      setBackups(backupList)
    } catch (error) {
      console.error("Error loading storage info:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createTestBackup = async () => {
    try {
      await CapacitorStorage.createAutoBackup()
      await loadStorageInfo() // Recharger la liste
    } catch (error) {
      console.error("Error creating test backup:", error)
    }
  }

  const testDataOperations = async () => {
    try {
      // Test d'écriture
      await CapacitorStorage.setItem("test_key", JSON.stringify({ test: "data", timestamp: new Date().toISOString() }))

      // Test de lecture
      const data = await CapacitorStorage.getItem("test_key")
      console.log("Test data retrieved:", data)

      // Nettoyer
      await CapacitorStorage.removeItem("test_key")

      alert("Test de stockage réussi ! Vérifiez la console pour les détails.")
    } catch (error) {
      console.error("Storage test failed:", error)
      alert("Erreur lors du test de stockage")
    }
  }

  useEffect(() => {
    loadStorageInfo()
  }, [])

  if (!storageInfo) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Chargement des informations de stockage...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Informations de stockage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Stockage principal (Preferences)</h4>
            <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">{storageInfo.preferences}</p>
          </div>

          <div>
            <h4 className="font-medium mb-2">Dossier Documents</h4>
            <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">{storageInfo.documents}</p>
          </div>

          <div className="flex gap-2">
            <Button onClick={loadStorageInfo} variant="outline" size="sm" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
            <Button onClick={testDataOperations} variant="outline" size="sm">
              <Database className="h-4 w-4 mr-2" />
              Tester le stockage
            </Button>
            <Button onClick={createTestBackup} variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Créer une sauvegarde
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Sauvegardes automatiques ({backups.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {backups.length > 0 ? (
            <div className="space-y-2">
              {backups.map((backup, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{backup.name}</p>
                    <p className="text-sm text-muted-foreground">Date: {backup.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {backup.size && <Badge variant="secondary">{Math.round(backup.size / 1024)} KB</Badge>}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => CapacitorStorage.restoreFromAutoBackup(backup.name)}
                    >
                      Restaurer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">Aucune sauvegarde automatique trouvée</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

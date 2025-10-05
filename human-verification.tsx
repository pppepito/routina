"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, CheckCircle, AlertCircle } from "lucide-react"

export default function HumanVerification() {
  const [isVerified, setIsVerified] = useState(false)
  const [answer, setAnswer] = useState("")
  const [error, setError] = useState("")

  // Simple math question for verification
  const num1 = Math.floor(Math.random() * 10) + 1
  const num2 = Math.floor(Math.random() * 10) + 1
  const correctAnswer = num1 + num2

  const handleVerification = () => {
    const userAnswer = Number.parseInt(answer)
    if (userAnswer === correctAnswer) {
      setIsVerified(true)
      setError("")
    } else {
      setError("Réponse incorrecte. Veuillez réessayer.")
      setAnswer("")
    }
  }

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-green-700">Vérification réussie !</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">Vous êtes maintenant vérifié en tant qu'utilisateur humain.</p>
            <Button onClick={() => window.location.reload()} className="bg-green-600 hover:bg-green-700">
              Continuer vers l'application
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Shield className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <CardTitle>Vérification humaine</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-center">Pour continuer, veuillez résoudre cette simple équation :</p>

          <div className="text-center">
            <div className="text-2xl font-bold mb-4">
              {num1} + {num2} = ?
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="answer">Votre réponse</Label>
                <Input
                  id="answer"
                  type="number"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Entrez votre réponse"
                  className="text-center"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <Button onClick={handleVerification} disabled={!answer} className="w-full">
                Vérifier
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Cette vérification nous aide à protéger l'application contre les bots.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

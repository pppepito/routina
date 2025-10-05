"use client"

import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import type { User } from "@supabase/supabase-js"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Récupérer la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUpWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const signInAnonymously = async () => {
    // Créer un utilisateur anonyme avec un ID unique
    const anonymousId = `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Stocker l'ID anonyme localement
    localStorage.setItem("anonymous_user_id", anonymousId)

    // Créer un objet utilisateur fictif
    const anonymousUser = {
      id: anonymousId,
      email: `${anonymousId}@anonymous.local`,
      created_at: new Date().toISOString(),
    } as User

    setUser(anonymousUser)
    return { data: { user: anonymousUser }, error: null }
  }

  return {
    user,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    signInAnonymously,
  }
}

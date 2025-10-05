import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Types pour la base de données
export interface DatabaseHabit {
  id: string
  user_id: string
  title: string
  description: string
  color: string
  icon: string
  target_days: number[]
  weekly_target: number
  created_at: string
  updated_at: string
}

export interface DatabaseCompletion {
  id: string
  user_id: string
  habit_id: string
  date: string
  status: "completed" | "incomplete" | "failed"
  created_at: string
}

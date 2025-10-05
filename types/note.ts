export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  category: "reflection" | "goal" | "idea" | "reminder" | "other"
  mood?: "great" | "good" | "neutral" | "bad" | "terrible"
  isPrivate: boolean
  isPinned: boolean
  createdAt: string
  updatedAt: string
  habitId?: string
  attachments?: Attachment[]
}

export interface Attachment {
  id: string
  name: string
  type: "image" | "file" | "link"
  url: string
  size?: number
}

export interface NoteFilter {
  category?: Note["category"]
  tags?: string[]
  mood?: Note["mood"]
  dateRange?: {
    start: string
    end: string
  }
  searchQuery?: string
}

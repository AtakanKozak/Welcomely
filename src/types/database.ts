export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          company_name: string | null
          role: 'admin' | 'member' | 'viewer'
          plan_type: 'free' | 'pro' | 'enterprise'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          company_name?: string | null
          role?: 'admin' | 'member' | 'viewer'
          plan_type?: 'free' | 'pro' | 'enterprise'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          company_name?: string | null
          role?: 'admin' | 'member' | 'viewer'
          plan_type?: 'free' | 'pro' | 'enterprise'
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          user_id: string
          team_id: string
          role: 'admin' | 'member' | 'viewer'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          team_id: string
          role?: 'admin' | 'member' | 'viewer'
          created_at?: string
        }
        Update: {
          role?: 'admin' | 'member' | 'viewer'
        }
      }
      team_invites: {
        Row: {
          id: string
          email: string
          team_id: string
          role: 'admin' | 'member' | 'viewer'
          token: string
          status: 'pending' | 'accepted' | 'expired'
          expires_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          team_id: string
          role?: 'admin' | 'member' | 'viewer'
          token: string
          status?: 'pending' | 'accepted' | 'expired'
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: 'pending' | 'accepted' | 'expired'
          updated_at?: string
        }
      }
      checklists: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string | null
          is_template: boolean
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category?: string | null
          is_template?: boolean
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          category?: string | null
          is_template?: boolean
          is_public?: boolean
          updated_at?: string
        }
      }
      checklist_items: {
        Row: {
          id: string
          checklist_id: string
          title: string
          description: string | null
          order: number
          is_completed: boolean
          due_date: string | null
          assigned_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          checklist_id: string
          title: string
          description?: string | null
          order?: number
          is_completed?: boolean
          due_date?: string | null
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          order?: number
          is_completed?: boolean
          due_date?: string | null
          assigned_to?: string | null
          updated_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          name: string
          category: string
          description: string | null
          preview_image: string | null
          usage_count: number
          creator_id: string
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          description?: string | null
          preview_image?: string | null
          usage_count?: number
          creator_id: string
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          category?: string
          description?: string | null
          preview_image?: string | null
          usage_count?: number
          is_featured?: boolean
          updated_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          checklist_id: string
          completed_items: number
          total_items: number
          progress_percentage: number
          last_activity: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          checklist_id: string
          completed_items?: number
          total_items?: number
          progress_percentage?: number
          last_activity?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          completed_items?: number
          total_items?: number
          progress_percentage?: number
          last_activity?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Checklist = Database['public']['Tables']['checklists']['Row']
export type ChecklistItem = Database['public']['Tables']['checklist_items']['Row']
export type Template = Database['public']['Tables']['templates']['Row']
export type UserProgress = Database['public']['Tables']['user_progress']['Row']
export type TeamMember = Database['public']['Tables']['team_members']['Row']
export type TeamInvite = Database['public']['Tables']['team_invites']['Row']

// Extended types with relations
export type ChecklistWithItems = Checklist & {
  checklist_items: (ChecklistItem & {
    assignee?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  })[]
  progress?: UserProgress
}

export type TemplateWithCreator = Template & {
  creator?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
}

export type TeamMemberWithProfile = TeamMember & {
  profile: Pick<Profile, 'id' | 'full_name' | 'email' | 'avatar_url'>
}

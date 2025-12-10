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
      workspaces: {
        Row: {
          id: string
          name: string
          owner_id: string
          slug: string | null
          plan_type: 'free' | 'pro' | 'enterprise'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          owner_id: string
          slug?: string | null
          plan_type?: 'free' | 'pro' | 'enterprise'
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          owner_id?: string
          slug?: string | null
          plan_type?: 'free' | 'pro' | 'enterprise'
          updated_at?: string
        }
      }
      workspace_members: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member' | 'viewer'
          invited_by: string | null
          status: 'pending' | 'active' | 'suspended' | 'removed'
          created_at: string
          accepted_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member' | 'viewer'
          invited_by?: string | null
          status?: 'pending' | 'active' | 'suspended' | 'removed'
          created_at?: string
          accepted_at?: string | null
          updated_at?: string
        }
        Update: {
          role?: 'owner' | 'admin' | 'member' | 'viewer'
          status?: 'pending' | 'active' | 'suspended' | 'removed'
          accepted_at?: string | null
          updated_at?: string
        }
      }
      workspace_invites: {
        Row: {
          id: string
          email: string
          workspace_id: string
          role: 'admin' | 'member' | 'viewer'
          token: string
          status: 'pending' | 'accepted' | 'expired' | 'cancelled'
          invited_by: string | null
          expires_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          workspace_id: string
          role?: 'admin' | 'member' | 'viewer'
          token: string
          status?: 'pending' | 'accepted' | 'expired' | 'cancelled'
          invited_by?: string | null
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          role?: 'admin' | 'member' | 'viewer'
          status?: 'pending' | 'accepted' | 'expired' | 'cancelled'
          updated_at?: string
        }
      }
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
      checklists: {
        Row: {
          id: string
          workspace_id: string
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
          workspace_id: string
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
          workspace_id?: string
          user_id?: string
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
          workspace_id: string
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
          workspace_id: string
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
          workspace_id?: string
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
export type Workspace = Database['public']['Tables']['workspaces']['Row']
export type WorkspaceMember = Database['public']['Tables']['workspace_members']['Row']
export type WorkspaceInvite = Database['public']['Tables']['workspace_invites']['Row']

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

export type WorkspaceMemberWithProfile = WorkspaceMember & {
  profile: Pick<Profile, 'id' | 'full_name' | 'email' | 'avatar_url'>
  inviter?: Pick<Profile, 'id' | 'full_name' | 'email'>
}

export type WorkspaceInviteWithInviter = WorkspaceInvite & {
  inviter?: Pick<Profile, 'id' | 'full_name' | 'email'>
}

// Role types
export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer'
export type InviteRole = 'admin' | 'member' | 'viewer'
export type MemberStatus = 'pending' | 'active' | 'suspended' | 'removed'
export type InviteStatus = 'pending' | 'accepted' | 'expired' | 'cancelled'

// Role permissions
export interface RolePermissions {
  canInvite: boolean
  canRemoveMembers: boolean
  canChangeRoles: boolean
  canEditContent: boolean
  canDeleteContent: boolean
  canViewContent: boolean
  canManageTeam: boolean
}

export const ROLE_PERMISSIONS: Record<WorkspaceRole, RolePermissions> = {
  owner: {
    canInvite: true,
    canRemoveMembers: true,
    canChangeRoles: true,
    canEditContent: true,
    canDeleteContent: true,
    canViewContent: true,
    canManageTeam: true,
  },
  admin: {
    canInvite: true,
    canRemoveMembers: true,
    canChangeRoles: true,
    canEditContent: true,
    canDeleteContent: true,
    canViewContent: true,
    canManageTeam: true,
  },
  member: {
    canInvite: false,
    canRemoveMembers: false,
    canChangeRoles: false,
    canEditContent: true,
    canDeleteContent: false,
    canViewContent: true,
    canManageTeam: false,
  },
  viewer: {
    canInvite: false,
    canRemoveMembers: false,
    canChangeRoles: false,
    canEditContent: false,
    canDeleteContent: false,
    canViewContent: true,
    canManageTeam: false,
  },
}

// Helper function to get permissions for a role
export function getRolePermissions(role: WorkspaceRole | null | undefined): RolePermissions {
  if (!role) {
    return ROLE_PERMISSIONS.viewer
  }
  return ROLE_PERMISSIONS[role]
}

// Temporary aliases for backwards compatibility during migration
export type TeamRole = WorkspaceRole
export type TeamMember = WorkspaceMember
export type TeamInvite = WorkspaceInvite
export type TeamMemberWithProfile = WorkspaceMemberWithProfile
export type TeamInviteWithInviter = WorkspaceInviteWithInviter

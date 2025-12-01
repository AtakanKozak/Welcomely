export * from './database'

// Auth types
export interface AuthUser {
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
}

// Form types
export interface LoginFormData {
  email: string
  password: string
}

export interface SignupFormData {
  email: string
  password: string
  fullName: string
  companyName?: string
}

// Checklist form types
export interface ChecklistFormData {
  title: string
  description?: string
  category?: string
  isTemplate?: boolean
  isPublic?: boolean
}

export interface ChecklistItemFormData {
  title: string
  description?: string
  dueDate?: string
  assignedTo?: string
}

// Dashboard stats
export interface DashboardStats {
  totalChecklists: number
  completedChecklists: number
  totalTasks: number
  completedTasks: number
  averageProgress: number
}

// Category options
export const CHECKLIST_CATEGORIES = [
  'Employee Onboarding',
  'Customer Onboarding',
  'Project Setup',
  'Training',
  'Compliance',
  'IT Setup',
  'Sales',
  'Marketing',
  'HR',
  'Other',
] as const

export type ChecklistCategory = typeof CHECKLIST_CATEGORIES[number]


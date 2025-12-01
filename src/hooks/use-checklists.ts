import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getChecklists,
  getChecklist,
  createChecklist,
  createChecklistFromTemplate,
  updateChecklist,
  deleteChecklist,
  addChecklistItem,
  updateChecklistItem,
  toggleItemCompletion,
  deleteChecklistItem,
  getDashboardStats,
  getTodaysTasks,
  getUpcomingTasks,
  getAssignedToMeTasks,
  getAssignedToOthersTasks,
  getPublicChecklist,
  duplicateChecklist,
} from '@/lib/api/checklists'
import type { ChecklistWithItems, ChecklistItem } from '@/types'
import type { ChecklistTemplate } from '@/lib/templates-data'

// Query keys
export const checklistKeys = {
  all: ['checklists'] as const,
  lists: () => [...checklistKeys.all, 'list'] as const,
  list: (filters: string) => [...checklistKeys.lists(), { filters }] as const,
  details: () => [...checklistKeys.all, 'detail'] as const,
  detail: (id: string) => [...checklistKeys.details(), id] as const,
  stats: () => [...checklistKeys.all, 'stats'] as const,
  todaysTasks: () => [...checklistKeys.all, 'todays-tasks'] as const,
  upcomingTasks: () => [...checklistKeys.all, 'upcoming-tasks'] as const,
  assignedToMe: () => [...checklistKeys.all, 'assigned-to-me'] as const,
  assignedToOthers: () => [...checklistKeys.all, 'assigned-to-others'] as const,
}

// Fetch all checklists
export function useChecklists() {
  return useQuery({
    queryKey: checklistKeys.lists(),
    queryFn: getChecklists,
  })
}

// Fetch a single checklist
export function useChecklist(id: string) {
  return useQuery({
    queryKey: checklistKeys.detail(id),
    queryFn: () => getChecklist(id),
    enabled: !!id,
  })
}

export function usePublicChecklist(id: string) {
  return useQuery({
    queryKey: ['public-checklist', id],
    queryFn: () => getPublicChecklist(id),
    enabled: !!id,
  })
}

// Fetch dashboard stats
export function useDashboardStats() {
  return useQuery({
    queryKey: checklistKeys.stats(),
    queryFn: getDashboardStats,
  })
}

// Fetch today's tasks
export function useTodaysTasks() {
  return useQuery({
    queryKey: checklistKeys.todaysTasks(),
    queryFn: getTodaysTasks,
  })
}

// Fetch upcoming tasks
export function useUpcomingTasks() {
  return useQuery({
    queryKey: checklistKeys.upcomingTasks(),
    queryFn: getUpcomingTasks,
  })
}

// Fetch assigned tasks
export function useAssignedToMeTasks() {
  return useQuery({
    queryKey: checklistKeys.assignedToMe(),
    queryFn: getAssignedToMeTasks,
  })
}

export function useAssignedToOthersTasks() {
  return useQuery({
    queryKey: checklistKeys.assignedToOthers(),
    queryFn: getAssignedToOthersTasks,
  })
}

// Create checklist mutation
export function useCreateChecklist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createChecklist,
    onSuccess: (data) => {
      // Prime the cache for the detail page so navigation is instant
      const newChecklist: ChecklistWithItems = {
        ...data,
        checklist_items: [],
      } as ChecklistWithItems

      queryClient.setQueryData(checklistKeys.detail(data.id), newChecklist)
      queryClient.invalidateQueries({ queryKey: checklistKeys.lists() })
      queryClient.invalidateQueries({ queryKey: checklistKeys.stats() })
    },
  })
}

export function useApplyTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (template: ChecklistTemplate) => createChecklistFromTemplate(template),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.lists() })
      queryClient.invalidateQueries({ queryKey: checklistKeys.stats() })
      queryClient.setQueryData(checklistKeys.detail(data.id), data)
    },
  })
}

export function useDuplicateChecklist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => duplicateChecklist(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.lists() })
      queryClient.invalidateQueries({ queryKey: checklistKeys.stats() })
      queryClient.setQueryData(checklistKeys.detail(data.id), data)
    },
  })
}

// Update checklist mutation
export function useUpdateChecklist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; title?: string; description?: string; category?: string; is_public?: boolean }) =>
      updateChecklist(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.lists() })
      queryClient.invalidateQueries({ queryKey: checklistKeys.detail(data.id) })
    },
  })
}

// Delete checklist mutation
export function useDeleteChecklist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteChecklist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.lists() })
      queryClient.invalidateQueries({ queryKey: checklistKeys.stats() })
    },
  })
}

// Add checklist item mutation
export function useAddChecklistItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ checklistId, ...data }: { checklistId: string; title: string; description?: string; due_date?: string }) =>
      addChecklistItem(checklistId, data),
    onSuccess: (newItem, variables) => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.detail(variables.checklistId) })
      queryClient.invalidateQueries({ queryKey: checklistKeys.lists() })
      queryClient.invalidateQueries({ queryKey: checklistKeys.stats() })
      queryClient.invalidateQueries({ queryKey: checklistKeys.upcomingTasks() })
      queryClient.invalidateQueries({ queryKey: checklistKeys.assignedToMe() })
      queryClient.invalidateQueries({ queryKey: checklistKeys.assignedToOthers() })

      queryClient.setQueryData(
        checklistKeys.detail(variables.checklistId),
        (oldData?: ChecklistWithItems) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            checklist_items: [...(oldData.checklist_items || []), newItem],
          }
        }
      )
    },
  })
}

// Update checklist item mutation
export function useUpdateChecklistItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; title?: string; description?: string | null; is_completed?: boolean; due_date?: string | null; assigned_to?: string | null }) =>
      updateChecklistItem(id, data),
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.upcomingTasks() })
      queryClient.invalidateQueries({ queryKey: checklistKeys.assignedToMe() })
      queryClient.invalidateQueries({ queryKey: checklistKeys.assignedToOthers() })

      queryClient.setQueryData(
        checklistKeys.detail(updatedItem.checklist_id),
        (oldData?: ChecklistWithItems) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            checklist_items: (oldData.checklist_items || []).map((item) =>
              item.id === updatedItem.id ? (updatedItem as ChecklistItem) : item
            ),
          }
        }
      )
    },
  })
}

// Toggle item completion mutation
export function useToggleItemCompletion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) =>
      toggleItemCompletion(id, isCompleted),
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.upcomingTasks() })
      queryClient.invalidateQueries({ queryKey: checklistKeys.assignedToMe() })
      queryClient.invalidateQueries({ queryKey: checklistKeys.assignedToOthers() })
      
      queryClient.setQueryData(
        checklistKeys.detail(updatedItem.checklist_id),
        (oldData?: ChecklistWithItems) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            checklist_items: (oldData.checklist_items || []).map((item) =>
              item.id === updatedItem.id ? (updatedItem as ChecklistItem) : item
            ),
          }
        }
      )
    },
  })
}

// Delete checklist item mutation
export function useDeleteChecklistItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteChecklistItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.upcomingTasks() })
      queryClient.invalidateQueries({ queryKey: checklistKeys.assignedToMe() })
      queryClient.invalidateQueries({ queryKey: checklistKeys.assignedToOthers() })
      // variables would be the item id - to know checklist id we'd need to refetch
      queryClient.invalidateQueries({ queryKey: checklistKeys.all })
    },
  })
}

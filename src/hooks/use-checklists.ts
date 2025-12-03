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
import type { ChecklistWithItems, ChecklistItem, Checklist } from '@/types'
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
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

// Fetch a single checklist
export function useChecklist(id: string) {
  return useQuery({
    queryKey: checklistKeys.detail(id),
    queryFn: () => getChecklist(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  })
}

export function usePublicChecklist(id: string) {
  return useQuery({
    queryKey: ['public-checklist', id],
    queryFn: () => getPublicChecklist(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}

// Fetch dashboard stats
export function useDashboardStats() {
  return useQuery({
    queryKey: checklistKeys.stats(),
    queryFn: getDashboardStats,
    staleTime: 1000 * 60 * 2,
  })
}

// Fetch today's tasks
export function useTodaysTasks() {
  return useQuery({
    queryKey: checklistKeys.todaysTasks(),
    queryFn: getTodaysTasks,
    staleTime: 1000 * 60,
  })
}

// Fetch upcoming tasks
export function useUpcomingTasks() {
  return useQuery({
    queryKey: checklistKeys.upcomingTasks(),
    queryFn: getUpcomingTasks,
    staleTime: 1000 * 60,
  })
}

// Fetch assigned tasks
export function useAssignedToMeTasks() {
  return useQuery({
    queryKey: checklistKeys.assignedToMe(),
    queryFn: getAssignedToMeTasks,
    staleTime: 1000 * 30, // 30 seconds for tasks
  })
}

export function useAssignedToOthersTasks() {
  return useQuery({
    queryKey: checklistKeys.assignedToOthers(),
    queryFn: getAssignedToOthersTasks,
    staleTime: 1000 * 30,
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

// Update checklist mutation with optimistic update
export function useUpdateChecklist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; title?: string; description?: string; category?: string; is_public?: boolean }) =>
      updateChecklist(id, data),
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: checklistKeys.detail(variables.id) })
      await queryClient.cancelQueries({ queryKey: checklistKeys.lists() })

      // Snapshot previous values
      const previousDetail = queryClient.getQueryData<ChecklistWithItems>(checklistKeys.detail(variables.id))
      const previousList = queryClient.getQueryData<ChecklistWithItems[]>(checklistKeys.lists())

      // Optimistically update the detail cache
      if (previousDetail) {
        queryClient.setQueryData<ChecklistWithItems>(
          checklistKeys.detail(variables.id),
          { ...previousDetail, ...variables, updated_at: new Date().toISOString() }
        )
      }

      // Optimistically update the list cache
      if (previousList) {
        queryClient.setQueryData<ChecklistWithItems[]>(
          checklistKeys.lists(),
          previousList.map((checklist) =>
            checklist.id === variables.id
              ? { ...checklist, ...variables, updated_at: new Date().toISOString() }
              : checklist
          )
        )
      }

      return { previousDetail, previousList }
    },
    onError: (_error, variables, context) => {
      // Rollback on error
      if (context?.previousDetail) {
        queryClient.setQueryData(checklistKeys.detail(variables.id), context.previousDetail)
      }
      if (context?.previousList) {
        queryClient.setQueryData(checklistKeys.lists(), context.previousList)
      }
    },
    onSettled: (_data, _error, variables) => {
      // Always refetch after error or success to ensure data is correct
      queryClient.invalidateQueries({ queryKey: checklistKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: checklistKeys.lists() })
    },
  })
}

// Delete checklist mutation with optimistic update and proper error handling
export function useDeleteChecklist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteChecklist,
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: checklistKeys.lists() })
      await queryClient.cancelQueries({ queryKey: checklistKeys.stats() })
      await queryClient.cancelQueries({ queryKey: checklistKeys.detail(id) })

      // Snapshot the previous values
      const previousList = queryClient.getQueryData<ChecklistWithItems[]>(checklistKeys.lists())
      const previousDetail = queryClient.getQueryData<ChecklistWithItems>(checklistKeys.detail(id))

      // Optimistically remove from list
      if (previousList) {
        queryClient.setQueryData<ChecklistWithItems[]>(
          checklistKeys.lists(),
          previousList.filter((checklist) => checklist.id !== id)
        )
      }

      // Remove from detail cache
      queryClient.removeQueries({ queryKey: checklistKeys.detail(id) })

      return { previousList, previousDetail, id }
    },
    onError: (error, id, context) => {
      // Log the error for debugging
      console.error('Delete checklist error:', error)
      
      // Rollback the optimistic update
      if (context?.previousList) {
        queryClient.setQueryData(checklistKeys.lists(), context.previousList)
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(checklistKeys.detail(id), context.previousDetail)
      }
    },
    onSuccess: (_data, id) => {
      // Ensure the item is removed from all caches
      queryClient.removeQueries({ queryKey: checklistKeys.detail(id) })
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: checklistKeys.lists() })
      queryClient.invalidateQueries({ queryKey: checklistKeys.stats() })
      queryClient.invalidateQueries({ queryKey: checklistKeys.upcomingTasks() })
      queryClient.invalidateQueries({ queryKey: checklistKeys.assignedToMe() })
      queryClient.invalidateQueries({ queryKey: checklistKeys.assignedToOthers() })
    },
  })
}

// Add checklist item mutation with optimistic update
export function useAddChecklistItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ checklistId, ...data }: { checklistId: string; title: string; description?: string; due_date?: string }) =>
      addChecklistItem(checklistId, data),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: checklistKeys.detail(variables.checklistId) })

      const previousDetail = queryClient.getQueryData<ChecklistWithItems>(checklistKeys.detail(variables.checklistId))

      // Create an optimistic item with a temporary ID
      if (previousDetail) {
        const tempId = `temp-${Date.now()}`
        const existingItems = previousDetail.checklist_items || []
        const nextOrder = existingItems.length > 0 
          ? Math.max(...existingItems.map(i => i.order)) + 1 
          : 0

        const optimisticItem: ChecklistItem = {
          id: tempId,
          checklist_id: variables.checklistId,
          title: variables.title,
          description: variables.description || null,
          due_date: variables.due_date || null,
          is_completed: false,
          order: nextOrder,
          assigned_to: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        queryClient.setQueryData<ChecklistWithItems>(
          checklistKeys.detail(variables.checklistId),
          {
            ...previousDetail,
            checklist_items: [...existingItems, optimisticItem],
          }
        )
      }

      return { previousDetail }
    },
    onError: (_error, variables, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(checklistKeys.detail(variables.checklistId), context.previousDetail)
      }
    },
    onSuccess: (newItem, variables) => {
      // Replace the optimistic item with the real one
      queryClient.setQueryData<ChecklistWithItems>(
        checklistKeys.detail(variables.checklistId),
        (oldData) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            checklist_items: (oldData.checklist_items || [])
              .filter((item) => !item.id.startsWith('temp-'))
              .concat(newItem),
          }
        }
      )
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.lists() })
      queryClient.invalidateQueries({ queryKey: checklistKeys.stats() })
      queryClient.invalidateQueries({ queryKey: checklistKeys.upcomingTasks() })
    },
  })
}

// Update checklist item mutation with optimistic update
export function useUpdateChecklistItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; title?: string; description?: string | null; is_completed?: boolean; due_date?: string | null; assigned_to?: string | null }) =>
      updateChecklistItem(id, data),
    onMutate: async (variables) => {
      // We need to find which checklist this item belongs to
      const allChecklists = queryClient.getQueryData<ChecklistWithItems[]>(checklistKeys.lists()) || []
      let checklistId: string | null = null
      
      for (const checklist of allChecklists) {
        if (checklist.checklist_items?.some(item => item.id === variables.id)) {
          checklistId = checklist.id
          break
        }
      }

      if (!checklistId) return { previousDetail: undefined }

      await queryClient.cancelQueries({ queryKey: checklistKeys.detail(checklistId) })
      const previousDetail = queryClient.getQueryData<ChecklistWithItems>(checklistKeys.detail(checklistId))

      if (previousDetail) {
        queryClient.setQueryData<ChecklistWithItems>(
          checklistKeys.detail(checklistId),
          {
            ...previousDetail,
            checklist_items: (previousDetail.checklist_items || []).map((item) =>
              item.id === variables.id
                ? { ...item, ...variables, updated_at: new Date().toISOString() }
                : item
            ),
          }
        )
      }

      return { previousDetail, checklistId }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousDetail && context?.checklistId) {
        queryClient.setQueryData(checklistKeys.detail(context.checklistId), context.previousDetail)
      }
    },
    onSuccess: (updatedItem) => {
      queryClient.setQueryData<ChecklistWithItems>(
        checklistKeys.detail(updatedItem.checklist_id),
        (oldData) => {
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
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.upcomingTasks() })
      queryClient.invalidateQueries({ queryKey: checklistKeys.assignedToMe() })
      queryClient.invalidateQueries({ queryKey: checklistKeys.assignedToOthers() })
    },
  })
}

// Toggle item completion mutation with optimistic update
export function useToggleItemCompletion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) =>
      toggleItemCompletion(id, isCompleted),
    onMutate: async (variables) => {
      // Find the checklist containing this item
      const allChecklists = queryClient.getQueryData<ChecklistWithItems[]>(checklistKeys.lists()) || []
      let checklistId: string | null = null
      
      for (const checklist of allChecklists) {
        if (checklist.checklist_items?.some(item => item.id === variables.id)) {
          checklistId = checklist.id
          break
        }
      }

      // Also check individual detail caches if not found in list
      if (!checklistId) {
        const cache = queryClient.getQueriesData<ChecklistWithItems>({ queryKey: checklistKeys.details() })
        for (const [, data] of cache) {
          if (data?.checklist_items?.some(item => item.id === variables.id)) {
            checklistId = data.id
            break
          }
        }
      }

      if (!checklistId) return { previousDetail: undefined, previousList: undefined }

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: checklistKeys.detail(checklistId) })
      await queryClient.cancelQueries({ queryKey: checklistKeys.lists() })
      await queryClient.cancelQueries({ queryKey: checklistKeys.assignedToMe() })
      await queryClient.cancelQueries({ queryKey: checklistKeys.assignedToOthers() })

      // Snapshot previous values
      const previousDetail = queryClient.getQueryData<ChecklistWithItems>(checklistKeys.detail(checklistId))
      const previousList = queryClient.getQueryData<ChecklistWithItems[]>(checklistKeys.lists())
      const previousAssignedToMe = queryClient.getQueryData(checklistKeys.assignedToMe())
      const previousAssignedToOthers = queryClient.getQueryData(checklistKeys.assignedToOthers())

      // Optimistically update detail cache
      if (previousDetail) {
        queryClient.setQueryData<ChecklistWithItems>(
          checklistKeys.detail(checklistId),
          {
            ...previousDetail,
            checklist_items: (previousDetail.checklist_items || []).map((item) =>
              item.id === variables.id
                ? { ...item, is_completed: variables.isCompleted, updated_at: new Date().toISOString() }
                : item
            ),
          }
        )
      }

      // Optimistically update list cache
      if (previousList) {
        queryClient.setQueryData<ChecklistWithItems[]>(
          checklistKeys.lists(),
          previousList.map((checklist) => {
            if (checklist.id !== checklistId) return checklist
            return {
              ...checklist,
              checklist_items: (checklist.checklist_items || []).map((item) =>
                item.id === variables.id
                  ? { ...item, is_completed: variables.isCompleted, updated_at: new Date().toISOString() }
                  : item
              ),
            }
          })
        )
      }

      // Optimistically update assigned tasks (remove completed, add uncompleted)
      if (previousAssignedToMe && Array.isArray(previousAssignedToMe)) {
        if (variables.isCompleted) {
          queryClient.setQueryData(
            checklistKeys.assignedToMe(),
            (previousAssignedToMe as any[]).filter((task) => task.id !== variables.id)
          )
        }
      }
      if (previousAssignedToOthers && Array.isArray(previousAssignedToOthers)) {
        if (variables.isCompleted) {
          queryClient.setQueryData(
            checklistKeys.assignedToOthers(),
            (previousAssignedToOthers as any[]).filter((task) => task.id !== variables.id)
          )
        }
      }

      return { 
        previousDetail, 
        previousList, 
        previousAssignedToMe, 
        previousAssignedToOthers,
        checklistId 
      }
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context?.previousDetail && context?.checklistId) {
        queryClient.setQueryData(checklistKeys.detail(context.checklistId), context.previousDetail)
      }
      if (context?.previousList) {
        queryClient.setQueryData(checklistKeys.lists(), context.previousList)
      }
      if (context?.previousAssignedToMe) {
        queryClient.setQueryData(checklistKeys.assignedToMe(), context.previousAssignedToMe)
      }
      if (context?.previousAssignedToOthers) {
        queryClient.setQueryData(checklistKeys.assignedToOthers(), context.previousAssignedToOthers)
      }
    },
    onSuccess: (updatedItem) => {
      // Ensure the real data is in cache
      queryClient.setQueryData<ChecklistWithItems>(
        checklistKeys.detail(updatedItem.checklist_id),
        (oldData) => {
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
    onSettled: () => {
      // Revalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: checklistKeys.stats() })
      queryClient.invalidateQueries({ queryKey: checklistKeys.upcomingTasks() })
      queryClient.invalidateQueries({ queryKey: checklistKeys.assignedToMe() })
      queryClient.invalidateQueries({ queryKey: checklistKeys.assignedToOthers() })
    },
  })
}

// Delete checklist item mutation with optimistic update
export function useDeleteChecklistItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteChecklistItem,
    onMutate: async (itemId) => {
      // Find the checklist containing this item
      const allChecklists = queryClient.getQueryData<ChecklistWithItems[]>(checklistKeys.lists()) || []
      let checklistId: string | null = null
      
      for (const checklist of allChecklists) {
        if (checklist.checklist_items?.some(item => item.id === itemId)) {
          checklistId = checklist.id
          break
        }
      }

      if (!checklistId) {
        const cache = queryClient.getQueriesData<ChecklistWithItems>({ queryKey: checklistKeys.details() })
        for (const [, data] of cache) {
          if (data?.checklist_items?.some(item => item.id === itemId)) {
            checklistId = data.id
            break
          }
        }
      }

      if (!checklistId) return { previousDetail: undefined }

      await queryClient.cancelQueries({ queryKey: checklistKeys.detail(checklistId) })
      const previousDetail = queryClient.getQueryData<ChecklistWithItems>(checklistKeys.detail(checklistId))

      // Optimistically remove the item
      if (previousDetail) {
        queryClient.setQueryData<ChecklistWithItems>(
          checklistKeys.detail(checklistId),
          {
            ...previousDetail,
            checklist_items: (previousDetail.checklist_items || []).filter(
              (item) => item.id !== itemId
            ),
          }
        )
      }

      return { previousDetail, checklistId }
    },
    onError: (_error, _itemId, context) => {
      if (context?.previousDetail && context?.checklistId) {
        queryClient.setQueryData(checklistKeys.detail(context.checklistId), context.previousDetail)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.lists() })
      queryClient.invalidateQueries({ queryKey: checklistKeys.stats() })
      queryClient.invalidateQueries({ queryKey: checklistKeys.upcomingTasks() })
      queryClient.invalidateQueries({ queryKey: checklistKeys.assignedToMe() })
      queryClient.invalidateQueries({ queryKey: checklistKeys.assignedToOthers() })
    },
  })
}

import { supabase } from '@/lib/supabase'
import type { Checklist, ChecklistItem, ChecklistWithItems } from '@/types'
import type { ChecklistTemplate } from '@/lib/templates-data'

const ASSIGNED_TASK_SELECT = `
  *,
  checklists!inner (
    id,
    title,
    user_id
  ),
  assignee:profiles!checklist_items_assigned_to_fkey (
    id,
    full_name,
    email,
    avatar_url
  )
`

// Fetch all checklists for the current user
export async function getChecklists() {
  const { data: checklists, error } = await supabase
    .from('checklists')
    .select(`
      *,
      checklist_items (*)
    `)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return checklists as ChecklistWithItems[]
}

// Fetch a single checklist by ID
export async function getChecklist(id: string) {
  const { data, error } = await supabase
    .from('checklists')
    .select(`
      *,
      checklist_items (*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data as ChecklistWithItems
}

// Create a new checklist
export async function createChecklist(input: {
  title: string
  description?: string
  category?: string
}) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('checklists')
    .insert({
      user_id: user.id,
      title: input.title,
      description: input.description || null,
      category: input.category || null,
    })
    .select()
    .single()

  if (error) throw error
  return data as Checklist
}

export async function createChecklistFromTemplate(template: ChecklistTemplate) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: checklist, error } = await supabase
    .from('checklists')
    .insert({
      user_id: user.id,
      title: template.name,
      description: template.description,
      category: template.category,
      is_template: false,
      is_public: false,
    })
    .select()
    .single()

  if (error) throw error

  if (template.tasks.length) {
    const itemsPayload = template.tasks.map((task, index) => ({
      checklist_id: checklist.id,
      title: task.title,
      description: task.description || null,
      order: index,
      is_completed: false,
    }))

    const { error: itemsError } = await supabase
      .from('checklist_items')
      .insert(itemsPayload)

    if (itemsError) throw itemsError
  }

  // Fetch the checklist with items so UI is ready
  return await getChecklist(checklist.id)
}

export async function getPublicChecklist(id: string) {
  const { data, error } = await supabase
    .from('checklists')
    .select(`
      *,
      checklist_items (*)
    `)
    .eq('id', id)
    .eq('is_public', true)
    .single()

  if (error) throw error
  return data as ChecklistWithItems
}

export async function duplicateChecklist(id: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const original = await getChecklist(id)

  const { data: newChecklist, error } = await supabase
    .from('checklists')
    .insert({
      user_id: user.id,
      title: `${original.title} (Copy)`,
      description: original.description,
      category: original.category,
      is_template: false,
      is_public: false,
    })
    .select()
    .single()

  if (error) throw error

  if (original.checklist_items?.length) {
    const payload = original.checklist_items.map((item) => ({
      checklist_id: newChecklist.id,
      title: item.title,
      description: item.description,
      order: item.order,
      is_completed: false,
      due_date: item.due_date,
    }))

    const { error: cloneError } = await supabase
      .from('checklist_items')
      .insert(payload)

    if (cloneError) throw cloneError
  }

  return await getChecklist(newChecklist.id)
}

// Update a checklist
export async function updateChecklist(id: string, input: {
  title?: string
  description?: string
  category?: string | null
  is_public?: boolean
}) {
  const { data, error } = await supabase
    .from('checklists')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Checklist
}

// Delete a checklist
export async function deleteChecklist(id: string) {
  const { error } = await supabase
    .from('checklists')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Add an item to a checklist
export async function addChecklistItem(checklistId: string, input: {
  title: string
  description?: string
  due_date?: string
  order?: number
}) {
  // Get the current max order
  const { data: items } = await supabase
    .from('checklist_items')
    .select('order')
    .eq('checklist_id', checklistId)
    .order('order', { ascending: false })
    .limit(1)

  const nextOrder = items && items.length > 0 ? (items[0].order + 1) : 0

  const { data, error } = await supabase
    .from('checklist_items')
    .insert({
      checklist_id: checklistId,
      title: input.title,
      description: input.description || null,
      due_date: input.due_date || null,
      order: input.order ?? nextOrder,
    })
    .select()
    .single()

  if (error) throw error
  return data as ChecklistItem
}

// Update a checklist item
export async function updateChecklistItem(id: string, input: {
  title?: string
  description?: string
  is_completed?: boolean
  due_date?: string | null
  order?: number
  assigned_to?: string | null
}) {
  const { data, error } = await supabase
    .from('checklist_items')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as ChecklistItem
}

// Toggle item completion
export async function toggleItemCompletion(id: string, isCompleted: boolean) {
  return updateChecklistItem(id, { is_completed: isCompleted })
}

// Delete a checklist item
export async function deleteChecklistItem(id: string) {
  const { error } = await supabase
    .from('checklist_items')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Reorder checklist items
export async function reorderChecklistItems(items: { id: string; order: number }[]) {
  const updates = items.map(item => 
    supabase
      .from('checklist_items')
      .update({ order: item.order })
      .eq('id', item.id)
  )

  await Promise.all(updates)
}

// Get tasks assigned to the current user
export async function getAssignedToMeTasks() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('checklist_items')
    .select(ASSIGNED_TASK_SELECT)
    .eq('assigned_to', user.id)
    .eq('is_completed', false)
    .order('due_date', { ascending: true })
    .limit(10)

  if (error) throw error
  return data
}

// Get tasks assigned to teammates (owned checklists, assigned to others)
export async function getAssignedToOthersTasks() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('checklist_items')
    .select(ASSIGNED_TASK_SELECT)
    .eq('checklists.user_id', user.id)
    .not('assigned_to', 'is', null)
    .neq('assigned_to', user.id)
    .eq('is_completed', false)
    .order('due_date', { ascending: true })
    .limit(10)

  if (error) throw error
  return data
}

// Get dashboard stats
export async function getDashboardStats() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get all checklists with items
  const { data: checklists, error } = await supabase
    .from('checklists')
    .select(`
      *,
      checklist_items (*)
    `)
    // No filtering by user_id here, rely on RLS to return accessible checklists
    // But we might want to distinguish between "my checklists" and "team checklists" in the UI later

  if (error) throw error

  const checklistsData = checklists as ChecklistWithItems[]

  // Calculate stats
  const totalChecklists = checklistsData.length
  let totalItems = 0
  let completedItems = 0
  let completedChecklists = 0
  const categoryStats: Record<string, number> = {}
  const completionHistory: Record<string, number> = {} // Date -> completed count

  checklistsData.forEach(checklist => {
    const items = checklist.checklist_items || []
    totalItems += items.length
    const completed = items.filter(item => item.is_completed).length
    completedItems += completed
    
    if (items.length > 0 && completed === items.length) {
      completedChecklists++
    }

    // Category stats
    const category = checklist.category || 'Uncategorized'
    categoryStats[category] = (categoryStats[category] || 0) + items.length

    // Activity history from updated_at (simplified for now)
    const date = new Date(checklist.updated_at).toLocaleDateString()
    if (completed > 0) {
      completionHistory[date] = (completionHistory[date] || 0) + completed
    }
  })

  const averageProgress = totalItems > 0 
    ? Math.round((completedItems / totalItems) * 100) 
    : 0

  // Activity log simulation (fetching recent item updates)
  const { data: recentActivity } = await supabase
    .from('checklist_items')
    .select(`
      id,
      title,
      is_completed,
      updated_at,
      checklists (
        title
      )
    `)
    .eq('is_completed', true)
    .order('updated_at', { ascending: false })
    .limit(5)

  // Get assigned tasks count
  const { count: assignedCount } = await supabase
    .from('checklist_items')
    .select('id', { count: 'exact', head: true })
    .eq('assigned_to', user.id)
    .eq('is_completed', false)

  return {
    totalChecklists,
    completedChecklists,
    inProgressChecklists: totalChecklists - completedChecklists,
    totalItems,
    completedItems,
    pendingItems: totalItems - completedItems,
    averageProgress,
    categoryStats,
    recentActivity: recentActivity || [],
    assignedCount: assignedCount || 0
  }
}

// Get today's tasks
function getUtcDateRange(daysAhead: number) {
  const startUtc = new Date()
  startUtc.setUTCHours(0, 0, 0, 0)

  const endUtc = new Date(startUtc)
  endUtc.setUTCDate(endUtc.getUTCDate() + daysAhead)
  endUtc.setUTCHours(23, 59, 59, 999)

  return { startUtc, endUtc }
}

export async function getTodaysTasks() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { startUtc, endUtc } = getUtcDateRange(0)

  // Include tasks assigned to me OR tasks in my checklists
  const { data, error } = await supabase
    .from('checklist_items')
    .select(`
      *,
      checklists!inner (
        id,
        title,
        user_id
      )
    `)
    .or(`assigned_to.eq.${user.id},checklists.user_id.eq.${user.id}`)
    .not('due_date', 'is', null)
    .gte('due_date', startUtc.toISOString())
    .lte('due_date', endUtc.toISOString())
    .eq('is_completed', false)
    .order('due_date', { ascending: true })

  if (error) throw error
  return data
}

// Get upcoming tasks (next 7 days)
export async function getUpcomingTasks() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { startUtc, endUtc } = getUtcDateRange(7)

  const { data, error } = await supabase
    .from('checklist_items')
    .select(`
      *,
      checklists!inner (
        id,
        title,
        user_id
      )
    `)
    .or(`assigned_to.eq.${user.id},checklists.user_id.eq.${user.id}`)
    .not('due_date', 'is', null)
    .gte('due_date', startUtc.toISOString())
    .lte('due_date', endUtc.toISOString())
    .order('is_completed', { ascending: true })
    .order('due_date', { ascending: true })
    .limit(15)

  if (error) throw error
  return data
}

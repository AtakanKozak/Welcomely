import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  ArrowLeft,
  Share2,
  Trash2,
  Plus,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ListChecks,
  Copy,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { EditableTitle, EditableText } from '@/components/shared/editable-text'
import { ChecklistItem } from '@/components/checklist/checklist-item'
import {
  useChecklist,
  useUpdateChecklist,
  useAddChecklistItem,
  useUpdateChecklistItem,
  useDeleteChecklistItem,
  useDeleteChecklist,
  checklistKeys,
  useDuplicateChecklist,
} from '@/hooks/use-checklists'
import { reorderChecklistItems } from '@/lib/api/checklists'
import type { ChecklistItem as ChecklistItemType } from '@/types'
import { useQueryClient } from '@tanstack/react-query'
import { ShareChecklistDialog } from '@/components/checklist/share-checklist-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CHECKLIST_CATEGORIES } from '@/types'

// Loading skeleton
function ChecklistDetailSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-2 w-full" />
      <Skeleton className="h-12 w-full" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>
  )
}

export function ChecklistDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [showCompleted, setShowCompleted] = useState(true)
  const [items, setItems] = useState<ChecklistItemType[]>([])
  const newTaskInputRef = useRef<HTMLInputElement>(null)

  // Queries and mutations
  const { data: checklist, isLoading, error } = useChecklist(id!)
  const updateChecklist = useUpdateChecklist()
  const addItem = useAddChecklistItem()
  const updateItem = useUpdateChecklistItem()
  const deleteItem = useDeleteChecklistItem()
  const deleteChecklist = useDeleteChecklist()
  const duplicateChecklistMutation = useDuplicateChecklist()
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isUpdatingShare, setIsUpdatingShare] = useState(false)

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Sync items from checklist
  useEffect(() => {
    if (checklist?.checklist_items) {
      setItems([...checklist.checklist_items].sort((a, b) => a.order - b.order))
    }
  }, [checklist])

  // Focus on new task input when page loads
  useEffect(() => {
    if (!isLoading && newTaskInputRef.current) {
      // Small delay to ensure smooth animation
      const timer = setTimeout(() => {
        newTaskInputRef.current?.focus()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  // Calculate progress
  const completedCount = items.filter(item => item.is_completed).length
  const totalCount = items.length
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // Filter items based on showCompleted
  const visibleItems = showCompleted
    ? items
    : items.filter(item => !item.is_completed)

  // Handlers
  const handleAddTask = async () => {
    const title = newTaskTitle.trim()
    if (!title || !id) return

    setNewTaskTitle('')
    try {
      const newChecklistItem = await addItem.mutateAsync({
        checklistId: id,
        title,
      })

      setItems((prev) => {
        const updated = [...prev, newChecklistItem]
        return updated.sort((a, b) => a.order - b.order)
      })
    } catch (error) {
      console.error('Failed to add task:', error)
      setNewTaskTitle(title)
    } finally {
      newTaskInputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTask()
    }
  }

  const handleToggleItem = async (itemId: string, isCompleted: boolean) => {
    // Optimistic update
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, is_completed: isCompleted } : item
    ))
    await updateItem.mutateAsync({ id: itemId, is_completed: isCompleted })
  }

  const handleUpdateItem = async (itemId: string, data: { title?: string; description?: string; due_date?: string | null }) => {
    // Optimistic update
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, ...data } : item
    ))
    await updateItem.mutateAsync({ id: itemId, ...data })
  }

  const handleDeleteItem = async (itemId: string) => {
    // Optimistic update
    setItems(prev => prev.filter(item => item.id !== itemId))
    await deleteItem.mutateAsync(itemId)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id)
      const newIndex = items.findIndex(item => item.id === over.id)

      const newItems = arrayMove(items, oldIndex, newIndex)
      
      // Update order values
      const reorderedItems = newItems.map((item, index) => ({
        ...item,
        order: index,
      }))

      // Optimistic update
      setItems(reorderedItems)

      // Save to database
      await reorderChecklistItems(
        reorderedItems.map(item => ({ id: item.id, order: item.order }))
      )
      if (id) {
        queryClient.invalidateQueries({ queryKey: checklistKeys.detail(id) })
      }
    }
  }

  const handleUpdateTitle = async (title: string) => {
    if (!id) return
    await updateChecklist.mutateAsync({ id, title })
  }

  const handleUpdateDescription = async (description: string) => {
    if (!id) return
    await updateChecklist.mutateAsync({ id, description })
  }

  const handleUpdateCategory = async (value: string) => {
    if (!id) return
    await updateChecklist.mutateAsync({ id, category: value === 'none' ? null : value })
  }

  const handleCompleteAll = async () => {
    const incomplete = items.filter((item) => !item.is_completed)
    if (!incomplete.length) return

    setItems((prev) => prev.map((item) => ({ ...item, is_completed: true })))
    await Promise.all(
      incomplete.map((item) =>
        updateItem.mutateAsync({ id: item.id, is_completed: true })
      )
    )
  }

  const handleDeleteCompleted = async () => {
    const completed = items.filter((item) => item.is_completed)
    if (!completed.length) return

    setItems((prev) => prev.filter((item) => !item.is_completed))
    await Promise.all(completed.map((item) => deleteItem.mutateAsync(item.id)))
  }

  const handleDuplicateChecklistClick = async () => {
    if (!id) return
    try {
      const duplicate = await duplicateChecklistMutation.mutateAsync(id)
      navigate(`/checklists/${duplicate.id}`)
    } catch (error) {
      console.error('Failed to duplicate checklist:', error)
    }
  }

  const handleDeleteChecklist = async () => {
    if (!id) return
    await deleteChecklist.mutateAsync(id)
    navigate('/checklists')
  }

  const handleToggleShare = async (value: boolean) => {
    if (!id) return
    setIsUpdatingShare(true)
    try {
      await updateChecklist.mutateAsync({ id, is_public: value })
      await queryClient.invalidateQueries({ queryKey: checklistKeys.detail(id) })
    } catch (error) {
      console.error('Failed to toggle share status:', error)
    } finally {
      setIsUpdatingShare(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <ChecklistDetailSkeleton />
      </div>
    )
  }

  // Error state
  if (error || !checklist) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="p-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-4 rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Checklist not found</h3>
              <p className="text-muted-foreground mt-1">
                This checklist may have been deleted or you don't have access to it.
              </p>
            </div>
            <Button asChild>
              <Link to="/checklists">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Checklists
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-4">
        {/* Navigation and Actions */}
        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/checklists">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsShareDialogOpen(true)}
                  disabled={isUpdatingShare}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share checklist</TooltipContent>
            </Tooltip>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete checklist?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the checklist
                    "{checklist.title}" and all its tasks.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteChecklist}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Title and Description */}
        <div>
          <EditableTitle
            value={checklist.title}
            onSave={handleUpdateTitle}
            placeholder="Untitled Checklist"
            className="text-2xl sm:text-3xl font-bold tracking-tight"
          />
          <EditableText
            value={checklist.description || ''}
            onSave={handleUpdateDescription}
            placeholder="Add a description..."
            className="text-muted-foreground mt-1 block"
            multiline
          />
        </div>

        {/* Meta info */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 flex-wrap text-sm">
            {checklist.category && checklist.category.length > 0 && (
              <span className="px-2 py-1 bg-secondary rounded-full text-xs font-medium">
                {checklist.category}
              </span>
            )}
            <span className="text-muted-foreground">
              Updated {formatRelativeTime(checklist.updated_at)}
            </span>
          </div>
          <div className="w-full sm:w-auto min-w-[220px]">
            <Select
              value={checklist.category ?? 'none'}
              onValueChange={handleUpdateCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="none">No category</SelectItem>
                {CHECKLIST_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {completedCount} of {totalCount} tasks completed
            </span>
            <span className="font-medium">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>

      {/* Quick Add Input */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Plus className="h-4 w-4 text-primary" />
            </div>
            <Input
              ref={newTaskInputRef}
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a new task... (press Enter)"
              className="flex-1 border-0 shadow-none focus-visible:ring-0 text-base"
            />
            {newTaskTitle && (
              <Button size="sm" onClick={handleAddTask} disabled={addItem.isPending}>
                {addItem.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Add'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk actions */}
      {items.length > 0 && (
        <Card className="border-dashed">
          <CardContent className="p-4 flex flex-wrap gap-3">
            <Button variant="secondary" onClick={handleCompleteAll} disabled={items.every((item) => item.is_completed)}>
              Complete all
            </Button>
            <Button variant="secondary" onClick={handleDeleteCompleted} disabled={!items.some((item) => item.is_completed)}>
              Delete completed
            </Button>
            <Button variant="outline" onClick={handleDuplicateChecklistClick} disabled={duplicateChecklistMutation.isPending}>
              {duplicateChecklistMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Duplicating...
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate checklist
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Show/Hide Completed Toggle */}
      {items.some(item => item.is_completed) && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {completedCount} completed task{completedCount !== 1 ? 's' : ''}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCompleted(!showCompleted)}
            className="text-muted-foreground"
          >
            {showCompleted ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Hide completed
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Show completed
              </>
            )}
          </Button>
        </div>
      )}

      {/* Checklist Items */}
      {items.length === 0 ? (
        <Card className="p-12 text-center space-y-4 border-dashed">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-primary/10 text-primary">
              <ListChecks className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Build your onboarding flow</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Start by adding the first task or pick a template from the marketplace to get a head start.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button onClick={() => newTaskInputRef.current?.focus()}>
                <Plus className="mr-2 h-4 w-4" />
                Add your first task
              </Button>
              <Button variant="outline" asChild>
                <Link to="/templates">Browse templates</Link>
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={visibleItems.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {visibleItems.map((item) => (
                <ChecklistItem
                  key={item.id}
                  item={item}
                  onToggle={handleToggleItem}
                  onUpdate={handleUpdateItem}
                  onDelete={handleDeleteItem}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Completion celebration */}
      {totalCount > 0 && completedCount === totalCount && (
        <Card className="p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-500/20">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-700 dark:text-green-400">
                All tasks completed! 🎉
              </h3>
              <p className="text-sm text-green-600/80 dark:text-green-400/80">
                Great job! You've completed all {totalCount} tasks in this checklist.
              </p>
            </div>
          </div>
        </Card>
      )}

      {checklist && (
        <ShareChecklistDialog
          open={isShareDialogOpen}
          onClose={() => setIsShareDialogOpen(false)}
          checklistId={checklist.id}
          isPublic={!!checklist.is_public}
          onTogglePublic={handleToggleShare}
        />
      )}
    </div>
  )
}


import { useState, useRef, useEffect } from 'react'
import type { KeyboardEvent } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format } from 'date-fns'
import {
  GripVertical,
  Trash2,
  Calendar,
  ChevronDown,
  ChevronUp,
  X,
  User as UserIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { ChecklistItem as ChecklistItemType } from '@/types'
import { useTeamMembers } from '@/hooks/use-team'
import { useProfile } from '@/hooks/use-auth'

interface ChecklistItemProps {
  item: ChecklistItemType
  onToggle: (id: string, isCompleted: boolean) => void
  onUpdate: (id: string, data: { title?: string; description?: string | null; due_date?: string | null; assigned_to?: string | null }) => void
  onDelete: (id: string) => void
  disabled?: boolean
}

export function ChecklistItem({
  item,
  onToggle,
  onUpdate,
  onDelete,
  disabled = false,
}: ChecklistItemProps) {
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window === 'undefined') return false
    const stored = window.localStorage.getItem(`checklist-item-details-${item.id}`)
    if (stored !== null) return stored === 'true'
    return Boolean(item.description)
  })
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(item.title)
  const [descriptionValue, setDescriptionValue] = useState(item.description || '')
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)

  const { data: teamMembers } = useTeamMembers()
  const currentUser = useProfile()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [isEditingTitle])

  useEffect(() => {
    setTitleValue(item.title)
    setDescriptionValue(item.description || '')
  }, [item.title, item.description])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(`checklist-item-details-${item.id}`, String(isExpanded))
  }, [item.id, isExpanded])

  const handleTitleSave = () => {
    const trimmed = titleValue.trim()
    if (trimmed && trimmed !== item.title) {
      onUpdate(item.id, { title: trimmed })
    } else {
      setTitleValue(item.title)
    }
    setIsEditingTitle(false)
  }

  const handleTitleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleTitleSave()
    } else if (e.key === 'Escape') {
      setTitleValue(item.title)
      setIsEditingTitle(false)
    }
  }

  const handleDescriptionSave = () => {
    const trimmed = descriptionValue.trim()
    if (trimmed !== (item.description || '')) {
      onUpdate(item.id, { description: trimmed || null })
    }
  }

  const handleDateSelect = (dateStr: string) => {
    if (!dateStr) {
      handleClearDate()
      return
    }
    const localDate = new Date(`${dateStr}T12:00:00`)
    onUpdate(item.id, { due_date: localDate.toISOString() })
    setDatePickerOpen(false)
  }

  const handleClearDate = () => {
    onUpdate(item.id, { due_date: null })
    setDatePickerOpen(false)
  }

  const handleAssign = (userId: string) => {
    onUpdate(item.id, { assigned_to: userId === 'unassigned' ? null : userId })
  }

  const formatDueDate = (date: string) => {
    const d = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dueDate = new Date(d)
    dueDate.setHours(0, 0, 0, 0)

    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { text: 'Overdue', color: 'text-destructive' }
    if (diffDays === 0) return { text: 'Today', color: 'text-orange-500' }
    if (diffDays === 1) return { text: 'Tomorrow', color: 'text-yellow-600' }
    return { text: format(d, 'MMM d'), color: 'text-muted-foreground' }
  }

  const assignedMember = teamMembers?.find(m => m.user_id === item.assigned_to)?.profile || 
                        (item.assigned_to === currentUser?.id ? currentUser : null)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-start gap-3 p-4 rounded-lg border bg-card transition-all',
        isDragging && 'opacity-50 shadow-lg ring-2 ring-primary',
        item.is_completed && 'bg-muted/50'
      )}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className={cn(
          'mt-0.5 p-1 rounded cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground hover:bg-accent transition-colors touch-none',
          disabled && 'opacity-0 pointer-events-none'
        )}
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Checkbox */}
      <Checkbox
        checked={item.is_completed}
        onCheckedChange={(checked) => onToggle(item.id, !!checked)}
        className="mt-1"
        disabled={disabled}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        {isEditingTitle ? (
          <Input
            ref={titleInputRef}
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={handleTitleKeyDown}
            className="h-auto py-1 px-2 text-base font-medium"
            placeholder="Task title"
          />
        ) : (
          <div
            onClick={() => !disabled && setIsEditingTitle(true)}
            className={cn(
              'font-medium cursor-pointer hover:bg-accent/50 rounded px-2 py-1 -mx-2 transition-colors',
              item.is_completed && 'line-through text-muted-foreground'
            )}
          >
            {item.title}
          </div>
        )}

        {/* Meta info row */}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {/* Due Date */}
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-7 px-2 text-xs',
                  item.due_date && formatDueDate(item.due_date).color
                )}
                disabled={disabled}
              >
                <Calendar className="h-3 w-3 mr-1" />
                {item.due_date ? formatDueDate(item.due_date).text : 'Add date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="start">
              <div className="space-y-2">
                <div className="text-sm font-medium">Set due date</div>
                <Input
                  type="date"
                  value={item.due_date ? format(new Date(item.due_date), 'yyyy-MM-dd') : ''}
                  onChange={(e) => handleDateSelect(e.target.value)}
                  className="w-full"
                />
                {item.due_date && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-destructive"
                    onClick={handleClearDate}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear date
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Assignee */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground"
                disabled={disabled}
              >
                {assignedMember ? (
                  <>
                    <Avatar className="h-4 w-4 mr-1.5">
                      <AvatarImage src={assignedMember.avatar_url || undefined} />
                      <AvatarFallback className="text-[10px]">
                        {assignedMember.full_name?.charAt(0) || assignedMember.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {assignedMember.full_name || assignedMember.email?.split('@')[0]}
                  </>
                ) : (
                  <>
                    <UserIcon className="h-3 w-3 mr-1" />
                    Assign
                  </>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="start">
              <div className="p-2">
                <div className="text-sm font-medium mb-2 px-2">Assign to</div>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-8 px-2 text-sm font-normal"
                    onClick={() => handleAssign('unassigned')}
                  >
                    <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    Unassigned
                  </Button>
                  {currentUser && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-8 px-2 text-sm font-normal"
                      onClick={() => handleAssign(currentUser.id)}
                    >
                      <Avatar className="h-4 w-4 mr-2">
                        <AvatarImage src={currentUser.avatar_url || undefined} />
                        <AvatarFallback className="text-[10px]">
                          {currentUser.full_name?.charAt(0) || currentUser.email?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      Me
                    </Button>
                  )}
                  {teamMembers?.map((member) => (
                    <Button
                      key={member.id}
                      variant="ghost"
                      className="w-full justify-start h-8 px-2 text-sm font-normal"
                      onClick={() => handleAssign(member.user_id)}
                    >
                      <Avatar className="h-4 w-4 mr-2">
                        <AvatarImage src={member.profile.avatar_url || undefined} />
                        <AvatarFallback className="text-[10px]">
                          {member.profile.full_name?.charAt(0) || member.profile.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {member.profile.full_name || member.profile.email}
                    </Button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Expand/Collapse for description */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Hide details
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                {item.description ? 'Show details' : 'Add details'}
              </>
            )}
          </Button>
        </div>

        {/* Expanded Description */}
        {isExpanded && (
          <div className="mt-3 animate-fade-in">
            <Textarea
              value={descriptionValue}
              onChange={(e) => setDescriptionValue(e.target.value)}
              onBlur={handleDescriptionSave}
              placeholder="Add details, requirements, or helpful context..."
              className="min-h-[80px] resize-none text-sm"
              disabled={disabled}
            />
          </div>
        )}
      </div>

      {/* Delete Button */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0',
              disabled && 'hidden'
            )}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task
              "{item.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(item.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

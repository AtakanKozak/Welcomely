import { useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Calendar, ArrowRight, CheckCircle2, Circle, Users, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  useAssignedToMeTasks,
  useAssignedToOthersTasks,
  useToggleItemCompletion,
} from '@/hooks/use-checklists'
import { useToast } from '@/hooks/use-toast'

type AssignedTask = {
  id: string
  title: string
  due_date: string | null
  is_completed: boolean
  checklists: { id: string; title: string }
  assignee?: { id: string; full_name: string | null; email: string | null; avatar_url: string | null }
}

export function AssignedTasks() {
  const { data: myTasks, isLoading: loadingMine } = useAssignedToMeTasks()
  const { data: teammateTasks, isLoading: loadingOthers } = useAssignedToOthersTasks()
  const toggleCompletion = useToggleItemCompletion()
  const { toast } = useToast()
  
  // Track which tasks are currently being toggled for optimistic UI
  const [pendingToggles, setPendingToggles] = useState<Set<string>>(new Set())
  // Track optimistically completed tasks for instant UI feedback
  const [optimisticCompletions, setOptimisticCompletions] = useState<Set<string>>(new Set())

  const handleToggle = useCallback(async (id: string, isCompleted: boolean) => {
    // Immediately update UI
    setPendingToggles(prev => new Set(prev).add(id))
    
    if (isCompleted) {
      setOptimisticCompletions(prev => new Set(prev).add(id))
    } else {
      setOptimisticCompletions(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }

    try {
      await toggleCompletion.mutateAsync({ id, isCompleted })
      toast({
        title: isCompleted ? 'Task completed' : 'Task unmarked',
        description: isCompleted ? 'Great job! Keep it up.' : 'Task marked as incomplete.',
      })
    } catch (error) {
      // Rollback optimistic update
      if (isCompleted) {
        setOptimisticCompletions(prev => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      } else {
        setOptimisticCompletions(prev => new Set(prev).add(id))
      }
      toast({
        title: 'Error',
        description: 'Failed to update task status.',
        variant: 'destructive',
      })
    } finally {
      setPendingToggles(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }, [toggleCompletion, toast])

  if (loadingMine || loadingOthers) {
    return <TaskSkeleton />
  }

  // Filter out optimistically completed tasks from the list for instant removal
  const filteredMyTasks = (myTasks || []).filter(
    task => !optimisticCompletions.has(task.id)
  )
  const filteredTeammateTasks = (teammateTasks || []).filter(
    task => !optimisticCompletions.has(task.id)
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Assignments</CardTitle>
          <CardDescription>Stay on top of personal and team responsibilities.</CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="hidden sm:flex" asChild>
          <Link to="/checklists">
            View all
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <TaskSection
          title="Assigned to me"
          description="Tasks you need to complete"
          tasks={filteredMyTasks}
          emptyMessage="No tasks assigned to you yet."
          emptyCta={
            <Button variant="link" className="mt-1 h-auto p-0" asChild>
              <Link to="/checklists">Browse checklists</Link>
            </Button>
          }
          onToggle={handleToggle}
          pendingToggles={pendingToggles}
          showAssigneeLabel={false}
        />
        <TaskSection
          title="Assigned to teammates"
          description="Tasks you've delegated to others"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          tasks={filteredTeammateTasks}
          emptyMessage="No delegated tasks yet. Assign tasks to keep everyone accountable."
          emptyCta={
            <Button variant="link" className="mt-1 h-auto p-0" asChild>
              <Link to="/team">Invite teammates</Link>
            </Button>
          }
          onToggle={handleToggle}
          pendingToggles={pendingToggles}
          showAssigneeLabel
        />
      </CardContent>
    </Card>
  )
}

interface TaskSectionProps {
  title: string
  description: string
  tasks: AssignedTask[]
  emptyMessage: string
  emptyCta?: ReactNode
  onToggle: (id: string, isCompleted: boolean) => void
  pendingToggles: Set<string>
  showAssigneeLabel?: boolean
  icon?: React.ReactNode
}

function TaskSection({
  title,
  description,
  tasks,
  emptyMessage,
  emptyCta,
  onToggle,
  pendingToggles,
  showAssigneeLabel,
  icon,
}: TaskSectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div>
          <p className="text-sm font-semibold flex items-center gap-2">
            {icon}
            {title}
          </p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {tasks.length > 0 ? (
        <div className="space-y-3">
          {tasks.map((task) => {
            const isPending = pendingToggles.has(task.id)
            return (
              <div
                key={task.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/40 transition-all group",
                  isPending && "opacity-70"
                )}
              >
                <button
                  onClick={() => onToggle(task.id, !task.is_completed)}
                  disabled={isPending}
                  className={cn(
                    'mt-0.5 text-muted-foreground hover:text-primary transition-colors',
                    isPending && 'cursor-wait'
                  )}
                >
                  {isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : task.is_completed ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>
                <Avatar className="h-8 w-8 mt-0.5">
                  <AvatarImage src={task.assignee?.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {getAssigneeInitials(task.assignee)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col">
                    <span
                      className={cn(
                        'font-medium truncate',
                        task.is_completed && 'line-through text-muted-foreground'
                      )}
                    >
                      {task.title}
                    </span>
                    <Link
                      to={`/checklists/${task.checklists.id}`}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors truncate"
                    >
                      in {task.checklists.title}
                    </Link>
                  </div>
                  {showAssigneeLabel && task.assignee && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Assigned to {task.assignee.full_name || task.assignee.email}
                    </p>
                  )}
                </div>
                {task.due_date && (
                  <div
                    className={cn(
                      'flex items-center text-xs whitespace-nowrap px-2 py-1 rounded-full bg-muted',
                      isOverdue(task.due_date) && 'text-destructive bg-destructive/10',
                      isToday(task.due_date) && 'text-orange-500 bg-orange-500/10'
                    )}
                  >
                    <Calendar className="mr-1 h-3 w-3" />
                    {formatDate(task.due_date)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground text-sm">
          <p>{emptyMessage}</p>
          {emptyCta}
        </div>
      )}
    </div>
  )
}

function TaskSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function isOverdue(dateString: string) {
  if (!dateString) return false
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

function isToday(dateString: string) {
  if (!dateString) return false
  const date = new Date(dateString)
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

function formatDate(dateString: string) {
  if (!dateString) return 'No date'
  if (isToday(dateString)) return 'Today'
  return format(new Date(dateString), 'MMM d')
}

function getAssigneeInitials(
  assignee?: { full_name: string | null; email: string | null }
) {
  if (!assignee) return '??'
  if (assignee.full_name) {
    return assignee.full_name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }
  return assignee.email?.charAt(0)?.toUpperCase() || '?'
}

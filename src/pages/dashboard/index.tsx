import { Link } from 'react-router-dom'
import {
  CheckSquare,
  CheckCircle2,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
  MoreHorizontal,
  Calendar,
  AlertCircle,
  ListChecks,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/auth-store'
import {
  useChecklists,
  useDashboardStats,
  useUpcomingTasks,
  useDeleteChecklist,
  useCreateChecklist,
  useDuplicateChecklist,
} from '@/hooks/use-checklists'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { DashboardCharts } from '@/components/dashboard/dashboard-charts'
import { AssignedTasks } from '@/components/dashboard/assigned-tasks'
import { formatRelativeTime } from '@/lib/utils'
import { CHECKLIST_TEMPLATES } from '@/lib/templates-data'
import type { ChecklistWithItems } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'

// Stats Card Skeleton
function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  )
}

// Checklist Card Skeleton
function ChecklistCardSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
      <div className="flex-1 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-2 flex-1" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </div>
  )
}

// Task Skeleton
function TaskSkeleton() {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
      <Skeleton className="h-4 w-4 mt-0.5" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  )
}

// Calculate progress for a checklist
function calculateProgress(checklist: ChecklistWithItems) {
  const items = checklist.checklist_items || []
  if (items.length === 0) return { completed: 0, total: 0, percentage: 0 }
  const completed = items.filter(item => item.is_completed).length
  return {
    completed,
    total: items.length,
    percentage: Math.round((completed / items.length) * 100),
  }
}

// Format due date for tasks
function getDueDateMeta(dueDate: string) {
  const date = new Date(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const taskDate = new Date(date)
  taskDate.setHours(0, 0, 0, 0)

  const diffDays = Math.round((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return { label: 'Overdue', tone: 'text-destructive' }
  }

  if (diffDays === 0) {
    return { label: 'Today', tone: 'text-orange-500 dark:text-orange-400' }
  }

  if (diffDays === 1) {
    return { label: 'Tomorrow', tone: 'text-yellow-600 dark:text-yellow-400' }
  }

  if (diffDays > 1 && diffDays <= 7) {
    return { label: `In ${diffDays} days`, tone: 'text-muted-foreground' }
  }

  return {
    label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    tone: 'text-muted-foreground',
  }
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { profile } = useAuthStore()
  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats()
  const { data: checklists, isLoading: checklistsLoading, error: checklistsError } = useChecklists()
  const { data: upcomingTasks, isLoading: tasksLoading } = useUpcomingTasks()
  const deleteChecklist = useDeleteChecklist()
  const createChecklist = useCreateChecklist()
  const duplicateChecklist = useDuplicateChecklist()

  const recentChecklists = checklists?.slice(0, 4) || []
  const quickTemplates = CHECKLIST_TEMPLATES.slice(0, 3)

  const statsData = [
    {
      name: 'Total Checklists',
      value: stats?.totalChecklists ?? 0,
      change: `${stats?.inProgressChecklists ?? 0} in progress`,
      changeType: 'neutral' as const,
      icon: CheckSquare,
      link: '/checklists',
    },
    {
      name: 'Completed',
      value: stats?.completedChecklists ?? 0,
      change: stats?.totalChecklists 
        ? `${Math.round((stats.completedChecklists / stats.totalChecklists) * 100)}% completion rate`
        : '0% completion rate',
      changeType: 'positive' as const,
      icon: CheckCircle2,
      link: '/checklists?filter=completed',
    },
    {
      name: 'Total Tasks',
      value: stats?.totalItems ?? 0,
      change: `${stats?.pendingItems ?? 0} pending`,
      changeType: 'neutral' as const,
      icon: Clock,
      link: '/checklists',
    },
    {
      name: 'Assigned to Me',
      value: stats?.assignedCount ?? 0,
      change: 'Tasks for you',
      changeType: 'neutral' as const,
      icon: TrendingUp,
      link: '/checklists', // Ideally filter for assigned tasks
    },
  ]

  const handleDeleteChecklist = async (id: string) => {
    if (confirm('Are you sure you want to delete this checklist?')) {
      await deleteChecklist.mutateAsync(id)
      toast({
        title: 'Checklist deleted',
        description: 'The checklist was removed successfully.',
      })
    }
  }

  const handleQuickCreate = async () => {
    try {
      const checklist = await createChecklist.mutateAsync({
        title: 'Untitled Checklist',
        description: '',
      })
      toast({
        title: 'Checklist created',
        description: 'Redirecting you to the new checklist.',
      })
      navigate(`/checklists/${checklist.id}`)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create checklist.',
        variant: 'destructive',
      })
    }
  }

  const handleDuplicateChecklist = async (id: string) => {
    try {
      const duplicate = await duplicateChecklist.mutateAsync(id)
      toast({
        title: 'Checklist duplicated',
        description: `"${duplicate.title}" was duplicated successfully.`,
      })
      navigate(`/checklists/${duplicate.id}`)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to duplicate checklist.',
        variant: 'destructive',
      })
    }
  }

  const handleShareChecklist = async (id: string) => {
    try {
      const shareUrl = `${window.location.origin}/shared/${id}`
      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: 'Share link copied',
        description: 'Anyone with the link can view this checklist.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy share link.',
        variant: 'destructive',
      })
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const getMotivationalMessage = () => {
    if (!stats) return "Ready to be productive?"
    if (stats.completedChecklists > 0) return `Great job! You've completed ${stats.completedChecklists} checklists.`
    if (stats.inProgressChecklists > 0) return `Keep it up! You have ${stats.inProgressChecklists} checklists in progress.`
    return "Let's get some work done today!"
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {getGreeting()}, {firstName}! 👋
          </h1>
          <div className="flex items-center gap-2 mt-1 text-muted-foreground">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            <p>{getMotivationalMessage()}</p>
          </div>
        </div>
        <Button onClick={handleQuickCreate} disabled={createChecklist.isPending}>
          {createChecklist.isPending ? 'Creating...' : 'New Checklist'}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : statsError ? (
          <Card className="col-span-full">
            <CardContent className="flex items-center gap-2 py-4 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>Failed to load stats. Please try again.</span>
            </CardContent>
          </Card>
        ) : (
          statsData.map((stat) => (
            <Link key={stat.name} to={stat.link} className="block transition-transform hover:-translate-y-1">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.name}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className={`text-xs ${
                    stat.changeType === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                  }`}>
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Main Content Area (Left) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Assigned Tasks */}
          <AssignedTasks />

          {/* Recent Checklists */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Checklists</CardTitle>
                <CardDescription>Your recently updated checklists</CardDescription>
              </div>
              {checklists && checklists.length > 0 && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/checklists">
                    View all
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {checklistsLoading ? (
                <div className="space-y-4">
                  <ChecklistCardSkeleton />
                  <ChecklistCardSkeleton />
                  <ChecklistCardSkeleton />
                </div>
              ) : checklistsError ? (
                <div className="flex items-center gap-2 py-4 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>Failed to load checklists. Please try again.</span>
                </div>
              ) : recentChecklists.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="p-4 rounded-full bg-muted mb-4">
                    <ListChecks className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">No checklists yet</h3>
                  <p className="text-muted-foreground mb-4 max-w-sm">
                    Create your first checklist to start tracking onboarding tasks.
                  </p>
                  <CreateChecklistDialog
                    trigger={
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create your first checklist
                      </Button>
                    }
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {recentChecklists.map((checklist) => {
                    const progress = calculateProgress(checklist)
                    return (
                      <div
                        key={checklist.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Link 
                              to={`/checklists/${checklist.id}`}
                              className="font-medium truncate hover:text-primary transition-colors"
                            >
                              {checklist.title}
                            </Link>
                            {progress.percentage === 100 && (
                              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            {checklist.category && (
                              <>
                                <span>{checklist.category}</span>
                                <span>•</span>
                              </>
                            )}
                            <span>
                              {progress.completed}/{progress.total} tasks
                            </span>
                            <span>•</span>
                            <span>
                              {formatRelativeTime(checklist.updated_at)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-3">
                            <Progress value={progress.percentage} className="h-2 flex-1" />
                            <span className="text-xs font-medium w-8 text-right">
                              {progress.percentage}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/checklists/${checklist.id}`}>
                              Open
                            </Link>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                              <Button variant="ghost" size="icon" className="shrink-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/checklists/${checklist.id}`}>Edit</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDuplicateChecklist(checklist.id)}
                              >
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleShareChecklist(checklist.id)}
                              >
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDeleteChecklist(checklist.id)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dashboard Charts */}
          <DashboardCharts categoryStats={stats?.categoryStats || {}} />
        </div>

        {/* Sidebar (Right) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Upcoming Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Tasks
              </CardTitle>
              <CardDescription>Tasks due in the next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <div className="space-y-4">
                  <TaskSkeleton />
                  <TaskSkeleton />
                  <TaskSkeleton />
                </div>
              ) : !upcomingTasks || upcomingTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No upcoming tasks
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tasks with due dates will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingTasks.map((task: any) => {
                    const dueDateMeta = getDueDateMeta(task.due_date)
                    return (
                      <Link
                        key={task.id}
                        to={`/checklists/${task.checklists.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/40 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium truncate">{task.title}</p>
                            <Badge
                              variant={task.is_completed ? 'secondary' : 'outline'}
                              className="text-[11px] font-medium"
                            >
                              {task.is_completed ? 'Completed' : 'Pending'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {task.checklists.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs font-medium mt-1">
                            <span className={dueDateMeta.tone}>{dueDateMeta.label}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">
                              {task.is_completed ? 'Done' : 'Needs attention'}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`shrink-0 flex items-center justify-center h-8 w-8 rounded-full border ${
                            task.is_completed
                              ? 'border-primary/40 bg-primary/10 text-primary'
                              : 'border-muted-foreground/40 text-muted-foreground'
                          }`}
                        >
                          {task.is_completed ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <RecentActivity activities={stats?.recentActivity || []} />

          {/* Quick Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Templates</CardTitle>
              <CardDescription>Start with a popular template</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {quickTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="font-medium text-sm">{template.name}</p>
                      <p className="text-xs text-muted-foreground">{template.tasks.length} tasks</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/templates">View</Link>
                    </Button>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="w-full mt-2" asChild>
                  <Link to="/templates">Browse all templates</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

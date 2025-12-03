import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle2,
  Grid,
  List,
  AlertCircle,
  ListChecks,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils'
import { useChecklists, useDeleteChecklist, useDuplicateChecklist } from '@/hooks/use-checklists'
import { useDebounce } from '@/hooks/use-debounce'
import { CreateChecklistDialog } from '@/components/checklist/create-checklist-dialog'
import type { ChecklistWithItems } from '@/types'
import { useToast } from '@/hooks/use-toast'

// Skeleton for checklist card
function ChecklistCardSkeleton({ view }: { view: 'grid' | 'list' }) {
  return (
    <Card className={cn(view === 'list' && 'flex-row')}>
      <CardHeader className={cn(view === 'list' && 'flex-1')}>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </CardHeader>
      <CardContent className={cn(view === 'list' && 'flex items-center gap-6')}>
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-2 flex-1" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      </CardContent>
    </Card>
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

export function ChecklistsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Debounce search query with 300ms delay for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const { data: checklists, isLoading, error } = useChecklists()
  const deleteChecklist = useDeleteChecklist()
  const duplicateChecklist = useDuplicateChecklist()

  // Filter checklists with memoization for performance
  const filteredChecklists = useMemo(() => {
    return (checklists || []).filter((checklist) => {
      // Search filter using debounced query
      if (debouncedSearchQuery) {
        const query = debouncedSearchQuery.toLowerCase()
        const matchesTitle = checklist.title.toLowerCase().includes(query)
        const matchesDescription = checklist.description?.toLowerCase().includes(query)
        const matchesCategory = checklist.category?.toLowerCase().includes(query)
        if (!matchesTitle && !matchesDescription && !matchesCategory) {
          return false
        }
      }

      // Status filter
      const progress = calculateProgress(checklist)
      if (filter === 'completed') return progress.percentage === 100
      if (filter === 'in-progress') return progress.percentage > 0 && progress.percentage < 100
      if (filter === 'not-started') return progress.percentage === 0 && progress.total > 0
      if (filter === 'empty') return progress.total === 0
      return true
    })
  }, [checklists, debouncedSearchQuery, filter])

  const handleCardClick = (checklistId: string) => {
    navigate(`/checklists/${checklistId}`)
  }

  const handleDeleteChecklist = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation() // Prevent card click
    if (confirm('Are you sure you want to delete this checklist?')) {
      await deleteChecklist.mutateAsync(id)
      toast({
        title: 'Checklist deleted',
        description: 'The checklist has been removed.',
      })
    }
  }

  const handleDuplicateChecklist = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      const duplicate = await duplicateChecklist.mutateAsync(id)
      toast({
        title: 'Checklist duplicated',
        description: `"${duplicate.title}" duplicated successfully.`,
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

  const handleShareChecklist = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      const shareUrl = `${window.location.origin}/shared/${id}`
      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: 'Share link copied',
        description: 'Send this link to share the checklist.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy share link.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Checklists</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your onboarding checklists
          </p>
        </div>
        <CreateChecklistDialog />
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search checklists..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="not-started">Not Started</SelectItem>
              <SelectItem value="empty">Empty</SelectItem>
            </SelectContent>
          </Select>
          <Tabs value={view} onValueChange={(v) => setView(v as 'grid' | 'list')}>
            <TabsList className="grid w-20 grid-cols-2">
              <TabsTrigger value="grid" className="px-2">
                <Grid className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="list" className="px-2">
                <List className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className={cn(
          view === 'grid'
            ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
            : 'space-y-4'
        )}>
          <ChecklistCardSkeleton view={view} />
          <ChecklistCardSkeleton view={view} />
          <ChecklistCardSkeleton view={view} />
          <ChecklistCardSkeleton view={view} />
          <ChecklistCardSkeleton view={view} />
          <ChecklistCardSkeleton view={view} />
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="p-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-4 rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Failed to load checklists</h3>
              <p className="text-muted-foreground mt-1">
                Something went wrong. Please try again.
              </p>
            </div>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </Card>
      )}

      {/* Checklists Grid/List */}
      {!isLoading && !error && filteredChecklists.length > 0 && (
        <div className={cn(
          view === 'grid'
            ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
            : 'space-y-4'
        )}>
          {filteredChecklists.map((checklist) => {
            const progress = calculateProgress(checklist)
            return (
              <Card
                key={checklist.id}
                onClick={() => handleCardClick(checklist.id)}
                className={cn(
                  'transition-all hover:shadow-lg hover:border-primary/50 group cursor-pointer',
                  view === 'list' && 'flex-row'
                )}
              >
                <CardHeader className={cn(view === 'list' && 'flex-1')}>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors flex items-center gap-2">
                        <span className="truncate">
                          {checklist.title}
                        </span>
                        {progress.percentage === 100 && (
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        )}
                      </CardTitle>
                      {checklist.description && (
                        <CardDescription className="line-clamp-2">
                          {checklist.description}
                        </CardDescription>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleCardClick(checklist.id); }}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleDuplicateChecklist(e, checklist.id)}>
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleShareChecklist(e, checklist.id)}>
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => handleDeleteChecklist(e, checklist.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className={cn(view === 'list' && 'flex items-center gap-6')}>
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                      {checklist.category && (
                        <span className="px-2 py-0.5 bg-secondary rounded-full text-xs">
                          {checklist.category}
                        </span>
                      )}
                      <span>{progress.completed}/{progress.total} tasks</span>
                      <span>•</span>
                      <span>{formatRelativeTime(checklist.updated_at)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={progress.percentage} className="h-2 flex-1" />
                      <span className="text-sm font-medium w-12 text-right">
                        {progress.percentage}%
                      </span>
                    </div>
                  </div>
                  {view === 'list' && (
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleCardClick(checklist.id); }}>
                      Open
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && checklists && checklists.length === 0 && (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-muted">
              <ListChecks className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">No checklists yet</h3>
              <p className="text-muted-foreground mt-1">
                Create your first checklist to start tracking onboarding tasks.
              </p>
            </div>
            <CreateChecklistDialog
              trigger={
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first checklist
                </Button>
              }
            />
          </div>
        </Card>
      )}

      {/* No Results State */}
      {!isLoading && !error && checklists && checklists.length > 0 && filteredChecklists.length === 0 && (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-muted">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">No results found</h3>
              <p className="text-muted-foreground mt-1">
                Try adjusting your search or filter to find what you're looking for.
              </p>
            </div>
            <Button variant="outline" onClick={() => { setSearchQuery(''); setFilter('all'); }}>
              Clear filters
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

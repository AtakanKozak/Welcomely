import { useParams, Link } from 'react-router-dom'
import { usePublicChecklist } from '@/hooks/use-checklists'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

function SharedChecklistSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 p-6 md:p-10">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-2 w-full" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  )
}

export function SharedChecklistPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, error } = usePublicChecklist(id!)

  if (isLoading) {
    return <SharedChecklistSkeleton />
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center space-y-4">
          <div className="p-4 rounded-full bg-destructive/10 inline-flex">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Checklist unavailable</h1>
            <p className="text-sm text-muted-foreground mt-2">
              This checklist is either private or no longer exists.
            </p>
          </div>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Welcomely
            </Link>
          </Button>
        </Card>
      </div>
    )
  }

  const items = data.checklist_items || []
  const completedCount = items.filter((item) => item.is_completed).length
  const totalCount = items.length
  const progress = totalCount ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <div className="space-y-3 text-center">
          <p className="text-xs uppercase tracking-wide text-primary font-semibold">Shared checklist</p>
          <h1 className="text-3xl font-bold">{data.title}</h1>
          {data.description && (
            <p className="text-muted-foreground">{data.description}</p>
          )}
          {data.category && (
            <p className="text-sm text-primary/80 font-medium">{data.category}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{completedCount} of {totalCount} tasks completed</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                'rounded-lg border bg-card px-4 py-3',
                item.is_completed && 'border-green-500/40 bg-green-500/5'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className={cn('font-medium', item.is_completed && 'line-through text-muted-foreground')}>
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  )}
                </div>
                {item.is_completed && (
                  <span className="text-xs font-semibold text-green-600">Done</span>
                )}
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <Card className="p-6 text-center text-muted-foreground">
              No tasks added to this checklist yet.
            </Card>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Read-only view powered by Welcomely.
        </p>
      </div>
    </div>
  )
}



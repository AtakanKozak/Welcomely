import { CheckCircle2, Clock } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ActivityItem {
  id: string
  title: string
  updated_at: string
  checklists: { title: string } | { title: string }[] | null
}

interface RecentActivityProps {
  activities: ActivityItem[]
}

function getChecklistTitle(checklists: ActivityItem['checklists']): string {
  if (!checklists) return 'Unknown'
  if (Array.isArray(checklists)) return checklists[0]?.title || 'Unknown'
  return checklists.title
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent activity
            </p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 text-sm">
                <div className="mt-0.5 rounded-full bg-green-100 p-1 dark:bg-green-900/30">
                  <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-foreground">
                    Completed <span className="font-medium">{activity.title}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    in {getChecklistTitle(activity.checklists)} • {formatRelativeTime(activity.updated_at)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}


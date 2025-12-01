import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Loader2, CheckCircle2 } from 'lucide-react'

import { CHECKLIST_TEMPLATES, type ChecklistTemplate } from '@/lib/templates-data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useApplyTemplate } from '@/hooks/use-checklists'

const categories = ['All', ...Array.from(new Set(CHECKLIST_TEMPLATES.map((t) => t.category)))]

export function TemplatesPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const applyTemplate = useApplyTemplate()
  const navigate = useNavigate()

  const filteredTemplates = useMemo(() => {
    return CHECKLIST_TEMPLATES.filter((template) => {
      const matchesCategory = category === 'All' || template.category === category
      const matchesSearch =
        template.name.toLowerCase().includes(search.toLowerCase()) ||
        template.description.toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [search, category])

  const handleUseTemplate = async (template: ChecklistTemplate) => {
    setSuccessMessage(null)
    setErrorMessage(null)
    try {
      const checklist = await applyTemplate.mutateAsync(template)
      setSuccessMessage(`"${template.name}" added to your checklists.`)
      navigate(`/checklists/${checklist.id}`)
    } catch (error: any) {
      console.error('Failed to apply template:', error)
      setErrorMessage(error?.message || 'Failed to apply template. Please try again.')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-primary font-semibold">Template marketplace</p>
          <h1 className="text-3xl font-bold mt-1">Kickstart your onboarding in minutes</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Browse curated checklist templates built for HR, customer success, sales, and product teams. Customize any template in seconds and collaborate with your team.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full md:w-[220px]">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {successMessage && (
          <div className="flex items-center gap-3 rounded-md border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-300">
            <CheckCircle2 className="h-4 w-4" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center gap-3 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {filteredTemplates.map((template) => {
          const isLoading =
            applyTemplate.isPending && applyTemplate.variables?.id === template.id

          return (
            <Card key={template.id} className="flex flex-col border-muted hover:shadow-lg transition-shadow">
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">{template.name}</CardTitle>
                    <CardDescription className="mt-1 text-sm">
                      {template.description}
                    </CardDescription>
                  </div>
                  <Badge>{template.category}</Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{template.tasks.length} tasks</span>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col space-y-4">
                <div className="space-y-3">
                  {template.tasks.slice(0, 4).map((task, index) => (
                    <div
                      key={`${template.id}-task-${index}`}
                      className="flex items-start gap-3 rounded-md border bg-muted/30 px-3 py-2"
                    >
                      <span className="mt-0.5 text-xs font-semibold text-muted-foreground">
                        {index + 1}.
                      </span>
                      <div>
                        <p className="text-sm font-medium">{task.title}</p>
                        {task.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {template.tasks.length > 4 && (
                    <p className="text-xs text-muted-foreground">
                      + {template.tasks.length - 4} more tasks included
                    </p>
                  )}
                </div>

                <Button
                  className="mt-auto"
                  onClick={() => handleUseTemplate(template)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding template...
                    </>
                  ) : (
                    'Use Template'
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <Card className="p-12 text-center">
          <div className="space-y-3">
            <p className="text-lg font-semibold">No templates found</p>
            <p className="text-muted-foreground">
              Try adjusting your search or filter to find what you need.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}


